import openmeteo_requests

import requests_cache
import pandas as pd
from retry_requests import retry



# Setup the Open-Meteo API client with cache and retry on error
cache_session = requests_cache.CachedSession('.cache', expire_after = -1)
retry_session = retry(cache_session, retries = 5, backoff_factor = 0.2)
openmeteo = openmeteo_requests.Client(session = retry_session)

# Make sure all required weather variables are listed here
# The order of variables in hourly or daily is important to assign them correctly below
url = "https://archive-api.open-meteo.com/v1/archive"
params = {
	"latitude": 38.47,
	"longitude": -122.04,
	"start_date": "2020-06-06",
	"end_date": "2020-06-06",
	"hourly": ["temperature_2m", "relative_humidity_2m", "wind_speed_10m"],
	"timezone": "America/Los_Angeles"
}
responses = openmeteo.weather_api(url, params=params)

# Process first location. Add a for-loop for multiple locations or weather models
response = responses[0]
print(f"Coordinates {response.Latitude()}°N {response.Longitude()}°E")
print(f"Elevation {response.Elevation()} m asl")
print(f"Timezone {response.Timezone()} {response.TimezoneAbbreviation()}")
print(f"Timezone difference to GMT+0 {response.UtcOffsetSeconds()} s")

# Process hourly data. The order of variables needs to be the same as requested.
hourly = response.Hourly()
hourly_temperature_2m = hourly.Variables(0).ValuesAsNumpy()
hourly_relative_humidity_2m = hourly.Variables(1).ValuesAsNumpy()
hourly_wind_speed_10m = hourly.Variables(2).ValuesAsNumpy()

hourly_data = {"date": pd.date_range(
	start = pd.to_datetime(hourly.Time(), unit = "s", utc = True),
	end = pd.to_datetime(hourly.TimeEnd(), unit = "s", utc = True),
	freq = pd.Timedelta(seconds = hourly.Interval()),
	inclusive = "left"
)}

hourly_data["temperature_2m"] = hourly_temperature_2m
hourly_data["relative_humidity_2m"] = hourly_relative_humidity_2m
hourly_data["wind_speed_10m"] = hourly_wind_speed_10m

hourly_dataframe = pd.DataFrame(data = hourly_data)

# Find the high and low values for each variable
high_temp = max(hourly_data["temperature_2m"])
low_temp = min(hourly_data["temperature_2m"])

high_humidity = max(hourly_data["relative_humidity_2m"])
low_humidity = min(hourly_data["relative_humidity_2m"])

high_wind_speed = max(hourly_data["wind_speed_10m"])
low_wind_speed = min(hourly_data["wind_speed_10m"])

# Print results with 1 decimal place
print(f"High Temperature: {high_temp:.1f}°C, Low Temperature: {low_temp:.1f}°C")
print(f"High Humidity: {high_humidity:.1f}%, Low Humidity: {low_humidity:.1f}%")
print(f"High Wind Speed: {high_wind_speed:.1f} m/s, Low Wind Speed: {low_wind_speed:.1f} m/s")



