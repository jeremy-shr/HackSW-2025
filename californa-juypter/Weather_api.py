import openmeteo_requests
import requests_cache
import pandas as pd
from retry_requests import retry

# Load the dataset
df = pd.read_csv("cali_fire.csv")

# Convert date column to datetime
df["Incident Start Date"] = pd.to_datetime(df["Incident Start Date"], errors="coerce")

# Drop rows with missing data
df_clean = df.dropna(subset=["Latitude", "Longitude", "Incident Start Date"])

# Take a small sample for testing
df_sample = df_clean.head(5)

# Setup Open-Meteo API client with cache
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Function to fetch weather data
def fetch_weather(lat, lon, date):
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": date.strftime("%Y-%m-%d"),
        "end_date": date.strftime("%Y-%m-%d"),
        "hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
        "timezone": "America/Los_Angeles",
    }
    try:
        responses = openmeteo.weather_api(url, params=params)
        response = responses[0]
        hourly = response.Hourly()
        return {
            "High Temp (°C)": max(hourly.Variables(0).ValuesAsNumpy()),
            "Low Temp (°C)": min(hourly.Variables(0).ValuesAsNumpy()),
            "High Humidity (%)": max(hourly.Variables(1).ValuesAsNumpy()),
            "Low Humidity (%)": min(hourly.Variables(1).ValuesAsNumpy()),
            "High Wind Speed (m/s)": max(hourly.Variables(2).ValuesAsNumpy()),
            "Low Wind Speed (m/s)": min(hourly.Variables(2).ValuesAsNumpy()),
        }
    except Exception as e:
        print(f"Error fetching weather for {lat}, {lon} on {date}: {e}")
        return None

# Fetch weather data for each row
weather_results = [fetch_weather(row["Latitude"], row["Longitude"], row["Incident Start Date"]) for _, row in df_sample.iterrows()]

# Create DataFrame and merge
weather_df = pd.DataFrame(weather_results)
df_sample_weather = pd.concat([df_sample.reset_index(drop=True), weather_df], axis=1)

# Save to CSV
df_sample_weather.to_csv("cali_fire_weather.csv", index=False)
print("Weather data saved to cali_fire_weather.csv")
