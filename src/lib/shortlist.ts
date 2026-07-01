import { getPrisma } from "@/lib/db";
import { getCarById } from "@/lib/cars";
import type { Car } from "@/types";

export async function getShortlistCars(sessionId: string): Promise<Car[]> {
  const items = await getPrisma().shortlistItem.findMany({
    where: { sessionId },
    orderBy: { addedAt: "desc" },
    select: { carId: true },
  });

  return items
    .map((item) => getCarById(item.carId))
    .filter((car): car is Car => car !== undefined);
}

export async function getShortlistCount(sessionId: string): Promise<number> {
  return getPrisma().shortlistItem.count({ where: { sessionId } });
}
