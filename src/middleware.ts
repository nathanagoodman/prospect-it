import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { adminAllowlist } from "@/lib/admin-emails";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const path = request.nextUrl.pathname;

  if (!token) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, request.url)
    );
  }

  // /admin additionally requires admin rights. Without this, any signed-in
  // user could load the admin shell. The API routes re-check against the
  // database, which is the authoritative gate.
  if (path.startsWith("/admin")) {
    const email = (token.email as string | undefined)?.trim().toLowerCase();
    const isAdmin =
      token.role === "ADMIN" ||
      (!!email && adminAllowlist().includes(email));

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return NextResponse.next();
}

// Scoped to the gated sections only, so the JWT isn't decrypted on every
// static asset and public API request.
export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
