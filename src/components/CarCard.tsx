"use client";

import { memo, useState } from "react";
import { CarImage } from "@/components/CarImage";
import { useShortlist } from "@/components/ShortlistProvider";
import type { MatchResult } from "@/types";
import { getSessionId } from "@/lib/session";

const FUEL_COLORS: Record<string, string> = {
  petrol: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  diesel: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  electric: "bg-green-500/20 text-green-300 border-green-500/30",
  hybrid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cng: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
};

interface CarCardProps {
  result: MatchResult;
  rank: number;
  shortlisted?: boolean;
}

export const CarCard = memo(function CarCard({ result, rank, shortlisted }: CarCardProps) {
  const { setCount, refreshCount } = useShortlist();
  const { car, matchPercent, reasons } = result;
  const [loading, setLoading] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(shortlisted ?? false);

  async function toggleShortlist() {
    setLoading(true);
    const sessionId = getSessionId();
    try {
      if (isShortlisted) {
        const res = await fetch(`/api/shortlist?sessionId=${sessionId}&carId=${car.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove");
        setIsShortlisted(false);
        setCount((c) => Math.max(0, c - 1));
      } else {
        const res = await fetch("/api/shortlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, carId: car.id }),
        });
        if (!res.ok) throw new Error("Failed to add");
        setIsShortlisted(true);
        setCount((c) => c + 1);
      }
      window.dispatchEvent(new Event("shortlist-updated"));
      refreshCount();
    } catch {
      /* keep UI state unchanged on failure */
    } finally {
      setLoading(false);
    }
  }

  const fuelClass = FUEL_COLORS[car.fuelType] ?? "bg-slate-500/20 text-slate-300 border-slate-500/30";

  return (
    <div className="group bg-[#151929] rounded-2xl border border-white/5 overflow-hidden hover:border-orange-500/30 transition-colors">
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <CarImage
          src={car.imageUrl}
          alt={`${car.make} ${car.model}`}
          fill
          className="object-cover"
          priority={rank <= 2}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#151929] via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            #{rank}
          </span>
          <span className="bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10">
            {matchPercent}% match
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${fuelClass}`}>
            {car.fuelType}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-orange-400 font-medium uppercase tracking-wider">{car.make}</p>
            <h3 className="text-lg font-bold text-white mt-0.5">{car.model}</h3>
            <p className="text-sm text-slate-400">{car.variant}</p>
          </div>
          <p className="text-xl font-bold text-white whitespace-nowrap">
            ₹{car.priceLakh}<span className="text-sm text-slate-400 font-normal">L</span>
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Spec icon="⛽" label="Mileage" value={car.fuelType === "electric" ? `${car.mileageKmpl} km` : `${car.mileageKmpl} kmpl`} />
          <Spec icon="🛡️" label="Safety" value={`${car.safetyRating}★`} />
          <Spec icon="⭐" label="Rating" value={`${car.reviewScore}/5`} />
        </div>

        <ul className="mt-4 space-y-1.5">
          {reasons.map((reason) => (
            <li key={reason} className="text-xs text-slate-300 flex items-start gap-2">
              <span className="text-green-400 shrink-0">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={toggleShortlist}
          disabled={loading}
          className={`mt-5 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            isShortlisted
              ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
              : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
          }`}
        >
          {loading ? "Saving..." : isShortlisted ? "✓ Saved to Shortlist" : "+ Add to Shortlist"}
        </button>
      </div>
    </div>
  );
});

function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5 text-center">
      <span className="text-sm">{icon}</span>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
      <p className="text-xs font-semibold text-slate-200">{value}</p>
    </div>
  );
}
