# AutoShortlist — Car Buyer Decision Tool

> **Go from "I don't know what to buy" to "I'm confident about my shortlist" in under 2 minutes.**

A guided car-finder for confused buyers. Answer 3 quick questions about budget, body type, and priorities — get ranked matches with explanations, then save favorites to a persistent shortlist with side-by-side comparison.

**GitHub:** [github.com/Ayurt/car-research](https://github.com/Ayurt/car-research)



**Live Link:** [https://car-research-production.up.railway.app/](https://car-research-production.up.railway.app/)

**Live demo:** Deploy using instructions below (Railway recommended).

---

## Quick Start (under 2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Set up database (migrate + seed 47 cars)
npm run setup

# 3. Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker (alternative)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000)

---

## What I Built and Why

### The Problem
Car buyers face **choice overload** — dozens of makes, variants, and conflicting specs. Browsing listings doesn't help; they need **guided narrowing**.

### The Solution: AutoShortlist
A **3-step preference wizard** that:
1. Captures **budget range** (₹5L–₹70L sliders)
2. Filters by **body type, fuel, and seating**
3. Ranks cars by **weighted priorities** (budget, mileage, safety, features, reviews)

Each match shows a **match %** and **plain-English reasons** ("Fits your ₹8–15L budget", "5-star safety rating"). Buyers add favorites to a **persistent shortlist** and compare specs side-by-side.

### What I Deliberately Cut
| Cut | Why |
|-----|-----|
| User accounts / login | Session-based shortlist is faster to ship; buyers don't need another password |
| Real CarDekho API integration | Curated dataset of 47 popular Indian cars is enough to demo the matching logic |
| AI chat / LLM recommendations | Deterministic scoring is explainable, testable, and doesn't need API keys |
| Dealer listings, EMI calculator, test-drive booking | Out of scope for a 2–3 hour MVP |
| Mobile app | Responsive web covers mobile use cases |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 16 + React 19 + Tailwind CSS 4 | Single repo, fast dev, great DX, easy deploy |
| **Backend** | Next.js API Routes | Co-located with frontend; no separate server to manage |
| **Database** | SQLite + Prisma 7 | Zero-config local dev; file-based persistence |
| **Matching** | Custom weighted scoring (`src/lib/matcher.ts`) | Transparent, explainable rankings — not a black box |
| **Deploy** | Docker + Railway / Render | SQLite needs a writable filesystem; serverless (Vercel) won't persist shortlists |

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Wizard    │────▶│  POST /api/match │────▶│  Matcher    │
│  (3 steps)  │     │  (preferences)   │     │  (scoring)  │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                                              │
       │              ┌──────────────────┐            │
       └─────────────▶│ /api/shortlist   │◀───────────┘
                      │ (SQLite via      │
                      │  Prisma)         │
                      └──────────────────┘
```

**API Routes:**
- `GET /api/cars` — list all cars
- `POST /api/match` — score and rank cars by preferences
- `GET/POST/DELETE /api/shortlist` — persist shortlist per browser session

---

## AI Tool Usage (for screen recording notes)

### What I Delegated to AI (Cursor)
- **Scaffolding** — Next.js project setup, Prisma schema, folder structure
- **Boilerplate** — API route templates, Tailwind component structure
- **Dataset** — Generating realistic Indian car data (47 entries)
- **README** — Initial draft of documentation

### What I Did Manually / Reviewed Carefully
- **Product scoping** — Chose wizard + shortlist over chatbot or full comparison engine
- **Matching algorithm** — Designed weighted scoring with hard filters and human-readable reasons
- **Prisma 7 adapter fix** — AI initially used Prisma 6 patterns; had to add `@prisma/adapter-better-sqlite3`
- **Deployment strategy** — Chose Docker/Railway over Vercel because SQLite needs persistent storage

### Where AI Helped Most
- Speed on repetitive UI components (cards, wizard steps, table layout)
- Generating diverse car dataset quickly
- Wiring up Prisma + Next.js boilerplate

### Where AI Got in the Way
- Prisma 7 breaking changes (client now requires driver adapter — not in older training data)
- Import order bugs (useState at bottom of files)
- Over-engineering temptation (AI suggested auth, Redis, etc. — all cut)

---

## If I Had 4 More Hours

1. **Real data pipeline** — Scrape or API-connect to live CarDekho listings
2. **Shareable shortlist links** — `/shortlist/abc123` to send to family
3. **"Why not this car?"** — Show near-misses and what filter excluded them
4. **EMI estimator** — Monthly payment based on budget slider
5. **Tests** — Unit tests for matcher scoring edge cases
6. **Deploy to production** — Railway with custom domain

---

## Deploy to Railway (Recommended)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select this repo — Railway auto-detects the `Dockerfile`
4. Add a **volume** mounted at `/data` for SQLite persistence
5. Set env: `DATABASE_URL=file:/data/dev.db`
6. Deploy — you'll get a public URL

### Deploy to Render

1. New Web Service → Connect GitHub repo
2. Environment: Docker
3. Add persistent disk at `/data`
4. Set `DATABASE_URL=file:/data/dev.db`

---

## Project Structure

```
car-research/
├── data/cars.json          # 47-car dataset
├── prisma/                 # Schema, migrations, seed
├── src/
│   ├── app/
│   │   ├── api/            # match, cars, shortlist endpoints
│   │   ├── shortlist/      # comparison page
│   │   └── page.tsx        # wizard home
│   ├── components/         # Wizard, CarCard, Header
│   ├── lib/                # matcher, db, cars, session
│   └── types/              # TypeScript interfaces
├── Dockerfile
├── docker-compose.yml
└── README.md
```


## License

MIT — built as a take-home assignment for CarDekho Group.
