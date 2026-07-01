-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "bodyType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "priceLakh" REAL NOT NULL,
    "mileageKmpl" REAL NOT NULL,
    "safetyRating" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "transmission" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "reviewScore" REAL NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ShortlistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShortlistItem_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ShortlistItem_sessionId_idx" ON "ShortlistItem"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ShortlistItem_sessionId_carId_key" ON "ShortlistItem"("sessionId", "carId");
