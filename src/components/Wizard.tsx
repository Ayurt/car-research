"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BodyType, BuyerPreferences, FuelType, MatchResult } from "@/types";
import { getSessionId } from "@/lib/session";
import { CarLoader } from "./CarLoader";

const CarCard = dynamic(() => import("./CarCard").then((m) => ({ default: m.CarCard })), {
  loading: () => <div className="h-96 bg-white/5 rounded-2xl animate-pulse" />,
});

const BODY_TYPES: { value: BodyType; label: string; desc: string }[] = [
  { value: "hatchback", label: "Hatchback", desc: "Compact & city-friendly" },
  { value: "sedan", label: "Sedan", desc: "Comfort & highway cruising" },
  { value: "suv", label: "SUV", desc: "Space & road presence" },
  { value: "muv", label: "MUV / MPV", desc: "7-seater family hauler" },
];

const FUEL_TYPES: { value: FuelType; label: string; color: string }[] = [
  { value: "petrol", label: "Petrol", color: "hover:border-blue-500/50 data-[active=true]:border-blue-500 data-[active=true]:bg-blue-500/10" },
  { value: "diesel", label: "Diesel", color: "hover:border-amber-500/50 data-[active=true]:border-amber-500 data-[active=true]:bg-amber-500/10" },
  { value: "cng", label: "CNG", color: "hover:border-cyan-500/50 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-500/10" },
  { value: "electric", label: "Electric", color: "hover:border-green-500/50 data-[active=true]:border-green-500 data-[active=true]:bg-green-500/10" },
  { value: "hybrid", label: "Hybrid", color: "hover:border-emerald-500/50 data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-500/10" },
];

const PRIORITIES = [
  { key: "budget" as const, label: "Budget fit", icon: "💰", desc: "Staying within your price range" },
  { key: "mileage" as const, label: "Fuel efficiency", icon: "⛽", desc: "Mileage or EV range" },
  { key: "safety" as const, label: "Safety", icon: "🛡️", desc: "Crash test ratings" },
  { key: "features" as const, label: "Features", icon: "✨", desc: "Tech & comfort features" },
  { key: "reviews" as const, label: "Owner reviews", icon: "⭐", desc: "Real buyer ratings" },
];

const DEFAULT_PREFS: BuyerPreferences = {
  budgetMin: 8,
  budgetMax: 15,
  bodyTypes: [],
  fuelTypes: [],
  minSeats: 5,
  priorities: { budget: 3, mileage: 2, safety: 3, features: 2, reviews: 2 },
};

const STEPS = ["Budget", "Preferences", "Priorities", "Matches"];
const MIN_LOADER_MS = 1200;

