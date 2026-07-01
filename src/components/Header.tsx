"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShortlist } from "@/components/ShortlistProvider";

export function Header() {
  const { count } = useShortlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "bg-[#0c0f1a]/95 border-b border-white/5 shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" prefetch className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">AutoShortlist</h1>
            <p className="text-xs text-slate-400">Find your perfect car</p>
          </div>
        </Link>

        <Link
          href="/shortlist"
          prefetch
          className="relative flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 hover:border-orange-500/50 transition-colors"
        >
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Shortlist
          {count > 0 && (
            <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
