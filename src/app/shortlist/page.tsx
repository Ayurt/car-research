import { ShortlistView } from "@/components/ShortlistView";
import { getServerSessionId } from "@/lib/server-session";
import { getShortlistCars } from "@/lib/shortlist";

export default async function ShortlistPage() {
  const sessionId = await getServerSessionId();
  const cars = sessionId ? await getShortlistCars(sessionId) : [];

  return <ShortlistView initialCars={cars} />;
}
