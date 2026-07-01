const SESSION_KEY = "autoshortlist_session";
export const SESSION_COOKIE = "autoshortlist_session";

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  document.cookie = `${SESSION_COOKIE}=${id};path=/;max-age=31536000;SameSite=Lax`;
  return id;
}
