"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  phone: string | null;
  tier: "GC" | "TRADE";
  tradeType: string | null;
  enabledTrades: string[];
}

const ALL_TRADES = [
  "electrical",
  "plumbing",
  "hvac",
  "roofing",
  "framing",
  "drywall",
  "painting",
  "flooring",
  "masonry",
  "concrete",
  "landscaping",
  "carpentry",
  "general",
  "steel",
  "demolition",
];

const TRADE_ICONS: { [key: string]: string } = {
  electrical: "⚡",
  plumbing: "🔧",
  hvac: "❄️",
  roofing: "🏠",
  framing: "🪵",
  drywall: "📋",
  painting: "🎨",
  flooring: "🪚",
  masonry: "🧱",
  concrete: "🪨",
  landscaping: "🌳",
  carpentry: "🔨",
  general: "🏗️",
  steel: "⚙️",
  demolition: "💥",
};

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [enabledTrades, setEnabledTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTierWarning, setShowTierWarning] = useState(false);
  const [newTier, setNewTier] = useState<"GC" | "TRADE" | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data: UserData = await res.json();
          setUser(data);
          setFormData({
            name: data.name,
            email: data.email,
            company: data.company,
            phone: data.phone,
            tier: data.tier,
            tradeType: data.tradeType,
          });
          setEnabledTrades(data.enabledTrades || []);
        }
      } catch (err) {
        setError("Failed to load user data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const toggleTrade = (trade: string) => {
    setEnabledTrades((prev) =>
      prev.includes(trade)
        ? prev.filter((t) => t !== trade)
        : [...prev, trade]
    );
  };

  const handleTierChange = (newTierValue: "GC" | "TRADE") => {
    if (newTierValue !== user?.tier) {
      setNewTier(newTierValue);
      setShowTierWarning(true);
    }
  };

  const confirmTierChange = () => {
    if (newTier) {
      setFormData({ ...formData, tier: newTier });
      setShowTierWarning(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value || null });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          enabledTrades,
        }),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setSuccess("Settings saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to save settings");
      }
    } catch (err) {
      setError("An error occurred while saving");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center text-slate-500">User data not found</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium mt-2">Manage your profile and preferences</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Profile</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* User Tier Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Account Type</h2>
            <div className="space-y-6">
              <p className="text-sm text-slate-600 font-medium">
                Choose your account type. This determines your available features and dashboard.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTierChange("GC")}
                  className={`p-6 border-2 rounded-xl transition-all flex flex-col items-center gap-3 ${
                    formData.tier === "GC"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  </svg>
                  <div className="font-black tracking-tight text-slate-900">GC</div>
                  <div className="text-xs text-slate-600 font-medium">General Contractor</div>
                </button>

                <button
                  onClick={() => handleTierChange("TRADE")}
                  className={`p-6 border-2 rounded-xl transition-all flex flex-col items-center gap-3 ${
                    formData.tier === "TRADE"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <div className="font-black tracking-tight text-slate-900">Trade</div>
                  <div className="text-xs text-slate-600 font-medium">Specialized Contractor</div>
                </button>
              </div>

              {showTierWarning && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-900 font-semibold mb-4">
                    Changing your account type will affect your dashboard and available features.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmTierChange}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      Confirm Change
                    </button>
                    <button
                      onClick={() => setShowTierWarning(false)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trade Toggles Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Trade Specialties</h2>
            <p className="text-sm text-slate-600 font-medium mb-6">
              Select all trades you work in. These will appear on your dashboard.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_TRADES.map((trade) => {
                const isEnabled = enabledTrades.includes(trade);
                return (
                  <button
                    key={trade}
                    onClick={() => toggleTrade(trade)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      isEnabled
                        ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{TRADE_ICONS[trade]}</span>
                    <span className={`text-xs font-semibold capitalize ${isEnabled ? "text-orange-700" : "text-slate-700"}`}>
                      {trade}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Save Button */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sticky top-8 shadow-sm">
            <h3 className="text-sm font-black tracking-tight text-slate-900 mb-4">Actions</h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-black tracking-tight text-slate-900 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600 font-medium">Account Type</p>
                  <p className="font-semibold text-slate-900 mt-1">{formData.tier || user.tier}</p>
                </div>
                <div>
                  <p className="text-slate-600 font-medium">Active Trades</p>
                  <p className="font-semibold text-slate-900 mt-1">{enabledTrades.length} selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
