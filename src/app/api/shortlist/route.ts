import { NextRequest, NextResponse } from "next/server";
import { getCarById } from "@/lib/cars";
import {
  addShortlistItem,
  getShortlistCarIds,
  removeShortlistItem,
} from "@/lib/shortlist-store";

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const carIds = await getShortlistCarIds(sessionId);
    const cars = carIds
      .map((id) => getCarById(id))
      .filter((car): car is NonNullable<typeof car> => car !== undefined);

    return NextResponse.json(
      { cars, count: cars.length },
      { headers: { "Cache-Control": "private, no-cache" } },
    );
  } catch (err) {
    console.error("Shortlist GET error:", err);
    return NextResponse.json({ error: "Database error", cars: [], count: 0 }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, carId } = await request.json();
    if (!sessionId || !carId) {
      return NextResponse.json({ error: "sessionId and carId required" }, { status: 400 });
    }

    const car = getCarById(carId);
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    await addShortlistItem(sessionId, carId);
    return NextResponse.json({ success: true, carId });
  } catch (err) {
    console.error("Shortlist POST error:", err);
    return NextResponse.json({ error: "Failed to add to shortlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const carId = request.nextUrl.searchParams.get("carId");

    if (!sessionId || !carId) {
      return NextResponse.json({ error: "sessionId and carId required" }, { status: 400 });
    }

    await removeShortlistItem(sessionId, carId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Shortlist DELETE error:", err);
    return NextResponse.json({ error: "Failed to remove from shortlist" }, { status: 500 });
  }
}
