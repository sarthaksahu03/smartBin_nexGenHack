from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from . import aqi_model, utils
import pandas as pd
from datetime import datetime, timedelta, timezone
try:
    from .pipeline import pivot_wide, clean_and_engineer, attach_alerts_and_suggestions, build_realtime_snapshot
except Exception:
    # Allow running app even if module layout differs
    from . import pipeline as _pipeline
    pivot_wide = _pipeline.pivot_wide
    clean_and_engineer = _pipeline.clean_and_engineer
    attach_alerts_and_suggestions = _pipeline.attach_alerts_and_suggestions
    build_realtime_snapshot = _pipeline.build_realtime_snapshot

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/current")
def get_current_aqi(lat: float = Query(None), lon: float = Query(None)):
    return utils.fetch_current_aqi(lat, lon)

@app.get("/forecast")
def get_aqi_forecast(lat: float = Query(None), lon: float = Query(None)):
    return aqi_model.forecast_next_12_hours(lat, lon)


@app.get("/dataset/latest")
def get_latest_dataset(
    city: str = Query(None, description="Filter by city"),
    hours: int = Query(24, ge=1, le=168, description="Lookback hours"),
    limit: int = Query(100, ge=1, le=1000, description="Max rows to return"),
):
    try:
        csv_path = os.path.join(os.path.dirname(__file__), '../openaq_72h.csv')
        if not os.path.exists(csv_path):
            return {"rows": [], "count": 0}
        df_long = pd.read_csv(csv_path, parse_dates=["datetime"]) if os.path.getsize(csv_path) > 0 else pd.DataFrame()
        if df_long is None or df_long.empty:
            return {"rows": [], "count": 0}
        cutoff = pd.Timestamp.now(tz=timezone.utc) - pd.Timedelta(hours=hours)
        df_long = df_long[df_long["datetime"] >= cutoff]
        if df_long.empty:
            return {"rows": [], "count": 0}
        wide = pivot_wide(df_long)
        cleaned = clean_and_engineer(wide)
        enriched = attach_alerts_and_suggestions(cleaned)
        if city:
            enriched = enriched[enriched['city'].str.lower() == city.lower()]
        if enriched.empty:
            return {"rows": [], "count": 0}
        cols = [c for c in [
            'datetime','city','location','latitude','longitude','aqi','dominant_pollutant','mitigation','alert','alert_message',
            'PM2.5','PM10','NO2','SO2','OZONE','CO'
        ] if c in enriched.columns]
        enriched = enriched.sort_values('datetime', ascending=False)
        out = enriched[cols].head(limit).copy()
        # add IST timestamp alongside UTC
        out['datetime_utc'] = out['datetime']
        try:
            out['datetime_ist'] = out['datetime'].dt.tz_convert('Asia/Kolkata')
        except Exception:
            out['datetime_ist'] = out['datetime']
        # format strings
        out['datetime'] = out['datetime_utc'].dt.strftime('%Y-%m-%d %H:%M')
        out['datetime_utc'] = out['datetime_utc'].dt.strftime('%Y-%m-%d %H:%M')
        out['datetime_ist'] = pd.to_datetime(out['datetime_ist']).dt.strftime('%Y-%m-%d %H:%M')
        return {"rows": out.to_dict(orient='records'), "count": int(len(out))}
    except Exception as e:
        return {"rows": [], "count": 0, "error": str(e)}


@app.get("/realtime")
def get_realtime(
    city: str = Query("Delhi", description="City name"),
    lat: float = Query(None, description="Latitude (optional to override)"),
    lon: float = Query(None, description="Longitude (optional to override)"),
):
    try:
        snap = build_realtime_snapshot(city=city, lat=lat, lon=lon)
        return snap
    except Exception as e:
        return {"error": str(e)}
