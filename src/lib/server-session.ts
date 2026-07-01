import { cookies } from "next/headers";

export const SESSION_COOKIE = "autoshortlist_session";

export async function getServerSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}
