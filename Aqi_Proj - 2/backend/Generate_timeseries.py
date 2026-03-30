import pandas as pd
import numpy as np
import os

BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "global_air_pollution_data.csv")
OUT_PATH  = os.path.join(BASE_DIR, "data", "historical_aqi.csv")

np.random.seed(42)

df = pd.read_csv(DATA_PATH)
df.columns = df.columns.str.strip()

FEATURE_COLS = ["co_aqi_value", "ozone_aqi_value", "no2_aqi_value", "pm2.5_aqi_value"]

# Get unique cities and their average pollutant values
city_stats = df.groupby("city_name")[FEATURE_COLS + ["aqi_value"]].mean().reset_index()

all_records = []
dates = pd.date_range(end=pd.Timestamp.today(), periods=365, freq="D")

for _, row in city_stats.iterrows():
    city = row["city_name"]
    base_co    = row["co_aqi_value"]
    base_ozone = row["ozone_aqi_value"]
    base_no2   = row["no2_aqi_value"]
    base_pm25  = row["pm2.5_aqi_value"]
    base_aqi   = row["aqi_value"]

    for i, date in enumerate(dates):
        # Add realistic daily variation (±15%) and weekly patterns
        day_of_week = date.dayofweek
        weekday_factor = 1.1 if day_of_week < 5 else 0.85  # Higher on weekdays

        # Add seasonal variation
        month = date.month
        if month in [11, 12, 1, 2]:  # Winter - higher pollution
            seasonal = 1.2
        elif month in [6, 7, 8]:     # Monsoon - lower pollution
            seasonal = 0.8
        else:
            seasonal = 1.0

        # Random daily noise ±10%
        noise = np.random.uniform(0.90, 1.10)

        factor = weekday_factor * seasonal * noise

        co    = round(max(0, base_co    * factor + np.random.normal(0, base_co    * 0.05)), 1)
        ozone = round(max(0, base_ozone * factor + np.random.normal(0, base_ozone * 0.05)), 1)
        no2   = round(max(0, base_no2   * factor + np.random.normal(0, base_no2   * 0.05)), 1)
        pm25  = round(max(0, base_pm25  * factor + np.random.normal(0, base_pm25  * 0.05)), 1)
        aqi   = round(max(0, base_aqi   * factor + np.random.normal(0, base_aqi   * 0.05)), 1)

        def aqi_to_cat(v):
            if v <= 50:   return "Good"
            if v <= 100:  return "Moderate"
            if v <= 150:  return "Unhealthy for Sensitive Groups"
            if v <= 200:  return "Unhealthy"
            if v <= 300:  return "Very Unhealthy"
            return "Hazardous"

        all_records.append({
            "date":             date.strftime("%Y-%m-%d"),
            "city_name":        city,
            "co_aqi_value":     co,
            "ozone_aqi_value":  ozone,
            "no2_aqi_value":    no2,
            "pm2.5_aqi_value":  pm25,
            "aqi_value":        aqi,
            "aqi_category":     aqi_to_cat(aqi),
        })

df_out = pd.DataFrame(all_records)
df_out = df_out.sort_values(["city_name", "date"]).reset_index(drop=True)

print(f"Generated {len(df_out)} records")
print(f"Cities: {df_out['city_name'].nunique()}")
print(f"Date range: {df_out['date'].min()} to {df_out['date'].max()}")
print(f"\nSample Delhi data:")
print(df_out[df_out["city_name"] == "Delhi"][["date","aqi_value","aqi_category"]].tail(10).to_string())
print(f"\nAQI stats per city:")
print(df_out.groupby("city_name")["aqi_value"].mean().sort_values(ascending=False).head(10))

df_out.to_csv(OUT_PATH, index=False)
print(f"\nSaved to {OUT_PATH}")