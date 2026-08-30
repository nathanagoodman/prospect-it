import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAllowlistedAdmin } from "@/lib/admin-emails";

export { isAllowlistedAdmin };

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Resolves the current admin user, or null if the caller is not an admin.
 *
 * Checks the database rather than trusting the JWT alone, so revoking a
 * user's ADMIN role takes effect immediately instead of when their token
 * expires. The env allowlist is honoured as a break-glass path.
 */
export async function getAdminUser(): Promise<AdminSessionUser | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || !user.email) return null;

  const authorized = user.role === "ADMIN" || isAllowlistedAdmin(user.email);
  if (!authorized) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function isAdminRequest(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}
