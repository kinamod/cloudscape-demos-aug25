// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface WeatherLocation {
  latitude: number;
  longitude: number;
  name: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  humidity: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
}

export interface HourlyWeather {
  time: string[];
  temperature: number[];
  precipitation: number[];
  windSpeed: number[];
  humidity: number[];
}

export interface DailyWeather {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitation: number[];
  windSpeedMax: number[];
  weatherCode: number[];
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  timezone: string;
  timezoneAbbreviation: string;
}

const DEFAULT_LOCATIONS: WeatherLocation[] = [
  { latitude: 40.7128, longitude: -74.006, name: 'New York, NY' },
  { latitude: 34.0522, longitude: -118.2437, name: 'Los Angeles, CA' },
  { latitude: 51.5074, longitude: -0.1278, name: 'London, UK' },
  { latitude: 48.8566, longitude: 2.3522, name: 'Paris, France' },
  { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo, Japan' },
];

export async function fetchWeatherData(location: WeatherLocation): Promise<WeatherData> {
  const baseUrl = 'https://api.open-meteo.com/v1/forecast';
  
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'weather_code',
      'relative_humidity_2m',
      'surface_pressure',
      'visibility',
      'uv_index'
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation',
      'wind_speed_10m',
      'relative_humidity_2m'
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_sum',
      'wind_speed_10m_max',
      'weather_code'
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: 'auto',
    forecast_days: '7'
  });

  const response = await fetch(`${baseUrl}?${params}`);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  return {
    location,
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      pressure: data.current.surface_pressure,
      visibility: data.current.visibility,
      uvIndex: data.current.uv_index,
    },
    hourly: {
      time: data.hourly.time.slice(0, 24), // Next 24 hours
      temperature: data.hourly.temperature_2m.slice(0, 24),
      precipitation: data.hourly.precipitation.slice(0, 24),
      windSpeed: data.hourly.wind_speed_10m.slice(0, 24),
      humidity: data.hourly.relative_humidity_2m.slice(0, 24),
    },
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      precipitation: data.daily.precipitation_sum,
      windSpeedMax: data.daily.wind_speed_10m_max,
      weatherCode: data.daily.weather_code,
    },
    timezone: data.timezone,
    timezoneAbbreviation: data.timezone_abbreviation,
  };
}

export function getDefaultLocations(): WeatherLocation[] {
  return DEFAULT_LOCATIONS;
}

export function getWeatherCodeDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  
  return descriptions[code] || 'Unknown';
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return 'sun';
  if (code <= 3) return 'cloud';
  if (code >= 45 && code <= 48) return 'cloud';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 86) return 'snow';
  if (code >= 95) return 'flash';
  return 'cloud';
}
