import os
import time
import json
import math
import sqlite3
from datetime import datetime, timedelta, timezone

import pandas as pd
import numpy as np
import requests

try:
    from .utils import POLLUTANT_MAP, compute_subindex, fetch_current_aqi
except Exception:
    # Allow running as a script: python backend/app/pipeline.py
    import sys as _sys
    _sys.path.append(os.path.dirname(__file__))
    from utils import POLLUTANT_MAP, compute_subindex, fetch_current_aqi


OPENAQ_BASE_URL = "https://api.openaq.org/v2/measurements"
OPENAQ_CITIES_URL_V2 = "https://api.openaq.org/v2/cities"
OPENAQ_CITIES_URL_V3 = "https://api.openaq.org/v3/cities"
OPENMETEO_AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"


def _get_api_headers() -> dict:
    api_key = os.getenv("OPENAQ_API_KEY") or "823b0b1ae3d5f9544609a37d80a7722d08571f4d07b933a42e9c147976a89e23"
    headers = {"Accept": "application/json"}
    if api_key:
        headers["X-API-Key"] = api_key
    return headers


def fetch_india_cities() -> pd.DataFrame:
    params = {
        "country": "IN",
        "limit": 10000,
        "page": 1,
        "sort": "asc",
        "order_by": "city",
    }
    headers = _get_api_headers()
    # Try v3
    try:
        resp = requests.get(OPENAQ_CITIES_URL_V3, params=params, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json().get("results", [])
        if data:
            return pd.DataFrame.from_records([{"city": item.get("city")} for item in data if item.get("city")]).drop_duplicates()
    except Exception:
        pass
    # Try v2
    try:
        resp = requests.get(OPENAQ_CITIES_URL_V2, params=params, headers=headers, timeout=60)
        resp.raise_for_status()
        data = resp.json().get("results", [])
        if data:
            return pd.DataFrame.from_records([{"city": item.get("city")} for item in data if item.get("city")]).drop_duplicates()
    except Exception:
        pass
    # Fallback: minimal curated list to keep pipeline functional (with coordinates)
    fallback_cities = [
        {"city": "Delhi", "latitude": 28.6139, "longitude": 77.2090},
        {"city": "Mumbai", "latitude": 19.0760, "longitude": 72.8777},
        {"city": "Bengaluru", "latitude": 12.9716, "longitude": 77.5946},
        {"city": "Kolkata", "latitude": 22.5726, "longitude": 88.3639},
        {"city": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
        {"city": "Hyderabad", "latitude": 17.3850, "longitude": 78.4867},
        {"city": "Pune", "latitude": 18.5204, "longitude": 73.8567},
        {"city": "Ahmedabad", "latitude": 23.0225, "longitude": 72.5714},
        {"city": "Jaipur", "latitude": 26.9124, "longitude": 75.7873},
        {"city": "Lucknow", "latitude": 26.8467, "longitude": 80.9462},
    ]
    return pd.DataFrame.from_records(fallback_cities)


def _normalize_parameter(param: str) -> str:
    if not param:
        return None
    up = param.upper()
    if up == "PM25":
        return "PM2.5"
    if up == "PM10":
        return "PM10"
    if up == "NO2":
        return "NO2"
    if up == "O3":
        return "OZONE"
    if up == "CO":
        return "CO"
    if up == "SO2":
        return "SO2"
    if up == "NH3":
        return "NH3"
    return None


def fetch_recent_measurements_for_city(city: str = None, lat: float = None, lon: float = None, hours: int = 72) -> pd.DataFrame:
    now = datetime.now(timezone.utc)
    date_from = (now - timedelta(hours=hours)).isoformat()
    params = {
        "date_from": date_from,
        "limit": 10000,
        "sort": "desc",
        "order_by": "datetime",
        "country": "IN",
    }
    if city:
        params["city"] = city
    elif lat is not None and lon is not None:
        params["coordinates"] = f"{lat},{lon}"
        params["radius"] = 15000
    headers = _get_api_headers()
    resp = requests.get(OPENAQ_BASE_URL, params=params, headers=headers, timeout=90)
    resp.raise_for_status()
    results = resp.json().get("results", [])
    if not results:
        return pd.DataFrame()
    records = []
    for r in results:
        dt = r.get("date", {}).get("utc")
        param = _normalize_parameter(r.get("parameter"))
        value = r.get("value")
        city_name = r.get("city")
        location = r.get("location")
        if dt and param and value is not None:
            try:
                dt_parsed = pd.to_datetime(dt)
            except Exception:
                continue
            coords = r.get("coordinates") or {}
            rec_lat = coords.get("latitude", lat)
            rec_lon = coords.get("longitude", lon)
            records.append({
                "datetime": dt_parsed,
                "city": city_name,
                "location": location,
                "latitude": rec_lat,
                "longitude": rec_lon,
                "pollutant": param,
                "value": value,
            })
    if not records:
        return pd.DataFrame()
    df = pd.DataFrame.from_records(records)
    # aggregate by hour and pollutant
    df["datetime"] = df["datetime"].dt.floor("H")
    df = df.groupby(["datetime", "city", "location", "latitude", "longitude", "pollutant"], as_index=False)["value"].mean()
    return df


def _seed_cities_with_coords() -> list:
    return [
        {"city": "Delhi", "latitude": 28.6139, "longitude": 77.2090},
        {"city": "Mumbai", "latitude": 19.0760, "longitude": 72.8777},
        {"city": "Bengaluru", "latitude": 12.9716, "longitude": 77.5946},
        {"city": "Kolkata", "latitude": 22.5726, "longitude": 88.3639},
        {"city": "Chennai", "latitude": 13.0827, "longitude": 80.2707},
        {"city": "Hyderabad", "latitude": 17.3850, "longitude": 78.4867},
        {"city": "Pune", "latitude": 18.5204, "longitude": 73.8567},
        {"city": "Ahmedabad", "latitude": 23.0225, "longitude": 72.5714},
        {"city": "Jaipur", "latitude": 26.9124, "longitude": 75.7873},
        {"city": "Lucknow", "latitude": 26.8467, "longitude": 80.9462},
    ]


def fetch_openmeteo_hourly(lat: float, lon: float, hours: int = 72, city_name: str = None) -> pd.DataFrame:
    past_days = int(math.ceil(hours / 24))
    params = {
        "latitude": lat,
        "longitude": lon,
        "hourly": ",".join([
            "pm2_5", "pm10", "nitrogen_dioxide", "sulphur_dioxide", "ozone", "carbon_monoxide"
        ]),
        "past_days": past_days,
        "timezone": "UTC",
    }
    try:
        resp = requests.get(OPENMETEO_AIR_URL, params=params, timeout=60)
        resp.raise_for_status()
    except Exception:
        return pd.DataFrame()
    data = resp.json()
    hourly = data.get("hourly") or {}
    times = hourly.get("time") or []
    if not times:
        return pd.DataFrame()
    df = pd.DataFrame({
        "datetime": pd.to_datetime(times, utc=True),
        "PM2.5": hourly.get("pm2_5"),
        "PM10": hourly.get("pm10"),
        "NO2": hourly.get("nitrogen_dioxide"),
        "SO2": hourly.get("sulphur_dioxide"),
        "OZONE": hourly.get("ozone"),
        "CO": hourly.get("carbon_monoxide"),
    })
    df["city"] = city_name or "Unknown"
    df["location"] = city_name or "Unknown"
    df["latitude"] = lat
    df["longitude"] = lon
    now_utc = pd.Timestamp.now(tz="UTC")
    cutoff = now_utc - pd.Timedelta(hours=hours)
    df = df[df["datetime"] >= cutoff]
    return df


def _get_city_coords_by_name(city_name: str):
    if not city_name:
        return None
    city_name_lower = city_name.strip().lower()
    for item in _seed_cities_with_coords():
        if item["city"].lower() == city_name_lower:
            return (item["latitude"], item["longitude"], item["city"])
    return None


def mitigation_suggestions(dominant: str) -> list:
    if dominant in ("PM2.5", "PM10"):
        return [
            "Deploy air-purifying plants (Areca Palm, Money Plant, Snake Plant)",
            "Introduce water sprinkling on roads in affected zones",
            "Control construction dust; cover debris and stockpiles",
            "Advise N95 masks for sensitive groups"
        ]
    if dominant in ("NO2", "SO2"):
        return [
            "Promote carpooling and public transport in next 12 hours",
            "Restrict heavy-duty truck entry during peak hours",
            "Optimize traffic flow and reduce idling near hotspots",
            "Encourage remote work where possible"
        ]
    if dominant == "OZONE":
        return [
            "Reduce outdoor exercise during afternoon; stay indoors",
            "Avoid solvent/paint usage today; ventilate indoor spaces",
            "Shift outdoor tasks to morning/evening",
            "Advise schools to limit strenuous outdoor activities"
        ]
    return [
        "General: limit outdoor activity; use masks and ventilation",
        "Keep windows closed during peak pollution hours"
    ]


def build_realtime_snapshot(city: str = "Delhi", lat: float = None, lon: float = None) -> dict:
    city_name = city or "Unknown"
    if lat is not None and lon is not None:
        lat, lon = float(lat), float(lon)
        if not city_name or city_name == "Unknown":
            city_name = "Custom"
    else:
        coords = _get_city_coords_by_name(city_name) or (28.6139, 77.2090, city_name)
        lat, lon, city_name = coords
    # Try OpenAQ 'current' for within-hour updates; fallback to Open-Meteo hourly
    current = None
    try:
        current = fetch_current_aqi(lat, lon)
    except Exception:
        current = None
    df = fetch_openmeteo_hourly(lat, lon, hours=6, city_name=city_name)
    if df.empty:
        return {"rows": [], "count": 0, "city": city_name}
    # take the latest row
    row = df.sort_values("datetime").iloc[-1]
    # compute AQI + dominance using Indian subindices
    pollutant_vals = {p: row.get(p) for p in ["PM2.5","PM10","NO2","SO2","OZONE","CO"]}
    subidx = {}
    for p, val in pollutant_vals.items():
        if pd.isna(val):
            continue
        if p == "CO":
            try:
                val = float(val) / 1000.0
            except Exception:
                pass
        si = compute_subindex(p, val)
        if si is not None:
            subidx[p] = si
    aqi = max(subidx.values()) if subidx else None
    dominant = _detect_dominant_from_subindices(subidx)
    # If OpenAQ current is available, overlay its AQI for more real-time feel
    if isinstance(current, dict) and current.get('aqi') is not None:
        aqi = current['aqi']
        # use its subindices if present to set dominant
        cur_si = current.get('pollutant_subindices') or {}
        if cur_si:
            dominant = _detect_dominant_from_subindices(cur_si)
    suggestions = mitigation_suggestions(dominant) if dominant else mitigation_suggestions(None)
    # alert condition: AQI > 200 and check last 3 hours if available
    df_sorted = df.sort_values("datetime")
    recent = df_sorted.tail(3)
    recent_aqi = []
    for _, r in recent.iterrows():
        tmp = {}
        for p in ["PM2.5","PM10","NO2","SO2","OZONE","CO"]:
            v = r.get(p)
            if pd.isna(v):
                continue
            if p == "CO":
                try:
                    v = float(v) / 1000.0
                except Exception:
                    pass
            si = compute_subindex(p, v)
            if si is not None:
                tmp[p] = si
        recent_aqi.append(max(tmp.values()) if tmp else 0)
    alert = len(recent_aqi) == 3 and all(x > 200 for x in recent_aqi)
    # timestamp: prefer actual data timestamp from OpenAQ, else latest hour from Open-Meteo
    if current and current.get('aqi') is not None and current.get('last_update'):
        # Use the actual timestamp from OpenAQ data
        try:
            dt_utc = pd.to_datetime(current['last_update']).tz_localize('UTC')
        except Exception:
            # Fallback to current time if parsing fails
            dt_utc = pd.Timestamp.now(tz="UTC")
    else:
        # Use the latest hour from Open-Meteo data
        dt_utc = row["datetime"]
    try:
        dt_ist = dt_utc.tz_convert("Asia/Kolkata")
    except Exception:
        dt_ist = dt_utc
    return {
        "city": city_name,
        "datetime_utc": dt_utc.strftime('%Y-%m-%d %H:%M'),
        "datetime_ist": pd.to_datetime(dt_ist).strftime('%Y-%m-%d %H:%M'),
        "aqi": aqi,
        "dominant_pollutant": dominant,
        "alert": alert,
        "alert_message": "AQI > 200 for >2 hours: Take mitigation actions" if alert else "",
        "suggestions": suggestions,
        "values": pollutant_vals,
        "lat": float(lat),
        "lon": float(lon),
    }


def update_sliding_window_csv(csv_path: str, df_new: pd.DataFrame, window_hours: int = 72) -> pd.DataFrame:
    if df_new is None or df_new.empty:
        if os.path.exists(csv_path):
            existing = pd.read_csv(csv_path, parse_dates=["datetime"])
            cutoff = pd.Timestamp.utcnow() - pd.Timedelta(hours=window_hours)
            existing = existing[existing["datetime"] >= cutoff]
            existing.to_csv(csv_path, index=False)
            return existing
        # Create an empty CSV with standard columns if no data and file absent
        empty_cols = ["datetime", "city", "location", "latitude", "longitude", "pollutant", "value"]
        empty_df = pd.DataFrame(columns=empty_cols)
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        empty_df.to_csv(csv_path, index=False)
        return empty_df
    if os.path.exists(csv_path):
        existing = pd.read_csv(csv_path, parse_dates=["datetime"])
        combined = pd.concat([existing, df_new], ignore_index=True)
    else:
        combined = df_new.copy()
    combined = combined.drop_duplicates(subset=["datetime", "city", "location", "pollutant"])
    cutoff = pd.Timestamp.utcnow() - pd.Timedelta(hours=window_hours)
    combined = combined[combined["datetime"] >= cutoff]
    combined = combined.sort_values("datetime")
    combined.to_csv(csv_path, index=False)
    return combined


def pivot_wide(df_long: pd.DataFrame) -> pd.DataFrame:
    if df_long is None or df_long.empty:
        return pd.DataFrame()
    wide = df_long.pivot_table(index=["datetime", "city", "location", "latitude", "longitude"],
                               columns="pollutant", values="value", aggfunc="mean").reset_index()
    # Ensure pollutant columns exist even if missing in data
    for p in ["PM2.5", "PM10", "NO2", "SO2", "OZONE", "CO", "NH3"]:
        if p not in wide.columns:
            wide[p] = np.nan
    wide = wide.sort_values("datetime")
    return wide


def clean_and_engineer(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()
    df = df.copy()
    df["datetime"] = pd.to_datetime(df["datetime"], utc=True)
    df = df.sort_values("datetime")
    # forward fill within each city/location
    df = df.groupby(["city", "location"], as_index=False).apply(lambda g: g.ffill()).reset_index(drop=True)
    # normalization (z-score) per pollutant across the window
    pollutant_cols = [c for c in ["PM2.5", "PM10", "NO2", "SO2", "OZONE", "CO", "NH3"] if c in df.columns]
    for col in pollutant_cols:
        col_mean = df[col].mean()
        col_std = df[col].std()
        if pd.notna(col_std) and col_std > 0:
            df[f"{col}_z"] = (df[col] - col_mean) / col_std
        else:
            df[f"{col}_z"] = 0.0
    # time features
    df["hour"] = df["datetime"].dt.hour
    df["day"] = df["datetime"].dt.day
    df["weekday"] = df["datetime"].dt.weekday
    df["is_weekend"] = (df["weekday"] >= 5).astype(int)
    return df


def build_training_frame(df: pd.DataFrame, horizon_hours: int = 12) -> pd.DataFrame:
    if df is None or df.empty:
        return pd.DataFrame()
    df = df.copy()
    # Define AQI proxy as max of subindices-like using available pollutants; if true AQI is not present, we can approximate by max pollutant z back-transformed
    # Here, we create a target as future PM2.5 as a proxy if AQI not present; otherwise if an "aqi" column exists, we use it.
    if "aqi" in df.columns:
        target_series = df.groupby(["city", "location"], as_index=False)["aqi"].shift(-horizon_hours)
        df["target_aqi_h+12"] = df["aqi"].shift(-horizon_hours)
    else:
        df["target_aqi_h+12"] = df["PM2.5"].shift(-horizon_hours)
    # Drop rows without target
    df = df.dropna(subset=["target_aqi_h+12"])
    return df


def _detect_dominant_from_subindices(subindices: dict) -> str:
    if not subindices:
        return None
    return max(subindices, key=subindices.get)


def mitigation_message(dominant: str) -> str:
    if dominant in ("PM2.5", "PM10"):
        return "Plant air-purifying trees/plants, use road sprinkling"
    if dominant in ("NO2", "SO2"):
        return "Promote carpooling, restrict heavy traffic"
    if dominant == "OZONE":
        return "Reduce outdoor exposure, avoid solvent/paint use"
    return "General: limit outdoor activity, use masks and ventilation"


def attach_alerts_and_suggestions(df: pd.DataFrame) -> pd.DataFrame:
    if df is None or df.empty:
        return df
    df = df.copy()
    # Compute AQI using Indian subindices; convert CO µg/m³ -> mg/m³
    pollutant_cols = [c for c in ["PM2.5", "PM10", "NO2", "SO2", "OZONE", "CO"] if c in df.columns]
    aqi_vals = []
    dominant = []
    for _, row in df.iterrows():
        subidx = {}
        for p in pollutant_cols:
            val = row.get(p)
            if pd.isna(val):
                continue
            if p == "CO":
                try:
                    val = float(val) / 1000.0
                except Exception:
                    pass
            si = compute_subindex(p, val)
            if si is not None:
                subidx[p] = si
        if subidx:
            aqi_vals.append(max(subidx.values()))
            dominant.append(_detect_dominant_from_subindices(subidx))
        else:
            aqi_vals.append(None)
            dominant.append(None)
    df["aqi"] = aqi_vals
    df["dominant_pollutant"] = dominant
    df["mitigation"] = df["dominant_pollutant"].apply(mitigation_message)
    # Trigger alert if AQI > 200 for more than 2 consecutive hours per city/location
    df = df.sort_values(["city", "location", "datetime"]).reset_index(drop=True)
    alerts = []
    for (city, location), g in df.groupby(["city", "location" ], sort=False):
        over = (g["aqi"].fillna(0) > 200).astype(int)
        # rolling sum over 3-hour window; if last 3 sum >= 3, mark alert on current row
        rolling = over.rolling(window=3, min_periods=3).sum()
        alert_flags = (rolling >= 3).astype(bool).values
        alerts.extend(list(alert_flags))
    df["alert"] = alerts
    df["alert_message"] = np.where(df["alert"], "AQI > 200 for >2 hours: Take mitigation actions", "")
    return df


def run_pipeline(csv_out_path: str = None, hours: int = 72) -> pd.DataFrame:
    # Prefer Open-Meteo (no API key required) for reliability
    seed = _seed_cities_with_coords()
    all_wide = []
    for item in seed:
        df_city = fetch_openmeteo_hourly(item["latitude"], item["longitude"], hours=hours, city_name=item["city"])
        if not df_city.empty:
            all_wide.append(df_city)
        time.sleep(0.1)
    if not all_wide:
        return pd.DataFrame()
    wide_all = pd.concat(all_wide, ignore_index=True)
    if csv_out_path is None:
        csv_out_path = os.path.join(os.path.dirname(__file__), "../openaq_72h.csv")
    # Save long form for continuity, then engineer on wide
    df_long = wide_all.melt(id_vars=["datetime", "city", "location", "latitude", "longitude"],
                            value_vars=["PM2.5", "PM10", "NO2", "SO2", "OZONE", "CO"],
                            var_name="pollutant", value_name="value")
    updated = update_sliding_window_csv(csv_out_path, df_long, window_hours=hours)
    wide = pivot_wide(updated)
    cleaned = clean_and_engineer(wide)
    cleaned = attach_alerts_and_suggestions(cleaned)
    # brief summary log
    try:
        print(f"Fetched rows: {len(df_long)}, after window+clean: {len(cleaned)}")
    except Exception:
        pass
    return cleaned


def scheduler_loop(csv_out_path: str = None, hours: int = 72):
    while True:
        try:
            _ = run_pipeline(csv_out_path=csv_out_path, hours=hours)
        except Exception:
            pass
        # run hourly
        time.sleep(3600)


if __name__ == "__main__":
    out_csv = os.path.join(os.path.dirname(__file__), "../openaq_72h.csv")
    df = run_pipeline(csv_out_path=out_csv, hours=72)
    print(f"Rows: {len(df)}; Columns: {list(df.columns)}")

