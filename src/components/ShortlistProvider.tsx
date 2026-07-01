"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSessionId } from "@/lib/session";

interface ShortlistContextValue {
  count: number;
  refreshCount: () => void;
  setCount: (n: number | ((prev: number) => number)) => void;
}

const ShortlistContext = createContext<ShortlistContextValue>({
  count: 0,
  refreshCount: () => {},
  setCount: () => {},
});

const COUNT_CACHE_KEY = "shortlist_count";

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [count, setCountState] = useState(0);

  const setCount = useCallback((n: number | ((prev: number) => number)) => {
    setCountState((prev) => {
      const next = typeof n === "function" ? n(prev) : n;
      try {
        sessionStorage.setItem(COUNT_CACHE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const refreshCount = useCallback(() => {
    const sessionId = getSessionId();
    fetch(`/api/shortlist?sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* keep current count on network error */
      });
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
