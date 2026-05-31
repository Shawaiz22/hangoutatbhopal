# Hangout Bhopal 🧭

> An AI-powered hyperlocal city guide for Bhopal, India. Tell it your mood, company, and budget — it finds the perfect spot.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss) ![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)

---

## What it does

Hangout Bhopal takes a short 4-question quiz about your current mood, who you're with, your budget, and how far you're willing to travel. It then uses **Google Gemini 2.5 Flash** to generate three tailored hangout recommendations — real, verified places in Bhopal — enriched with live data from the **Google Maps Platform** and current weather from **Open-Meteo**.

Each recommendation includes:
- A photo, vibe score, and category badge
- A "why you'll love it right now" explanation that factors in weather and time of day
- Estimated budget, best time to visit, and a must-try item
- Driving, walking, and transit commute times from Bhopal city center
- Direct links to Google Maps directions and Ola ride booking
- Top Google reviews
- An interactive embedded map preview

You can save spots to a local bookmark drawer, hide ones you don't like, and share recommendations with friends.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| AI suggestions | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Place search & directions | Google Maps Platform (Places API, Directions API) |
| Weather | Open-Meteo (free, no key required) |
| Icons | Lucide React |
| Font | Plus Jakarta Sans |

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini
- A [Google Maps Platform](https://console.cloud.google.com/) API key with **Places API** and **Directions API** enabled

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/hangout-bhopal.git
cd hangout-bhopal

# Install dependencies
npm install
```

### Environment variables

Copy the example file and fill in your keys:

```bash
cp .env.local.example .env.local
```

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> **Note:** The app works without API keys — it falls back to a curated mock dataset of real Bhopal spots and estimated commute times. This is useful for local development without burning API quota.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

```
User completes quiz
       │
       ▼
POST /api/suggest
  └─ Sends mood + weather to Gemini 2.5 Flash
  └─ Returns 3 structured place suggestions (JSON)
       │
       ▼
POST /api/places
  └─ For each suggestion:
     ├─ Google Places Text Search → place_id, rating, photos, coordinates
     ├─ Google Place Details → reviews, phone, website, open status
     └─ Google Directions API → driving / walking / transit times from city center
       │
       ▼
GET /api/weather  (fetched on page load, cached 5 min)
  └─ Open-Meteo forecast for Bhopal (lat 23.2599, lng 77.4126)
```

The Gemini prompt is context-aware: it receives the current IST time, day of week, live weather, and strict mood-to-category rules (e.g. "Adventurous" only returns parks, lakes, and nature spots — never cafes or malls).

---

## Project structure

```
├── app/
│   ├── api/
│   │   ├── suggest/route.ts    # Gemini suggestion endpoint
│   │   ├── places/route.ts     # Google Maps enrichment endpoint
│   │   ├── places/photo/route.ts  # Photo proxy (avoids CORS)
│   │   └── weather/route.ts    # Open-Meteo weather endpoint
│   ├── page.tsx                # Main app page & state management
│   ├── layout.tsx              # Root layout & metadata
│   └── globals.css             # Global styles & Tailwind config
├── components/
│   ├── MoodQuiz.tsx            # 4-step animated quiz
│   ├── LocationCard.tsx        # Place card with commute & reviews
│   ├── MapEmbed.tsx            # Google Maps iframe embed
│   ├── ReviewsPanel.tsx        # Collapsible Google reviews
│   └── WeatherBadge.tsx        # Live weather display in header
├── lib/
│   ├── gemini.ts               # Gemini API client + mock fallback
│   ├── maps.ts                 # Google Maps API client + mock fallback
│   └── weather.ts              # Open-Meteo client + WMO code mapping
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## Features at a glance

- **Mood-aware AI** — Gemini picks places that match your vibe, not just a generic list
- **Weather-integrated** — recommendations factor in current Bhopal weather conditions
- **Time-aware** — suggestions respect current IST time and day of week
- **Save & bookmark** — saved spots persist in `localStorage` and open in a slide-out drawer
- **Hide spots** — dismiss recommendations you don't want; reset them any time
- **Dark map embed** — Google Maps iframe is CSS-inverted to match the dark UI
- **Graceful fallbacks** — every API call has a mock fallback so the app never breaks without keys
- **Share** — uses the Web Share API with clipboard fallback

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## License

MIT
