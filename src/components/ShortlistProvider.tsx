"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSessionId } from "@/lib/session";

interface ShortlistContextValue {
  count: number;
  refreshCount: () => void;
  setCount: (n: number) => void;
}

const ShortlistContext = createContext<ShortlistContextValue>({
  count: 0,
  refreshCount: () => {},
  setCount: () => {},
});

const COUNT_CACHE_KEY = "shortlist_count";

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [count, setCountState] = useState(0);

  const setCount = useCallback((n: number) => {
    setCountState(n);
    try {
      sessionStorage.setItem(COUNT_CACHE_KEY, String(n));
    } catch {
      /* ignore */
    }
  }, []);

  const refreshCount = useCallback(() => {
    const sessionId = getSessionId();
    fetch(`/api/shortlist?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, [setCount]);

  useEffect(() => {
    getSessionId();
    try {
      const cached = sessionStorage.getItem(COUNT_CACHE_KEY);
      if (cached) setCountState(parseInt(cached, 10));
    } catch {
      /* ignore */
    }
    refreshCount();

    const handler = () => refreshCount();
    window.addEventListener("shortlist-updated", handler);
    return () => window.removeEventListener("shortlist-updated", handler);
  }, [refreshCount]);

  return (
    <ShortlistContext.Provider value={{ count, refreshCount, setCount }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  return useContext(ShortlistContext);
}
