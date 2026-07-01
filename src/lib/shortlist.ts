import { getCarById } from "@/lib/cars";
import { getShortlistCarIds } from "@/lib/shortlist-store";
import type { Car } from "@/types";

export async function getShortlistCars(sessionId: string): Promise<Car[]> {
  const carIds = await getShortlistCarIds(sessionId);
  return carIds
    .map((id) => getCarById(id))
    .filter((car): car is Car => car !== undefined);
}
