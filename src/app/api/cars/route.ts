import { NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars";

export async function GET() {
  const cars = getAllCars();
  return NextResponse.json(cars);
}
