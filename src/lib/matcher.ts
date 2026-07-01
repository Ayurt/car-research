import type { BuyerPreferences, Car, MatchResult } from "@/types";

function normalize(value: number, min: number, max: number): number {
  if (max === min) return 1;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function priceScore(car: Car, prefs: BuyerPreferences): number {
  const mid = (prefs.budgetMin + prefs.budgetMax) / 2;
  const range = prefs.budgetMax - prefs.budgetMin || 1;
  const distance = Math.abs(car.priceLakh - mid);
  return Math.max(0, 1 - distance / (range * 1.5));
}

function mileageScore(car: Car, allCars: Car[]): number {
  const isEv = car.fuelType === "electric";
  const values = allCars
    .filter((c) => c.fuelType === car.fuelType)
    .map((c) => c.mileageKmpl);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return normalize(car.mileageKmpl, min, max);
}

function safetyScore(car: Car): number {
  return car.safetyRating / 5;
}

function featuresScore(car: Car, allCars: Car[]): number {
  const counts = allCars.map((c) => c.features.length);
  const max = Math.max(...counts);
  return car.features.length / max;
}

function reviewScore(car: Car): number {
  return (car.reviewScore - 3.5) / 1.5;
}

function hardFilter(car: Car, prefs: BuyerPreferences): boolean {
  if (car.priceLakh < prefs.budgetMin * 0.85 || car.priceLakh > prefs.budgetMax * 1.15) {
    return false;
  }
  if (prefs.bodyTypes.length > 0 && !prefs.bodyTypes.includes(car.bodyType)) {
    return false;
  }
  if (prefs.fuelTypes.length > 0 && !prefs.fuelTypes.includes(car.fuelType)) {
    return false;
  }
  if (car.seats < prefs.minSeats) {
    return false;
  }
  if (prefs.transmission && car.transmission !== prefs.transmission) {
    return false;
  }
  return true;
}

function buildReasons(car: Car, prefs: BuyerPreferences, scores: Record<string, number>): string[] {
  const reasons: string[] = [];

  if (scores.budget > 0.75) {
    reasons.push(`Fits your ₹${prefs.budgetMin}–${prefs.budgetMax}L budget at ₹${car.priceLakh}L`);
  }
  if (scores.mileage > 0.7 && car.fuelType !== "electric") {
    reasons.push(`Strong mileage at ${car.mileageKmpl} kmpl`);
  }
  if (car.fuelType === "electric" && scores.mileage > 0.7) {
    reasons.push(`${car.mileageKmpl} km range on a full charge`);
  }
  if (scores.safety > 0.75) {
    reasons.push(`${car.safetyRating}-star safety rating`);
  }
  if (scores.features > 0.7) {
    reasons.push(`${car.features.length} key features including ${car.features.slice(0, 2).join(", ")}`);
  }
  if (scores.reviews > 0.7) {
    reasons.push(`Highly rated by owners (${car.reviewScore}/5)`);
  }
  if (reasons.length === 0) {
    reasons.push(`Solid ${car.bodyType} option from ${car.make}`);
  }
  return reasons.slice(0, 3);
}

export function matchCars(cars: Car[], prefs: BuyerPreferences): MatchResult[] {
  const filtered = cars.filter((car) => hardFilter(car, prefs));

  const candidates = filtered.length >= 3 ? filtered : cars.filter((car) => {
    return car.priceLakh >= prefs.budgetMin * 0.7 && car.priceLakh <= prefs.budgetMax * 1.3;
  });

  const { priorities } = prefs;
  const totalWeight =
    priorities.budget + priorities.mileage + priorities.safety + priorities.features + priorities.reviews;

  const results: MatchResult[] = candidates.map((car) => {
    const scores = {
      budget: priceScore(car, prefs),
      mileage: mileageScore(car, cars),
      safety: safetyScore(car),
      features: featuresScore(car, cars),
      reviews: reviewScore(car),
    };

    const weighted =
      (scores.budget * priorities.budget +
        scores.mileage * priorities.mileage +
        scores.safety * priorities.safety +
        scores.features * priorities.features +
        scores.reviews * priorities.reviews) /
      totalWeight;

    return {
      car,
      score: weighted,
      matchPercent: Math.round(weighted * 100),
      reasons: buildReasons(car, prefs, scores),
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 8);
}
