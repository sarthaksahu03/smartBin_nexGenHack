import os
import pandas as pd
import numpy as np
import requests
from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 6371
    return c * r

INDIAN_AQI_BREAKPOINTS = {
    'PM2.5': [ (0,30,0,50), (31,60,51,100), (61,90,101,200), (91,120,201,300), (121,250,301,400), (251,800,401,500) ],
    'PM10':  [ (0,50,0,50), (51,100,51,100), (101,250,101,200), (251,350,201,300), (351,430,301,400), (431,1000,401,500) ],
    'NO2':   [ (0,40,0,50), (41,80,51,100), (81,180,101,200), (181,280,201,300), (281,400,301,400), (401,1000,401,500) ],
    'OZONE': [ (0,50,0,50), (51,100,51,100), (101,168,101,200), (169,208,201,300), (209,748,301,400), (749,1000,401,500) ],
    'CO':    [ (0,1,0,50), (1.1,2,51,100), (2.1,10,101,200), (10.1,17,201,300), (17.1,34,301,400), (34.1,50,401,500) ],
    'SO2':   [ (0,40,0,50), (41,80,51,100), (81,380,101,200), (381,800,201,300), (801,1600,301,400), (1601,10000,401,500) ],
    'NH3':   [ (0,200,0,50), (201,400,51,100), (401,800,101,200), (801,1200,201,300), (1201,1800,301,400), (1801,4000,401,500) ],
}

POLLUTANT_MAP = {
    'PM2.5': 'PM2.5',
    'PM10': 'PM10',
    'NO2': 'NO2',
    'OZONE': 'OZONE',
    'CO': 'CO',
    'SO2': 'SO2',
    'NH3': 'NH3',
    'PM 2.5': 'PM2.5',
    'PM_2.5': 'PM2.5',
    'PM 10': 'PM10',
    'PM_10': 'PM10',
}

def compute_subindex(pollutant, value):
    if pollutant not in INDIAN_AQI_BREAKPOINTS or value is None or value == 'NA':
        return None
    try:
        value = float(value)
    except:
        return None
    for bp in INDIAN_AQI_BREAKPOINTS[pollutant]:
        BP_lo, BP_hi, I_lo, I_hi = bp
        if BP_lo <= value <= BP_hi:
            # Indian AQI formula:
            # I = (I_hi - I_lo)/(BP_hi - BP_lo) * (C - BP_lo) + I_lo
            I = ((I_hi - I_lo) / (BP_hi - BP_lo)) * (value - BP_lo) + I_lo
            return round(I)
    # If value is above all breakpoints, use the highest
    BP_lo, BP_hi, I_lo, I_hi = INDIAN_AQI_BREAKPOINTS[pollutant][-1]
    if value > BP_hi:
        I = ((I_hi - I_lo) / (BP_hi - BP_lo)) * (value - BP_lo) + I_lo
        return round(I)
    return None

def fetch_current_aqi(lat=None, lon=None):
    # Use OpenAQ API for live data, fallback to CSV if no data
    if lat is None or lon is None:
        lat, lon = 28.6139, 77.2090
    try:
        # OpenAQ API with key for higher rate limits
        api_key = "823b0b1ae3d5f9544609a37d80a7722d08571f4d07b933a42e9c147976a89e23"
        headers = {"X-API-Key": api_key} if api_key else {}
        url = f"https://api.openaq.org/v2/latest?coordinates={lat},{lon}&radius=10000&limit=100"
        resp = requests.get(url, headers=headers)
        data = resp.json()
        if data.get('results'):
            pollutant_avgs = {}
            for result in data['results']:
                for m in result.get('measurements', []):
                    p = m['parameter'].upper()
                    if p == 'PM25':
                        pollutant = 'PM2.5'
                    elif p == 'PM10':
                        pollutant = 'PM10'
                    elif p == 'NO2':
                        pollutant = 'NO2'
                    elif p == 'O3':
                        pollutant = 'OZONE'
                    elif p == 'CO':
                        pollutant = 'CO'
                    elif p == 'SO2':
                        pollutant = 'SO2'
                    elif p == 'NH3':
                        pollutant = 'NH3'
                    else:
                        continue
                    pollutant_avgs[pollutant] = m['value']
            subindices = {p: compute_subindex(p, v) for p, v in pollutant_avgs.items() if v is not None}
            aqi = max(subindices.values()) if subindices else None
            # Debug: print what we're getting
            print(f"DEBUG: pollutant_avgs = {pollutant_avgs}")
            print(f"DEBUG: subindices = {subindices}")
            print(f"DEBUG: computed AQI = {aqi}")
            first_result = data['results'][0] if data['results'] else {}
            city = first_result.get('city') or first_result.get('location') or 'N/A'
            location = first_result.get('location') or 'N/A'
            country = first_result.get('country') or 'N/A'
            last_update = None
            if first_result.get('measurements'):
                last_update = first_result['measurements'][0].get('lastUpdated') or 'N/A'
            return {
                'aqi': aqi,
                'pollutant_subindices': subindices,
                'pollutant_avgs': pollutant_avgs,
                'source': 'OpenAQ',
                'location': location,
                'city': city,
                'country': country,
                'last_update': last_update,
                'debug': {'lat': lat, 'lon': lon}
            }
        # Fallback to Indian historical dataset if OpenAQ has no data
        csv_path = os.path.join(os.path.dirname(__file__), '../indian_historical_aqi.csv')
        df = pd.read_csv(csv_path)
        df = df.dropna(subset=['latitude', 'longitude'])
        df['distance'] = df.apply(lambda row: haversine(lat, lon, row['latitude'], row['longitude']), axis=1)
        nearest_city = df.loc[df['distance'].idxmin()]
        city_name = nearest_city['city']
        city_df = df[df['city'] == city_name]
        latest_time = city_df['datetime'].max()
        latest_df = city_df[city_df['datetime'] == latest_time]
        
        # Get the latest record
        if len(latest_df) > 0:
            latest_row = latest_df.iloc[0]
            subindices = {}
            pollutant_avgs = {}
            
            # Extract pollutant data from the historical dataset
            for pollutant in POLLUTANT_MAP.values():
                if pollutant in latest_row and pd.notna(latest_row[pollutant]):
                    value = latest_row[pollutant]
                    subidx = compute_subindex(pollutant, value)
                    if subidx is not None:
                        subindices[pollutant] = subidx
                    pollutant_avgs[pollutant] = value
            
            aqi = max(subindices.values()) if subindices else latest_row.get('aqi')
            
            return {
                'aqi': aqi,
                'station': f"{city_name} Monitoring Station",
                'city': latest_row['city'],
                'state': latest_row['state'],
                'pollutant_subindices': subindices,
                'pollutant_avgs': pollutant_avgs,
                    'last_update': latest_time,
                'source': 'Indian Historical Data',
                'debug': {
                    'lat': lat,
                    'lon': lon,
                    'nearest_city_lat': nearest_city['latitude'],
                    'nearest_city_lon': nearest_city['longitude'],
                    'distance_km': nearest_city['distance']
                }
            }
        else:
            return {'aqi': None, 'error': 'No data found in Indian historical dataset'}
    except Exception as e:
        return {'aqi': None, 'error': str(e)}
