"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TRADES = [
  { name: "Electrical", icon: "⚡" },
  { name: "Plumbing", icon: "🔧" },
  { name: "HVAC", icon: "❄️" },
  { name: "Roofing", icon: "🏠" },
  { name: "Concrete", icon: "🧱" },
  { name: "Framing", icon: "🪵" },
  { name: "Painting", icon: "🎨" },
  { name: "Landscaping", icon: "🌿" },
  { name: "Drywall", icon: "🪟" },
  { name: "Flooring", icon: "🪵" },
  { name: "Masonry", icon: "🧱" },
  { name: "Welding", icon: "🔥" },
  { name: "Demolition", icon: "💥" },
  { name: "Excavation", icon: "⛏️" },
  { name: "Insulation", icon: "🧤" },
];

type Tier = "GC" | "TRADE" | null;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [tier, setTier] = useState<Tier>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
    tradeType: "",
    enabledTrades: [] as string[],
  });
  const [tosChecked, setTosChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTierSelect = (selectedTier: Tier) => {
    setTier(selectedTier);
    setStep(2);
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTradeToggle = (tradeName: string) => {
    setFormData((prev) => {
      const updatedTrades = prev.enabledTrades.includes(tradeName)
        ? prev.enabledTrades.filter((t) => t !== tradeName)
        : [...prev.enabledTrades, tradeName];

      if (tier === "TRADE" && !prev.tradeType && updatedTrades.length > 0) {
        return {
          ...prev,
          tradeType: tradeName,
          enabledTrades: updatedTrades,
        };
      }

      return {
        ...prev,
        enabledTrades: updatedTrades,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tosChecked) {
      setError("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (tier === "TRADE" && !formData.tradeType) {
      setError("Please select a primary trade");
      return;
    }

    if (formData.enabledTrades.length === 0) {
      setError("Please select at least one trade");
      return;
    }

    // For GC, set tradeType to "General Contractor" if not already set
    if (tier === "GC" && !formData.tradeType) {
      formData.tradeType = "General Contractor";
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tier,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/app");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn("google", { callbackUrl: "/app" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="text-3xl font-bold text-slate-900">
            Prospect <span className="text-orange-500">IT</span>
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
              Choose your account type
            </h1>
            <p className="text-center text-slate-600 text-sm mb-8">
              Select the role that best describes your work
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => handleTierSelect("GC")}
                className="p-6 border-2 border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left"
              >
                <div className="text-5xl mb-4">🏗️</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  General Contractor
                </h2>
                <p className="text-slate-600 text-sm">
                  Manage full projects, coordinate subs, and oversee all scopes of work
                </p>
              </button>

              <button
                onClick={() => handleTierSelect("TRADE")}
                className="p-6 border-2 border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-left"
              >
                <div className="text-5xl mb-4">🔧</div>
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  Trade / Subcontractor
                </h2>
                <p className="text-slate-600 text-sm">
                  Bid on specific scopes, track your jobs, and manage your crew
                </p>
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
              >
                &larr; Back
              </button>
              <h1 className="text-2xl font-bold text-slate-900">
                Create your account
              </h1>
            </div>
            <p className="text-center text-slate-600 text-sm mb-8">
              {tier === "GC"
                ? "Set up your General Contractor account"
                : "Set up your Trade account"}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-900 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-slate-900 mb-2">
                  Company name
                </label>
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your company (optional)"
                />
              </div>

              {tier === "GC" && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-3">
                    Trades you work with / coordinate
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TRADES.map((trade) => (
                      <button
                        key={trade.name}
                        type="button"
                        onClick={() => handleTradeToggle(trade.name)}
                        className={`px-3 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                          formData.enabledTrades.includes(trade.name)
                            ? "bg-orange-500 text-white border border-orange-500"
                            : "bg-slate-100 text-slate-900 border border-slate-300 hover:border-orange-500"
                        }`}
                      >
                        <span>{trade.icon}</span>
                        <span>{trade.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tier === "TRADE" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      Your primary trade
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRADES.map((trade) => (
                        <button
                          key={trade.name}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              tradeType: trade.name,
                              enabledTrades: prev.enabledTrades.includes(trade.name)
                                ? prev.enabledTrades
                                : [...prev.enabledTrades, trade.name],
                            }));
                          }}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                            formData.tradeType === trade.name
                              ? "bg-orange-500 text-white border border-orange-500"
                              : "bg-slate-100 text-slate-900 border border-slate-300 hover:border-orange-500"
                          }`}
                        >
                          <span>{trade.icon}</span>
                          <span>{trade.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      Additional trades you also do (optional)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRADES.map((trade) => (
                        <button
                          key={trade.name}
                          type="button"
                          onClick={() => handleTradeToggle(trade.name)}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                            formData.enabledTrades.includes(trade.name)
                              ? "bg-orange-500 text-white border border-orange-500"
                              : "bg-slate-100 text-slate-900 border border-slate-300 hover:border-orange-500"
                          }`}
                        >
                          <span>{trade.icon}</span>
                          <span>{trade.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start gap-3 py-2">
                <input
                  id="tos"
                  type="checkbox"
                  checked={tosChecked}
                  onChange={(e) => setTosChecked(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-orange-500 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="tos" className="text-sm text-slate-600 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 font-medium">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !tosChecked}
                className="w-full py-2 px-4 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">Or sign up with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full py-2 px-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-2 mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#1F2937" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-slate-900 font-medium">Google</span>
            </button>
          </>
        )}

        {step === 2 && (
          <p className="text-center text-slate-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
