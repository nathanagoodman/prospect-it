"use client";

import { useState, useEffect, useRef } from "react";

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

interface CompanyProfile {
  companyName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;
  logoBase64: string | null;
  accentColor: string;
  paymentTerms: string | null;
  defaultNotes: string | null;
  footerText: string | null;
}

const ALL_TRADES = [
  "electrical", "plumbing", "hvac", "roofing", "framing", "drywall",
  "painting", "flooring", "masonry", "concrete", "landscaping",
  "carpentry", "general", "steel", "demolition",
];

const TRADE_ICONS: { [key: string]: string } = {
  electrical: "⚡", plumbing: "🔧", hvac: "❄️", roofing: "🏠",
  framing: "🪵", drywall: "📋", painting: "🎨", flooring: "🪚",
  masonry: "🧱", concrete: "🪨", landscaping: "🌳", carpentry: "🔨",
  general: "🏗️", steel: "⚙️", demolition: "💥",
};

const COLOR_PRESETS = [
  "#f97316", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6",
  "#06b6d4", "#f59e0b", "#ec4899", "#6366f1", "#14b8a6",
];

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [enabledTrades, setEnabledTrades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTierWarning, setShowTierWarning] = useState(false);
  const [newTier, setNewTier] = useState<"GC" | "TRADE" | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "branding">("profile");

  // Company branding state
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: null, address: null, city: null, state: null, zip: null,
    phone: null, email: null, website: null, licenseNumber: null,
    logoBase64: null, accentColor: "#f97316", paymentTerms: null,
    defaultNotes: null, footerText: null,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          fetch("/api/user/settings"),
          fetch("/api/company-profile"),
        ]);
        if (userRes.ok) {
          const data: UserData = await userRes.json();
          setUser(data);
          setFormData({
            name: data.name, email: data.email, company: data.company,
            phone: data.phone, tier: data.tier, tradeType: data.tradeType,
          });
          setEnabledTrades(data.enabledTrades || []);
        }
        if (profileRes.ok) {
          const pData = await profileRes.json();
          setProfile(pData);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleTrade = (trade: string) => {
    setEnabledTrades((prev) =>
      prev.includes(trade) ? prev.filter((t) => t !== trade) : [...prev, trade]
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
        body: JSON.stringify({ ...formData, enabledTrades }),
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value || null });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500000) {
      setError("Logo must be under 500KB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/company-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setSuccess("Company profile saved!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to save company profile");
      }
    } catch (err) {
      setError("An error occurred");
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 sm:p-8"><div className="text-center text-slate-500">User data not found</div></div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium mt-2">Manage your profile, branding, and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">{error}</div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm font-medium">{success}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white rounded-xl border border-slate-200 p-1 w-fit">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "profile" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Profile &amp; Account
        </button>
        <button
          onClick={() => setActiveTab("branding")}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "branding" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Company Branding
        </button>
      </div>

      {activeTab === "profile" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Profile</h2>
              <div className="space-y-6">
                {[
                  { label: "Name", name: "name", type: "text", placeholder: "Your name" },
                  { label: "Email", name: "email", type: "email", placeholder: "your@email.com" },
                  { label: "Company", name: "company", type: "text", placeholder: "Your company" },
                  { label: "Phone", name: "phone", type: "tel", placeholder: "(555) 000-0000" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={(formData as any)[field.name] || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Account Type</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">Choose your account type. This determines your available features and dashboard.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { tier: "GC" as const, label: "GC", sub: "General Contractor", icon: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" },
                  { tier: "TRADE" as const, label: "Trade", sub: "Specialized Contractor", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
                ].map(({ tier, label, sub, icon }) => (
                  <button
                    key={tier}
                    onClick={() => handleTierChange(tier)}
                    className={`p-6 border-2 rounded-xl transition-all flex flex-col items-center gap-3 ${
                      formData.tier === tier ? "border-orange-500 bg-orange-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                    <div className="font-black tracking-tight text-slate-900">{label}</div>
                    <div className="text-xs text-slate-600 font-medium">{sub}</div>
                  </button>
                ))}
              </div>
              {showTierWarning && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-900 font-semibold mb-4">Changing your account type will affect your dashboard and available features.</p>
                  <div className="flex gap-3">
                    <button onClick={confirmTierChange} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors">Confirm Change</button>
                    <button onClick={() => setShowTierWarning(false)} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors hover:bg-slate-50">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Trade Toggles */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Trade Specialties</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">Select all trades you work in.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALL_TRADES.map((trade) => {
                  const isEnabled = enabledTrades.includes(trade);
                  return (
                    <button
                      key={trade}
                      onClick={() => toggleTrade(trade)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isEnabled ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500" : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{TRADE_ICONS[trade]}</span>
                      <span className={`text-xs font-semibold capitalize ${isEnabled ? "text-orange-700" : "text-slate-700"}`}>{trade}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
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
      ) : (
        /* Company Branding Tab */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Logo Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Company Logo</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">Upload your logo to appear on estimates and invoices. Max 500KB, PNG or JPG.</p>
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden flex-shrink-0">
                  {profile.logoBase64 ? (
                    <img src={profile.logoBase64} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/png,image/jpeg,image/svg+xml" className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition-colors"
                  >
                    Upload Logo
                  </button>
                  {profile.logoBase64 && (
                    <button
                      onClick={() => setProfile({ ...profile, logoBase64: null })}
                      className="px-5 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">Company Information</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Company Name", name: "companyName", placeholder: "Acme Construction LLC" },
                    { label: "License Number", name: "licenseNumber", placeholder: "LIC-123456" },
                    { label: "Phone", name: "phone", placeholder: "(555) 000-0000" },
                    { label: "Email", name: "email", placeholder: "billing@company.com" },
                    { label: "Website", name: "website", placeholder: "www.company.com" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{field.label}</label>
                      <input
                        type="text"
                        name={field.name}
                        value={(profile as any)[field.name] || ""}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                  <input
                    type="text" name="address" value={profile.address || ""} onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                    <input type="text" name="city" value={profile.city || ""} onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                    <input type="text" name="state" value={profile.state || ""} onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" placeholder="State" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">ZIP</label>
                    <input type="text" name="zip" value={profile.zip || ""} onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white" placeholder="ZIP" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Color */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Document Accent Color</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">Choose a color for headers and accents on your estimates and invoices.</p>
              <div className="flex flex-wrap gap-3">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setProfile({ ...profile, accentColor: color })}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      profile.accentColor === color ? "ring-2 ring-offset-2 ring-slate-900 scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="flex items-center gap-2 ml-2">
                  <input
                    type="color"
                    value={profile.accentColor || "#f97316"}
                    onChange={(e) => setProfile({ ...profile, accentColor: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0"
                  />
                  <span className="text-xs text-slate-500 font-mono">{profile.accentColor}</span>
                </div>
              </div>
            </div>

            {/* Payment Terms & Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">Default Document Text</h2>
              <p className="text-sm text-slate-600 font-medium mb-6">Set default text that appears on every estimate and invoice. You can override per document.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Terms</label>
                  <textarea
                    name="paymentTerms" value={profile.paymentTerms || ""} onChange={handleProfileChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                    placeholder="Net 30. Payment due within 30 days of invoice date. Late payments subject to 1.5% monthly interest."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Default Notes</label>
                  <textarea
                    name="defaultNotes" value={profile.defaultNotes || ""} onChange={handleProfileChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                    placeholder="Thank you for your business! Please don't hesitate to reach out with any questions."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Footer Text</label>
                  <textarea
                    name="footerText" value={profile.footerText || ""} onChange={handleProfileChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white resize-none"
                    placeholder="Licensed & Insured | Serving the Greater Metro Area since 2015"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sticky top-8 shadow-sm space-y-6">
              <h3 className="text-sm font-black tracking-tight text-slate-900">Save Branding</h3>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-xl font-medium transition-colors"
              >
                {savingProfile ? "Saving..." : "Save Company Profile"}
              </button>

              <div className="pt-6 border-t border-slate-200">
                <h3 className="text-sm font-black tracking-tight text-slate-900 mb-4">Document Preview</h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {/* Mini invoice preview */}
                  <div className="p-3" style={{ borderTop: `3px solid ${profile.accentColor}` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        {profile.logoBase64 ? (
                          <img src={profile.logoBase64} alt="" className="h-6 object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-100" />
                        )}
                        <p className="text-[8px] font-bold text-slate-900 mt-1">{profile.companyName || "Your Company"}</p>
                        <p className="text-[6px] text-slate-500">{profile.address || "123 Main St"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold" style={{ color: profile.accentColor }}>ESTIMATE</p>
                        <p className="text-[6px] text-slate-500">#EST-0001</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full" style={{ backgroundColor: profile.accentColor, opacity: 0.15, width: "100%" }} />
                      <div className="flex gap-1">
                        <div className="h-1 bg-slate-100 rounded-full flex-1" />
                        <div className="h-1 bg-slate-100 rounded-full w-8" />
                        <div className="h-1 bg-slate-100 rounded-full w-10" />
                      </div>
                      <div className="flex gap-1">
                        <div className="h-1 bg-slate-100 rounded-full flex-1" />
                        <div className="h-1 bg-slate-100 rounded-full w-8" />
                        <div className="h-1 bg-slate-100 rounded-full w-10" />
                      </div>
                      <div className="flex gap-1">
                        <div className="h-1 bg-slate-100 rounded-full flex-1" />
                        <div className="h-1 bg-slate-100 rounded-full w-8" />
                        <div className="h-1 bg-slate-100 rounded-full w-10" />
                      </div>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex justify-end">
                      <div className="text-right">
                        <p className="text-[6px] text-slate-500">Total</p>
                        <p className="text-[8px] font-bold text-slate-900">$12,500.00</p>
                      </div>
                    </div>
                    {profile.footerText && (
                      <p className="text-[5px] text-slate-400 mt-2 text-center">{profile.footerText}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
