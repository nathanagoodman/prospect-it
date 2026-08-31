import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { logActivity } from "./activity";

/** Current terms version. Bump when terms change so acceptance is re-stamped. */
export const TOS_VERSION = "2026-04-05";

/** How long a cached role in the JWT is trusted before re-reading the DB. */
const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Only register Google when it's actually configured. The non-null
    // assertions here previously registered a provider with empty
    // credentials, so the button rendered and every click failed. With
    // this, NextAuth simply doesn't advertise Google until the env vars
    // exist — and the sign-in pages hide the button to match.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Registration stores emails lowercased, and Postgres lookups are
        // case-sensitive — normalize here or "Nathan@X.com" can never log in.
        const email = credentials.email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      // Refresh the role from the database when it's missing (Google OAuth
      // sign-ins carry no role) or when the cached copy is older than the
      // TTL. Without the TTL, promoting or demoting an admin wouldn't take
      // effect until their token expired.
      //
      // Any throw inside this callback makes NextAuth treat the session as
      // invalid and silently signs the user out, so failures must never
      // escape this try/catch.
      const checkedAt = token.roleCheckedAt ?? 0;
      const stale = Date.now() - checkedAt > ROLE_REFRESH_MS;

      if (token.email && (!token.role || !token.id || stale)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: (token.email as string).toLowerCase() },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.roleCheckedAt = Date.now();
          }
        } catch (error) {
          console.error("[auth] jwt callback lookup failed:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? "USER";
        session.user.id = token.id ?? "";
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Stamp TOS acceptance for OAuth signups
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            tosAcceptedAt: new Date(),
            privacyAcceptedAt: new Date(),
            tosVersion: TOS_VERSION,
          },
        });
        await logActivity(user.id, "signup", { provider: "oauth" });

        // If this email was on the waitlist, mark that lead converted.
        if (user.email) {
          await prisma.waitlistEntry.updateMany({
            where: {
              email: user.email.toLowerCase(),
              stage: { not: "CONVERTED" },
            },
            data: {
              stage: "CONVERTED",
              convertedAt: new Date(),
              convertedUserId: user.id,
            },
          });
        }
      } catch (error) {
        console.error("[auth] createUser event failed:", error);
      }
    },
    async signIn({ user }) {
      if (user?.id) await logActivity(user.id, "login");
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
};
