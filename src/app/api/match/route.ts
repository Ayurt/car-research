import { NextRequest, NextResponse } from "next/server";
import { getAllCars } from "@/lib/cars";
import { matchCars } from "@/lib/matcher";
import type { BuyerPreferences } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const prefs: BuyerPreferences = await request.json();
    const cars = getAllCars();
    const results = matchCars(cars, prefs);
    return NextResponse.json({ results, total: results.length });
  } catch {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }
}
