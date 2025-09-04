from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from . import aqi_model, utils

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
