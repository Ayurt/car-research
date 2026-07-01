"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CarImage } from "@/components/CarImage";
import { useShortlist } from "@/components/ShortlistProvider";
import type { Car } from "@/types";
import { getSessionId } from "@/lib/session";

export function ShortlistView() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const { setCount } = useShortlist();

  useEffect(() => {
    const sessionId = getSessionId();
    fetch(`/api/shortlist?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setCars(data.cars ?? []);
        setCount(data.count ?? 0);
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, [setCount]);

  async function removeCar(carId: string) {
    const sessionId = getSessionId();
    await fetch(`/api/shortlist?sessionId=${sessionId}&carId=${carId}`, { method: "DELETE" });
    setCars((prev) => {
      const next = prev.filter((c) => c.id !== carId);
      setCount(next.length);
      return next;
    });
    window.dispatchEvent(new Event("shortlist-updated"));
  }

  return (
    <main className="flex-1 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">My Shortlist</h2>
          <p className="mt-2 text-slate-400">
            {loading
              ? "Loading your saved cars..."
              : cars.length > 0
              ? `${cars.length} car${cars.length > 1 ? "s" : ""} saved — compare and decide with confidence`
              : "Save cars from your matches to compare them here"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 bg-[#151929]/50 rounded-2xl border border-white/5">
            <p className="text-slate-400 mb-6">Your shortlist is empty</p>
            <Link
              href="/"
              prefetch
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold"
            >
              Find cars that match you →
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#151929]/80 mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-4 text-left text-slate-400 font-medium">Car</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Price</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Mileage</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Safety</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Seats</th>
                    <th className="p-4 text-left text-slate-400 font-medium">Rating</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                            <CarImage src={car.imageUrl} alt={car.model} fill className="object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{car.make} {car.model}</p>
                            <p className="text-slate-500 text-xs">{car.variant}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white font-semibold">₹{car.priceLakh}L</td>
                      <td className="p-4 text-slate-300">
                        {car.fuelType === "electric" ? `${car.mileageKmpl} km` : `${car.mileageKmpl} kmpl`}
                      </td>
                      <td className="p-4 text-yellow-400">{car.safetyRating}★</td>
                      <td className="p-4 text-slate-300">{car.seats}</td>
                      <td className="p-4 text-orange-400 font-semibold">{car.reviewScore}/5</td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => removeCar(car.id)}
                          className="text-red-400 hover:text-red-300 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cars.map((car) => (
                <div key={car.id} className="bg-[#151929] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="relative h-36 bg-slate-900">
                    <CarImage src={car.imageUrl} alt={car.model} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#151929] to-transparent" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-white">{car.make} {car.model}</h4>
                    <p className="text-sm text-slate-400 mb-3">{car.variant}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {car.features.slice(0, 4).map((f) => (
                        <span key={f} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                          {f}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 capitalize">
                      {car.fuelType} · {car.transmission} · {car.bodyType}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
