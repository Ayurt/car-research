import carsData from "../../data/cars.json";
import type { Car } from "@/types";

export function getAllCars(): Car[] {
  return carsData as Car[];
}

export function getCarById(id: string): Car | undefined {
  return getAllCars().find((car) => car.id === id);
}
