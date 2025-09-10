// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
  };
}

export interface Location {
  name: string;
  latitude: number;
  longitude: number;
}

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code',
    hourly: 'temperature_2m,weather_code,precipitation',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
    timezone: 'auto',
    forecast_days: '7'
  });

  const response = await fetch(`${WEATHER_API_BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  return response.json();
}

export const DEFAULT_LOCATIONS: Location[] = [
  { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { name: 'London', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
  { name: 'San Francisco', latitude: 37.7749, longitude: -122.4194 },
];

export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  };
  
  return weatherCodes[code] || 'Unknown';
}
