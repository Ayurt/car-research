"use client";

const STEPS = [
  "Scanning 47 cars in our database",
  "Matching your budget & preferences",
  "Ranking by safety, mileage & reviews",
  "Preparing your personalised shortlist",
];

export function CarLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Road */}
      <div className="relative w-full max-w-md h-24 mb-8">
        <div className="absolute bottom-4 left-0 right-0 h-1 bg-white/10 rounded-full" />
        <div className="absolute bottom-3 left-0 right-0 flex justify-between px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-6 h-0.5 bg-white/20 rounded" />
          ))}
        </div>

        {/* Animated car */}
        <div className="absolute bottom-5 left-0 animate-drive-car">
          <svg width="72" height="36" viewBox="0 0 72 36" fill="none" className="drop-shadow-lg">
            <path
              d="M8 22h48l-4-8H20l-4-8H8v16z"
              fill="#f97316"
            />
            <path d="M16 14h28l3 6H16v-6z" fill="#fb923c" />
            <rect x="18" y="10" width="10" height="6" rx="1" fill="#1e293b" opacity="0.6" />
            <rect x="36" y="10" width="10" height="6" rx="1" fill="#1e293b" opacity="0.6" />
            <circle cx="18" cy="24" r="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="18" cy="24" r="2.5" fill="#64748b" />
            <circle cx="54" cy="24" r="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="54" cy="24" r="2.5" fill="#64748b" />
            <rect x="62" y="16" width="4" height="3" rx="1" fill="#fbbf24" className="animate-blink" />
          </svg>
        </div>

        {/* Exhaust puffs */}
        <div className="absolute bottom-8 left-0 animate-drive-car">
          <div className="relative -left-4">
            <span className="absolute w-2 h-2 rounded-full bg-white/10 animate-puff-1" />
            <span className="absolute w-3 h-3 rounded-full bg-white/5 animate-puff-2" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Finding your perfect matches</h3>
      <p className="text-slate-400 text-sm mb-6 text-center">This only takes a moment...</p>

      {/* Progress steps */}
      <div className="space-y-2.5 w-full max-w-xs">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full bg-orange-500 animate-step-pulse"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
            <span className="text-sm text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
