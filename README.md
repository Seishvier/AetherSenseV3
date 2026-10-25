# AetherSense v2.0 — Modern Stack Edition

A responsive client-side weather and air-quality dashboard built with React 19, TypeScript, Vite, Tailwind CSS v4, and Lucide React.

## Features

- Open-Meteo city geocoding, current conditions, hourly weather, seven-day forecast, and air quality data.
- Search for worldwide cities or use browser geolocation.
- Interactive SVG trends for temperature, humidity, precipitation, and European AQI across 24 hours, 7 days, and 14 days.
- Browser-local snapshots and recent-location history using `localStorage`.
- Contextual recommendations grouped into Health, Agriculture, and Outdoor Activity.
- Crop profiles for rice, highland vegetables, apples, and coffee.
- Dark/light themes, weather-adaptive color accents, responsive mobile navigation, and °C/°F display toggle.
- About and team section.
- No QR code, backend, database, or API key.

## Run locally

Requires Node.js 20.19+ or 22.12+ recommended for current Vite releases.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

The static site is written to `dist/`.

## Deploy to Vercel

Import the repository in Vercel. It should detect Vite automatically. Build command: `npm run build`; output directory: `dist`.

## Deploy to GitHub Pages

Set Vite's `base` in `vite.config.ts` to `'/REPOSITORY_NAME/'` when deploying to a project page, then build and publish `dist/` using GitHub Actions or Pages static deployment. For a custom domain or root deployment, `base: '/'` is suitable.

## Data and limitations

Open-Meteo forecast and air-quality endpoints provide model-based area estimates, not personal sensor measurements. AQI is the European AQI scale. Historical views rely on API time-series data plus local snapshots collected when the app successfully loads. Local snapshots are stored in this browser only.

The crop recommendation engine is a transparent rule-based educational helper. It does not diagnose plant disease and does not know actual soil moisture, crop variety, soil type, or growth stage. Confirm agricultural decisions with direct field observations and local agronomy guidance.

## Sources

- https://open-meteo.com/en/docs
- https://open-meteo.com/en/docs/air-quality-api
- https://open-meteo.com/en/docs/geocoding-api
