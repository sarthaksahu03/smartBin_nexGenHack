# City Air Quality Forecast App

A prototype web app to view current AQI, 12-hour forecast, map hotspots, and get health advisories.

## Features
- **Dashboard**: Current AQI, 12-hour forecast (chart), map of hotspots/safe zones, health advisory.
- **Backend**: FastAPI, fetches live AQI from OpenAQ, predicts next 12 hours using Linear Regression on sample CSV data.
- **Frontend**: React, standard CSS, Recharts (chart), Leaflet (map).

---

## Setup

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # No API keys needed - using free services
uvicorn app.main:app --reload
```

- The backend runs at `http://localhost:8000`.
- Endpoints:
  - `/current` — current AQI from OpenAQ (with CSV fallback)
  - `/forecast` — 12-hour AQI forecast using historical data

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
- The frontend runs at `http://localhost:5173` (default Vite port).

---

## .env Example (backend/.env.example)
```
# No API keys needed - using OpenAQ and OpenStreetMap Nominatim (both free)
CITY_LAT=28.6139
CITY_LON=77.2090
```

---

## Notes
- **Current AQI**: Uses OpenAQ API (with your API key) for live data, falls back to your CSV if no data available.
- **Forecast**: Uses OpenAQ historical data if available, otherwise uses your CSV (`backend/govdata.csv`).
- **Geocoding**: Uses OpenStreetMap Nominatim (free) for city name to coordinates conversion.
- No persistent database is used.
- If you want to deploy, set up CORS and environment variables securely.

---

## Tech Stack
- **Backend**: FastAPI, scikit-learn, pandas, requests
- **Frontend**: React, Recharts, Leaflet, CSS