export function Wizard() {
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<BuyerPreferences>(DEFAULT_PREFS);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step !== 3 || loading) return;

    const sessionId = getSessionId();
    fetch(`/api/shortlist?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        const ids = new Set<string>((data.cars ?? []).map((c: { id: string }) => c.id));
        setShortlistedIds(ids);
      })
      .catch(() => setShortlistedIds(new Set()));
  }, [step, loading, results]);

  const scrollToTop = useCallback(() => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const findMatches = useCallback(async () => {
    setError(null);
    setLoading(true);
    setStep(3);
    scrollToTop();

    try {
      const [res] = await Promise.all([
        fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        }),
        new Promise((r) => setTimeout(r, MIN_LOADER_MS)),
      ]);

      if (!res.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setError("Something went wrong. Please try again.");
      setStep(2);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [prefs, scrollToTop]);

  function toggleArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div ref={wizardRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {step < 3 && (
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            47 cars · 12 brands · 2 min setup
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Too many cars.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Not enough clarity.
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
            Tell us what matters — we&apos;ll rank the best matches and explain why each one fits.
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => !loading && i < step && setStep(i)}
              disabled={i > step || loading}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                i <= step ? "text-white" : "text-slate-600"
              } ${i < step && !loading ? "cursor-pointer hover:text-orange-400" : ""}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  i < step
                    ? "bg-orange-500 border-orange-500 text-white"
                    : i === step
                    ? "border-orange-500 text-orange-400 bg-orange-500/10"
                    : "border-slate-700 text-slate-600 bg-transparent"
                }`}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </button>
          ))}
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-[#151929]/80 rounded-2xl border border-white/5 p-6 sm:p-8 shadow-2xl shadow-black/30">
        {step === 0 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">What&apos;s your budget?</h3>
            <p className="text-slate-400 text-sm mb-8">Drag the sliders to set your price range in ₹ Lakhs</p>

            <div className="flex justify-center mb-10">
              <div className="text-center px-8 py-5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20">
                <p className="text-sm text-orange-400 font-medium mb-1">Your budget range</p>
                <p className="text-4xl font-bold text-white">
                  ₹{prefs.budgetMin}L
                  <span className="text-slate-500 mx-2 text-2xl">—</span>
                  ₹{prefs.budgetMax}L
                </p>
              </div>
            </div>

            <div className="space-y-8 max-w-lg mx-auto">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Minimum budget</span>
                  <span className="text-white font-semibold">₹{prefs.budgetMin} Lakhs</span>
                </div>
                <input
                  type="range" min={5} max={50} step={0.5}
                  value={prefs.budgetMin}
                  onChange={(e) => setPrefs({ ...prefs, budgetMin: Math.min(+e.target.value, prefs.budgetMax - 1) })}
                  className="w-full"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Maximum budget</span>
                  <span className="text-white font-semibold">₹{prefs.budgetMax} Lakhs</span>
                </div>
                <input
                  type="range" min={6} max={70} step={0.5}
                  value={prefs.budgetMax}
                  onChange={(e) => setPrefs({ ...prefs, budgetMax: Math.max(+e.target.value, prefs.budgetMin + 1) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Body type</h3>
              <p className="text-slate-400 text-sm mb-4">Select all that apply — or skip for any type</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BODY_TYPES.map(({ value, label, desc }) => {
                  const active = prefs.bodyTypes.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPrefs({ ...prefs, bodyTypes: toggleArray(prefs.bodyTypes, value) })}
                      className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        active
                          ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <p className={`font-semibold ${active ? "text-orange-300" : "text-white"}`}>{label}</p>
                      <p className="text-xs text-slate-500 mt-1">{desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Fuel type</h3>
              <p className="text-slate-400 text-sm mb-4">What powers your next car?</p>
              <div className="flex flex-wrap gap-2">
                {FUEL_TYPES.map(({ value, label, color }) => {
                  const active = prefs.fuelTypes.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      data-active={active}
                      onClick={() => setPrefs({ ...prefs, fuelTypes: toggleArray(prefs.fuelTypes, value) })}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 ${
                        active
                          ? "border-orange-500 bg-orange-500/10 text-orange-300"
                          : `border-white/10 bg-white/5 text-slate-300 ${color}`
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Seating</h3>
              <p className="text-slate-400 text-sm mb-4">How many seats do you need?</p>
              <div className="flex gap-3">
                {[5, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPrefs({ ...prefs, minSeats: n })}
                    className={`flex-1 sm:flex-none px-8 py-3 rounded-xl font-semibold border-2 transition-all ${
                      prefs.minSeats === n
                        ? "border-orange-500 bg-orange-500/10 text-orange-300"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {n} Seater
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">What matters most?</h3>
            <p className="text-slate-400 text-sm mb-8">Slide to set importance — 1 is low, 5 is critical</p>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}
            <div className="space-y-6 max-w-xl mx-auto">
              {PRIORITIES.map(({ key, label, icon, desc }) => (
                <div key={key} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`w-2 h-6 rounded-full transition-all ${
                            n <= prefs.priorities[key] ? "bg-orange-500" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <input
                    type="range" min={1} max={5}
                    value={prefs.priorities[key]}
                    onChange={(e) =>
                      setPrefs({
                        ...prefs,
                        priorities: { ...prefs.priorities, [key]: +e.target.value },
                      })
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            {loading ? (
              <CarLoader />
            ) : (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    Your top {results.length} matches
                  </h3>
                  <p className="text-slate-400 mt-2">
                    Ranked by how well they fit your budget, priorities, and needs
                  </p>
                </div>
                {results.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">🔍</p>
                    <p className="text-slate-400">No matches found. Try widening your budget or removing filters.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-5">
                    {results.map((result, i) => (
                      <CarCard
                        key={result.car.id}
                        result={result}
                        rank={i + 1}
                        shortlisted={shortlistedIds.has(result.car.id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation — sticky so button is always reachable */}
        {!loading && (
          <div className="relative z-10 flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {step > 0 && step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 && (
              <button
                type="button"
                onClick={() => { setStep(step + 1); scrollToTop(); }}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 transition-all"
              >
                Continue →
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={findMatches}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 transition-all"
              >
                Find My Cars →
              </button>
            )}

            {step === 3 && !loading && (
              <button
                type="button"
                onClick={() => { setStep(0); setResults([]); setError(null); scrollToTop(); }}
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-medium hover:bg-white/10 transition-all"
              >
                ↺ Start Over
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
