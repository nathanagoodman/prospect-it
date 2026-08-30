import Link from "next/link";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-3 text-6xl font-black tracking-tight text-orange-500">
          404
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-600">
          That page doesn&apos;t exist, or it may have moved.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Go home
          </Link>
          <Link
            href="/app"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open the app
          </Link>
        </div>
      </div>
    </div>
  );
}
