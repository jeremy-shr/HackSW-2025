import openmeteo_requests
import requests_cache
import pandas as pd
import numpy as np
import time
from retry_requests import retry



# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after=-1)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# Load the dataset (fixed path)
df = pd.read_csv("californa-juypter/dataset.csv")

# Convert date column to datetime
df['Incident Start Date'] = pd.to_datetime(df['Incident Start Date'], format='%m/%d/%Y %I:%M:%S %p')
df['Incident Start Date'] = df['Incident Start Date'].dt.strftime('%Y-%m-%d')
output_df = df.copy()

for index, row in df.iterrows():
    latitude = row["Latitude"]
    longitude = row["Longitude"]
    start_date = row["Incident Start Date"]
    end_date = row["Incident Start Date"]  # Assuming a fixed end date for all queries

    # API URL and parameters
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"]
    }
    try: 
        responses = openmeteo.weather_api(url, params=params)
        
        if not responses:
            print(f"No data for {latitude}, {longitude}")
            continue
        
        # Process first location response
        response = responses[0]
        print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
        print(f"Elevation {response.Elevation()} m asl")
        print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
        print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

        # Process hourly data
        hourly = response.Hourly()
        hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
        hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
        hourly_wind_speed_10m = hourly.Variables(2).ValuesAsNumpy()

        hourly_data = {
            "date": pd.date_range(
                start=pd.to_datetime(hourly.Time(), unit="s", utc=True),
                end=pd.to_datetime(hourly.TimeEnd(), unit="s", utc=True),
                freq=pd.Timedelta(seconds=hourly.Interval()),
                inclusive="left"
            ),
            "temperature_2m": hourly_temperature_2m,
            "relative_humidity_2m": hourly_relative_humidity_2m,
            "wind_speed_10m": hourly_wind_speed_10m
        }

        hourly_dataframe = pd.DataFrame(data=hourly_data)

        # Compute daily high and low values
        daily_data = hourly_dataframe.resample('D', on='date').agg({
            "temperature_2m": ["max", "min"],
            "relative_humidity_2m": ["max", "min"],
            "wind_speed_10m": ["max", "min"]
        })

        daily_data.columns = ["_".join(col).strip() for col in daily_data.columns.values]
        daily_data.reset_index(inplace=True)
        daily_data["Latitude"] = latitude
        daily_data["Longitude"] = longitude
        
        # Append new data to CSV after each iteration
        daily_data.to_csv("enhanced_dataset.csv", mode='a', header=not index, index=False)
        print(f"Data for {latitude}, {longitude} saved to enhanced_dataset.csv")
        
        time.sleep(0.1)
    except Exception as e:
        print(f"Error fetching data for {latitude}, {longitude}: {e}")
        time.sleep(1) 
        
print("Data collection complete. All records saved to enhanced_dataset.csv")