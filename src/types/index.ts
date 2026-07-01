export type BodyType = "hatchback" | "sedan" | "suv" | "muv" | "coupe";
export type FuelType = "petrol" | "diesel" | "cng" | "electric" | "hybrid";
export type Transmission = "manual" | "automatic";

export interface Car {
  id: string;
  make: string;
  model: string;
  variant: string;
  bodyType: BodyType;
  fuelType: FuelType;
  priceLakh: number;
  mileageKmpl: number;
  safetyRating: number;
  seats: number;
  transmission: Transmission;
  features: string[];
  reviewScore: number;
  imageUrl: string;
}

export interface BuyerPreferences {
  budgetMin: number;
  budgetMax: number;
  bodyTypes: BodyType[];
  fuelTypes: FuelType[];
  minSeats: number;
  transmission?: Transmission;
  priorities: {
    budget: number;
    mileage: number;
    safety: number;
    features: number;
    reviews: number;
  };
}

export interface MatchResult {
  car: Car;
  score: number;
  matchPercent: number;
  reasons: string[];
}
