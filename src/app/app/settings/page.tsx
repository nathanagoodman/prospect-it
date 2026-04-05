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
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Your company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
          </div>

          {/* User Tier Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Account Type</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Choose your account type. This determines your available features and dashboard.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTierChange("GC")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tier === "GC"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-300 hover:border-orange-300"
                  }`}
                >
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="font-bold text-slate-900">GC</div>
                  <div className="text-xs text-slate-600 mt-1">General Contractor</div>
                </button>

                <button
                  onClick={() => handleTierChange("TRADE")}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.tier === "TRADE"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-300 hover:border-orange-300"
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-slate-900">Trade</div>
                  <div className="text-xs text-slate-600 mt-1">Specialized Contractor</div>
                </button>
              </div>

              {showTierWarning && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-3">
                    ⚠️ Changing your account type will affect your dashboard and available features.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={confirmTierChange}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium text-sm transition-colors"
                    >
                      Confirm Change
                    </button>
                    <button
                      onClick={() => setShowTierWarning(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trade Toggles Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Trade Specialties</h2>
            <p className="text-sm text-slate-600 mb-6">
              Select all trades you work in. These will appear on your dashboard.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALL_TRADES.map((trade) => {
                const isEnabled = enabledTrades.includes(trade);
                return (
                  <button
                    key={trade}
                    onClick={() => toggleTrade(trade)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      isEnabled
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-300 bg-slate-50 hover:border-slate-400"
                    }`}
                  >
                    <span className="text-2xl">{TRADE_ICONS[trade]}</span>
                    <span className={`text-xs font-medium capitalize ${isEnabled ? "text-orange-700" : "text-slate-700"}`}>
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
          <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-8">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Actions</h3>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-slate-600">Account Type</p>
                  <p className="font-medium text-slate-900">{formData.tier || user.tier}</p>
                </div>
                <div>
                  <p className="text-slate-600">Active Trades</p>
                  <p className="font-medium text-slate-900">{enabledTrades.length} selected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
