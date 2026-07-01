import { promises as fs } from "node:fs";
import path from "node:path";

interface ShortlistStore {
  items: Record<string, { carId: string; addedAt: string }[]>;
}

function getStorePath(): string {
  if (process.env.SHORTLIST_STORE_PATH) return process.env.SHORTLIST_STORE_PATH;
  if (process.env.NODE_ENV === "production") return "/data/shortlist.json";
  return path.join(process.cwd(), "data", "shortlist.json");
}

async function readStore(): Promise<ShortlistStore> {
  try {
    const raw = await fs.readFile(getStorePath(), "utf-8");
    return JSON.parse(raw) as ShortlistStore;
  } catch {
    return { items: {} };
  }
}

async function writeStore(store: ShortlistStore): Promise<void> {
  const filePath = getStorePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(store, null, 2));
}

export async function getShortlistCarIds(sessionId: string): Promise<string[]> {
  const store = await readStore();
  const items = store.items[sessionId] ?? [];
  return items.map((item) => item.carId);
}

export async function addShortlistItem(sessionId: string, carId: string): Promise<void> {
  const store = await readStore();
  const items = store.items[sessionId] ?? [];
  if (!items.some((item) => item.carId === carId)) {
    items.unshift({ carId, addedAt: new Date().toISOString() });
  }
  store.items[sessionId] = items;
  await writeStore(store);
}

export async function removeShortlistItem(sessionId: string, carId: string): Promise<void> {
  const store = await readStore();
  store.items[sessionId] = (store.items[sessionId] ?? []).filter((item) => item.carId !== carId);
  await writeStore(store);
}

export async function getShortlistCount(sessionId: string): Promise<number> {
  const store = await readStore();
  return (store.items[sessionId] ?? []).length;
}
