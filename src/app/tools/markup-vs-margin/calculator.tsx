"use client";

import { useState } from "react";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const pct = (n: number) => `${n.toFixed(1)}%`;

export default function MarkupCalculator() {
  const [cost, setCost] = useState(10000);
  const [mode, setMode] = useState<"margin" | "markup">("margin");
  const [rate, setRate] = useState(30);

  const safeCost = Number.isFinite(cost) && cost > 0 ? cost : 0;
  // Cap below 100 — a 100% margin implies infinite price.
  const safeRate = Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 99.9) : 0;

  let price: number;
  let markup: number;
  let margin: number;

  if (mode === "margin") {
    margin = safeRate;
    price = safeCost > 0 ? safeCost / (1 - margin / 100) : 0;
    markup = margin < 100 ? (margin / (100 - margin)) * 100 : 0;
  } else {
    markup = safeRate;
    price = safeCost * (1 + markup / 100);
    margin = price > 0 ? ((price - safeCost) / price) * 100 : 0;
  }

  const profit = price - safeCost;

  // What they'd collect if they made the classic mistake: using the target
  // margin number as a markup instead.
  const mistakePrice = safeCost * (1 + safeRate / 100);
  const mistakeMargin =
    mistakePrice > 0 ? ((mistakePrice - safeCost) / mistakePrice) * 100 : 0;
  const shortfall = price - mistakePrice;

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cost"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Your job cost
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                $
              </span>
              <input
                id="cost"
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={cost || ""}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 py-3 pl-8 pr-4 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              Material, labor, equipment — everything the job costs you.
            </p>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              I want to set my…
            </span>
            <div className="flex rounded-lg bg-slate-100 p-1">
              {(["margin", "markup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition ${
                    mode === m
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="relative mt-3">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="99"
                step="0.5"
                value={rate || ""}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-lg border border-slate-200 py-3 pl-4 pr-9 outline-none transition focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                %
              </span>
            </div>
          </div>
        </div>

        {/* Result */}
        <div className="mt-8 rounded-xl bg-slate-900 p-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-400/80">
            Charge the customer
          </p>
          <p className="mt-2 text-4xl font-black text-white md:text-5xl">
            {money(price)}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            {money(profit)} profit · {pct(markup)} markup · {pct(margin)} margin
          </p>
        </div>

        {/* The mistake */}
        {safeCost > 0 && safeRate > 0 && mode === "margin" && shortfall > 0.5 && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="font-bold text-red-900">
              If you added {pct(safeRate)} as markup instead
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-red-800">
              You&apos;d charge <strong>{money(mistakePrice)}</strong> and collect
              only <strong>{pct(mistakeMargin)}</strong> margin — not the{" "}
              {pct(safeRate)} you wanted. That&apos;s{" "}
              <strong>{money(shortfall)}</strong> of profit missing from this one
              job.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-3 text-center sm:grid-cols-3">
          {[
            { label: "Cost", value: money(safeCost) },
            { label: "Profit", value: money(profit) },
            { label: "Price", value: money(price) },
          ].map((x) => (
            <div key={x.label} className="rounded-lg bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {x.label}
              </p>
              <p className="mt-1 font-bold text-slate-900">{x.value}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Nothing is stored or sent anywhere — this runs entirely in your browser.
      </p>
    </section>
  );
}
