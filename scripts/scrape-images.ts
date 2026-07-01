/**
 * Scrapes CarDekho exterior images for cars in data/cars.json
 * Run: npx tsx scripts/scrape-images.ts
 */
import fs from "fs";
import path from "path";

const CAR_SLUGS: Record<string, string> = {
  "maruti-swift-vxi": "maruti/swift",
  "maruti-swift-zxi-plus": "maruti/swift",
  "maruti-baleno-delta": "maruti/baleno",
  "maruti-fronx-delta-plus": "maruti/fronx",
  "maruti-brezza-zxi": "maruti/vitara-brezza",
  "maruti-ertiga-zxi": "maruti/ertiga",
  "hyundai-i20-sportz": "hyundai/i20",
  "hyundai-venue-sx": "hyundai/venue",
  "hyundai-creta-sx-o": "hyundai/creta",
  "hyundai-verna-sx": "hyundai/verna",
  "hyundai-exter-sx": "hyundai/exter",
  "hyundai-alcazar-signature": "hyundai/alcazar",
  "tata-nexon-xz-plus": "tata/nexon",
  "tata-nexon-ev-max": "tata/nexon-ev",
  "tata-punch-adventure": "tata/punch",
  "tata-harrier-fearless": "tata/harrier",
  "tata-safari-accomplished": "tata/safari",
  "tata-tiago-xz-plus": "tata/tiago",
  "mahindra-xuv700-ax7": "mahindra/xuv700",
  "mahindra-thar-lx": "mahindra/thar",
  "mahindra-scorpio-n-z8": "mahindra/scorpio-n",
  "mahindra-xuv300-w8": "mahindra/xuv-3xo",
  "kia-sonet-gtx-plus": "kia/sonet",
  "kia-seltos-gtx-plus": "kia/seltos",
  "kia-carens-luxury-plus": "kia/carens",
  "kia-ev6-gt-line": "kia/ev6",
  "honda-city-vx": "honda/city",
  "honda-elevate-vx": "honda/elevate",
  "honda-amaze-vx": "honda/amaze",
  "toyota-innova-hycross-zx": "toyota/innova-hycross",
  "toyota-fortuner-4x4": "toyota/fortuner",
  "toyota-hyryder-v": "toyota/urban-cruiser-hyryder",
  "toyota-glanza-v": "toyota/glanza",
  "mg-hector-sharp": "mg/hector",
  "mg-astor-sharp": "mg/astor",
  "mg-zs-ev-excite": "mg/zs-ev",
  "skoda-kushaq-style": "skoda/kushaq",
  "skoda-slavia-style": "skoda/slavia",
  "vw-taigun-gt": "volkswagen/taigun",
  "vw-virtus-gt": "volkswagen/virtus",
  "renault-kiger-rxz": "renault/kiger",
  "nissan-magnite-turbo": "nissan/magnite",
  "citroen-c3-feel": "citroen/c3",
  "maruti-wagonr-vxi-cng": "maruti/wagon-r",
  "maruti-ertiga-vxi-cng": "maruti/ertiga",
  "byd-atto3-superior": "byd/atto-3",
  "bmw-x1-sdrive": "bmw/x1",
};

const imageCache = new Map<string, string>();

async function scrapeImage(slug: string): Promise<string | null> {
  if (imageCache.has(slug)) return imageCache.get(slug)!;

  const url = `https://www.cardekho.com/${slug}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html",
      },
    });
    const html = await res.text();

    const patterns = [
      /https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/930x620\/[^"'\s]+front-left-side[^"'\s]*\.jpg/g,
      /https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/930x620\/[^"'\s]+exterior-image[^"'\s]*\.jpg/g,
      /https:\/\/stimg\.cardekho\.com\/images\/carexteriorimages\/630x420\/[^"'\s]+\.jpg/g,
      /https:\/\/stimg\.cardekho\.com\/images\/car-images\/[^"'\s]+\.jpg/g,
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches?.[0]) {
        const img = matches[0].split("?")[0];
        imageCache.set(slug, img);
        return img;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function main() {
  const carsPath = path.join(process.cwd(), "data/cars.json");
  const cars = JSON.parse(fs.readFileSync(carsPath, "utf-8"));
  let updated = 0;

  const uniqueSlugs = [...new Set(Object.values(CAR_SLUGS))];
  console.log(`Fetching images for ${uniqueSlugs.length} models...`);

  for (const slug of uniqueSlugs) {
    const img = await scrapeImage(slug);
    console.log(`${slug}: ${img ? "✓" : "✗"} ${img ?? "not found"}`);
    await new Promise((r) => setTimeout(r, 300));
  }

  for (const car of cars) {
    const slug = CAR_SLUGS[car.id];
    if (!slug) continue;
    const img = imageCache.get(slug);
    if (img) {
      car.imageUrl = img;
      updated++;
    }
  }

  fs.writeFileSync(carsPath, JSON.stringify(cars, null, 2) + "\n");
  console.log(`\nUpdated ${updated}/${cars.length} cars with CarDekho images`);
}

main();
