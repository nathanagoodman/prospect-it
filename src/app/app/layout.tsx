"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import { NavIcon, TradeIcon } from "@/components/icons";

interface UserData {
  tier: "GC" | "TRADE";
  tradeType?: string;
  enabledTrades: string[];
  name?: string;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const baseNavItems: NavItem[] = [
    { href: "/app", label: "Dashboard", icon: "dashboard" },
    { href: "/app/bids", label: "Bids", icon: "bids" },
    { href: "/app/invoices", label: "Invoices", icon: "invoices" },
    { href: "/app/jobs", label: "Jobs", icon: "jobs" },
    { href: "/app/clients", label: "Clients", icon: "clients" },
    // Email sequences are intentionally hidden: the page has no API behind
    // it and everything the user builds is lost on refresh. Restore this
    // once /api/email-sequences and the send scheduler exist.
    // { href: "/app/email", label: "Email", icon: "✉️" },
  ];

  const navItems = user?.tier === "GC" ? [...baseNavItems, { href: "/app/subs", label: "Subs", icon: "subs" }] : baseNavItems;

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50">
        <div className="fixed left-0 top-0 h-screen bg-slate-900 w-16 z-40 hidden md:block"></div>
        <div className="flex-1 md:ml-16 flex items-center justify-center">
          <div className="text-slate-400 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 flex-col hidden md:flex ${
          sidebarExpanded ? "w-60" : "w-16"
        }`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-center border-b border-slate-800/80">
          {sidebarExpanded ? (
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-white">PRO</span>
              <span className="text-base font-black text-orange-500">SPEC</span>
              <span className="text-xs font-bold text-slate-500 ml-0.5">IQ</span>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21L12 3L21 21H3Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
                <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* User Tier Badge */}
        {sidebarExpanded && user && (
          <div className="px-4 py-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              {user.tier === "GC" ? (
                <span className="inline-block px-3 py-1 bg-slate-700 text-white text-xs font-bold rounded-full">
                  GC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                  <TradeIcon trade={user.tradeType || "general"} className="w-3.5 h-3.5" />
                  {user.tradeType ? user.tradeType.charAt(0).toUpperCase() + user.tradeType.slice(1) : "Trade"}
                </span>
              )}
            </div>
            {user.enabledTrades && user.enabledTrades.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {user.enabledTrades.slice(0, 4).map((trade) => (
                  <span key={trade} title={trade} className="text-slate-400">
                    <TradeIcon trade={trade} className="w-4 h-4" />
                  </span>
                ))}
                {user.enabledTrades.length > 4 && (
                  <span className="text-xs text-slate-400">+{user.enabledTrades.length - 4}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full px-4 py-4 flex items-center gap-3 transition-colors ${
                  active
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={sidebarExpanded ? "" : item.label}
              >
                <NavIcon name={item.icon} className="w-5 h-5 flex-shrink-0" />
                {sidebarExpanded && <span className="text-sm font-semibold">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-800/80 p-3 space-y-1">
          <button
            onClick={() => router.push("/app/settings")}
            className="w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm flex items-center justify-center transition-colors"
            title="Settings"
          >
            <NavIcon name="settings" className="w-5 h-5 shrink-0" />
            {sidebarExpanded && <span className="ml-2">Settings</span>}
          </button>
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm flex items-center justify-center transition-colors"
            title={sidebarExpanded ? "Collapse" : "Expand"}
          >
            {sidebarExpanded ? "←" : "→"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors font-medium"
          >
            {sidebarExpanded ? (
              "Logout"
            ) : (
              <NavIcon name="logout" className="w-5 h-5 mx-auto" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarExpanded ? "md:ml-60" : "md:ml-16"
        }`}
      >
        <SubscriptionBanner
          plan={user?.subscriptionPlan || null}
          status={user?.subscriptionStatus || null}
        />
        {/* pb-20 on mobile keeps content clear of the bottom nav */}
        <main className="h-screen overflow-auto pb-20 md:pb-0">{children}</main>
      </div>

      {/* ─── Mobile bottom navigation ───────────────────────────
          Contractors use this on a phone at the job site. A bottom bar
          is thumb-reachable one-handed; the desktop icon rail is not. */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-900 pb-safe md:hidden">
        <div className="flex">
          {navItems.slice(0, 4).map((item) => {
            const active = isActive(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
                  active ? "text-orange-400" : "text-slate-400"
                }`}
              >
                <NavIcon name={item.icon} className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => router.push("/app/settings")}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
              isActive("/app/settings") ? "text-orange-400" : "text-slate-400"
            }`}
          >
            <NavIcon name="settings" className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
