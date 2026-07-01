import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCarById } from "@/lib/cars";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const items = await prisma.shortlistItem.findMany({
    where: { sessionId },
    orderBy: { addedAt: "desc" },
  });

  const cars = items
    .map((item) => getCarById(item.carId))
    .filter((car): car is NonNullable<typeof car> => car !== undefined);

  return NextResponse.json(
    { cars, count: cars.length },
    { headers: { "Cache-Control": "private, no-cache" } },
  );
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

    const item = await prisma.shortlistItem.upsert({
      where: { sessionId_carId: { sessionId, carId } },
      update: {},
      create: { sessionId, carId },
    });

    return NextResponse.json({ success: true, item });
  } catch {
    return NextResponse.json({ error: "Failed to add to shortlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const carId = request.nextUrl.searchParams.get("carId");

  if (!sessionId || !carId) {
    return NextResponse.json({ error: "sessionId and carId required" }, { status: 400 });
  }

  await prisma.shortlistItem.deleteMany({ where: { sessionId, carId } });
  return NextResponse.json({ success: true });
}
