import requests
import pandas as pd
import time
import os
from datetime import datetime, timedelta

API_KEY = "69ffa74938c884ead37a2c38d5dad33a"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "historical_aqi.csv")

# Cities with coordinates
CITIES = [
    {"name": "Delhi",       "lat": 28.6517, "lon": 77.2219},
    {"name": "Mumbai",      "lat": 19.0760, "lon": 72.8777},
    {"name": "Beijing",     "lat": 39.9042, "lon": 116.4074},
    {"name": "London",      "lat": 51.5074, "lon": -0.1278},
    {"name": "New York",    "lat": 40.7128, "lon": -74.0060},
    {"name": "Tokyo",       "lat": 35.6762, "lon": 139.6503},
    {"name": "Sydney",      "lat": -33.8688,"lon": 151.2093},
    {"name": "Cairo",       "lat": 30.0444, "lon": 31.2357},
    {"name": "Lahore",      "lat": 31.5497, "lon": 74.3436},
    {"name": "São Paulo",   "lat": -23.5505,"lon": -46.6333},
    {"name": "Dubai",       "lat": 25.2048, "lon": 55.2708},
    {"name": "Seoul",       "lat": 37.5665, "lon": 126.9780},
    {"name": "Paris",       "lat": 48.8566, "lon": 2.3522},
    {"name": "Berlin",      "lat": 52.5200, "lon": 13.4050},
    {"name": "Los Angeles", "lat": 34.0522, "lon": -118.2437},
    {"name": "Shanghai",    "lat": 31.2304, "lon": 121.4737},
    {"name": "Kolkata",     "lat": 22.5726, "lon": 88.3639},
    {"name": "Bangkok",     "lat": 13.7563, "lon": 100.5018},
    {"name": "Jakarta",     "lat": -6.2088, "lon": 106.8456},
    {"name": "Karachi",     "lat": 24.8607, "lon": 67.0011},
]

def get_coordinates(city_name):
    """Get lat/lon for a city name."""
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {"q": city_name, "limit": 1, "appid": API_KEY}
    res = requests.get(url, params=params)
    data = res.json()
    if data:
        return data[0]["lat"], data[0]["lon"]
    return None, None

def get_historical_pollution(lat, lon, days=365):
    """Fetch historical air pollution data."""
    end_time   = int(datetime.now().timestamp())
    start_time = int((datetime.now() - timedelta(days=days)).timestamp())

    url = "http://api.openweathermap.org/data/2.5/air_pollution/history"
    params = {
        "lat":   lat,
        "lon":   lon,
        "start": start_time,
        "end":   end_time,
        "appid": API_KEY,
    }
    res  = requests.get(url, params=params)
    data = res.json()

    if "list" not in data:
        print(f"  Error: {data}")
        return []

    records = []
    for item in data["list"]:
        dt         = datetime.fromtimestamp(item["dt"])
        components = item["components"]
        records.append({
            "datetime":       dt,
            "date":           dt.date(),
            "co":             components.get("co", 0),
            "no2":            components.get("no2", 0),
            "o3":             components.get("o3", 0),
            "pm2_5":          components.get("pm2_5", 0),
            "pm10":           components.get("pm10", 0),
            "aqi_index":      item.get("main", {}).get("aqi", 1),
        })
    return records

def aqi_index_to_value(index):
    """Convert OWM AQI index (1-5) to approximate AQI value."""
    mapping = {1: 25, 2: 75, 3: 125, 4: 175, 5: 275}
    return mapping.get(index, 25)

def aqi_value_to_category(value):
    """Convert AQI value to category."""
    if value <= 50:   return "Good"
    if value <= 100:  return "Moderate"
    if value <= 150:  return "Unhealthy for Sensitive Groups"
    if value <= 200:  return "Unhealthy"
    if value <= 300:  return "Very Unhealthy"
    return "Hazardous"

