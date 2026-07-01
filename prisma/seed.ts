import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import carsData from "../data/cars.json";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const car of carsData) {
    await prisma.car.upsert({
      where: { id: car.id },
      update: {
        make: car.make,
        model: car.model,
        variant: car.variant,
        bodyType: car.bodyType,
        fuelType: car.fuelType,
        priceLakh: car.priceLakh,
        mileageKmpl: car.mileageKmpl,
        safetyRating: car.safetyRating,
        seats: car.seats,
        transmission: car.transmission,
        features: JSON.stringify(car.features),
        reviewScore: car.reviewScore,
        imageUrl: car.imageUrl,
      },
      create: {
        id: car.id,
        make: car.make,
        model: car.model,
        variant: car.variant,
        bodyType: car.bodyType,
        fuelType: car.fuelType,
        priceLakh: car.priceLakh,
        mileageKmpl: car.mileageKmpl,
        safetyRating: car.safetyRating,
        seats: car.seats,
        transmission: car.transmission,
        features: JSON.stringify(car.features),
        reviewScore: car.reviewScore,
        imageUrl: car.imageUrl,
      },
    });
  }
  console.log(`Seeded ${carsData.length} cars`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
