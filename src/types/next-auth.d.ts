import type { DefaultSession } from "next-auth";

/**
 * Module augmentation for NextAuth.
 *
 * Without this, `session.user.id` and `session.user.role` don't exist on the
 * default types, which is why call sites across the app resort to
 * `(session.user as any).id`. With it, those casts can be dropped.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    /** Epoch ms of the last role refresh from the database. */
    roleCheckedAt?: number;
  }
}
