import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Pro Spec IQ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side gate. The middleware also checks, but this is the
  // authoritative check because it reads the current DB role.
  const admin = await getAdminUser();
  if (!admin) redirect("/app");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/app" className="flex items-center gap-2">
              <span className="text-lg font-extralight tracking-tight text-slate-900">
                PRO SPEC
              </span>
              <span className="text-lg font-black tracking-tight text-orange-500">
                IQ
              </span>
            </Link>
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:block">
              {admin.email}
            </span>
            <Link
              href="/app"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to app
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