def owm_to_aqi_scale(co, no2, o3, pm25):
    # PM2.5 - most important (μg/m³ to AQI)
    if pm25 <= 12:      pm25_aqi = (pm25 / 12) * 50
    elif pm25 <= 35.4:  pm25_aqi = 51 + ((pm25 - 12) / 23.4) * 49
    elif pm25 <= 55.4:  pm25_aqi = 101 + ((pm25 - 35.4) / 20) * 49
    elif pm25 <= 150.4: pm25_aqi = 151 + ((pm25 - 55.4) / 95) * 49
    elif pm25 <= 250.4: pm25_aqi = 201 + ((pm25 - 150.4) / 100) * 99
    else:               pm25_aqi = 301 + ((pm25 - 250.4) / 249.6) * 199

    # NO2 (μg/m³ to AQI)
    if no2 <= 53:       no2_aqi = (no2 / 53) * 50
    elif no2 <= 100:    no2_aqi = 51 + ((no2 - 53) / 47) * 49
    elif no2 <= 360:    no2_aqi = 101 + ((no2 - 100) / 260) * 99
    else:               no2_aqi = 201 + ((no2 - 360) / 640) * 99

    # Ozone (μg/m³ to AQI)
    if o3 <= 54:        o3_aqi = (o3 / 54) * 50
    elif o3 <= 124:     o3_aqi = 51 + ((o3 - 54) / 70) * 49
    elif o3 <= 164:     o3_aqi = 101 + ((o3 - 124) / 40) * 49
    else:               o3_aqi = 151 + ((o3 - 164) / 36) * 49

    # CO (μg/m³ to AQI)
    if co <= 4400:      co_aqi = (co / 4400) * 50
    elif co <= 9400:    co_aqi = 51 + ((co - 4400) / 5000) * 49
    elif co <= 12400:   co_aqi = 101 + ((co - 9400) / 3000) * 49
    else:               co_aqi = 151 + ((co - 12400) / 3000) * 49

    return (
        round(min(co_aqi, 500), 1),
        round(min(o3_aqi, 500), 1),
        round(min(no2_aqi, 500), 1),
        round(min(pm25_aqi, 500), 1),
    )

all_records = []

print(f"Fetching historical data for {len(CITIES)} cities...")
print("This may take 2-3 minutes...\n")

for city in CITIES:
    print(f"Fetching: {city['name']}...")
    try:
        records = get_historical_pollution(city["lat"], city["lon"], days=365)
        if not records:
            print(f"  No data for {city['name']}, skipping.")
            continue

        # Aggregate to daily averages
        df_city = pd.DataFrame(records)
        df_daily = df_city.groupby("date").agg({
            "co":        "mean",
            "no2":       "mean",
            "o3":        "mean",
            "pm2_5":     "mean",
            "aqi_index": "mean",
        }).reset_index()

        for _, row in df_daily.iterrows():
            co_aqi, no2_aqi, o3_aqi, pm25_aqi = owm_to_aqi_scale(
                row["co"], row["no2"], row["o3"], row["pm2_5"]
            )
            aqi_val = aqi_index_to_value(round(row["aqi_index"]))
            all_records.append({
                "date":             str(row["date"]),
                "city_name":        city["name"],
                "co_aqi_value":     co_aqi,
                "ozone_aqi_value":  o3_aqi,
                "no2_aqi_value":    no2_aqi,
                "pm2.5_aqi_value":  pm25_aqi,
                "aqi_value":        aqi_val,
                "aqi_category":     aqi_value_to_category(aqi_val),
            })

        print(f"  Got {len(df_daily)} days of data")
        time.sleep(0.5)  # Rate limiting

    except Exception as e:
        print(f"  Error fetching {city['name']}: {e}")
        continue

df_final = pd.DataFrame(all_records)
df_final = df_final.sort_values(["city_name", "date"]).reset_index(drop=True)

print(f"\nTotal records: {len(df_final)}")
print(f"Cities: {df_final['city_name'].nunique()}")
print(f"Date range: {df_final['date'].min()} to {df_final['date'].max()}")
print(f"\nCategory distribution:")
print(df_final["aqi_category"].value_counts())

os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
df_final.to_csv(OUTPUT_PATH, index=False)
print(f"\nSaved to {OUTPUT_PATH}")