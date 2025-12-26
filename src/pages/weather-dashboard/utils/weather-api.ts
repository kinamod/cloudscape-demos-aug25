// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import { WeatherData, ForecastData, OpenMeteoCurrentResponse, OpenMeteoForecastResponse } from '../types';

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
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

export async function fetchWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index,cloud_cover,weather_code&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data: OpenMeteoCurrentResponse = await response.json();
    const current = data.current;

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      pressure: Math.round(current.surface_pressure),
      visibility: Math.round(current.visibility / 1000), // Convert to km
      uvIndex: current.uv_index,
      cloudCover: current.cloud_cover,
      weatherCode: current.weather_code,
      description: WEATHER_CODE_DESCRIPTIONS[current.weather_code] || 'Unknown',
      time: current.time,
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    throw new Error('Unable to fetch current weather data');
  }
}

export async function fetchForecastData(latitude: number, longitude: number): Promise<ForecastData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_sum,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation,precipitation_probability,wind_speed_10m,weather_code&timezone=auto&forecast_days=7`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Get the actual error response
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Forecast API error: ${response.status} - ${errorText}`);
    }

    const data: OpenMeteoForecastResponse = await response.json();

    // Process daily forecast
    const daily = data.daily.time.map((date, index) => ({
      date,
      temperatureMax: Math.round(data.daily.temperature_2m_max[index]),
      temperatureMin: Math.round(data.daily.temperature_2m_min[index]),
      windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
      precipitation: data.daily.precipitation_sum[index],
      weatherCode: data.daily.weather_code[index],
      description: WEATHER_CODE_DESCRIPTIONS[data.daily.weather_code[index]] || 'Unknown',
    }));

    // Process hourly forecast (next 24 hours)
    const hourly = data.hourly.time.slice(0, 24).map((time, index) => ({
      time,
      temperature: Math.round(data.hourly.temperature_2m[index]),
      humidity: data.hourly.relative_humidity_2m[index],
      precipitation: data.hourly.precipitation[index],
      precipitationProbability: data.hourly.precipitation_probability[index],
      windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
      weatherCode: data.hourly.weather_code[index],
    }));

    return { daily, hourly };
  } catch (error) {
    console.error('Failed to fetch forecast data:', error);
    throw new Error('Unable to fetch weather forecast data');
  }
}

export function getWeatherIcon(weatherCode: number): string {
  if (weatherCode === 0) return 'sun';
  if (weatherCode >= 1 && weatherCode <= 3) return 'cloud';
  if (weatherCode >= 45 && weatherCode <= 48) return 'cloud';
  if (weatherCode >= 51 && weatherCode <= 67) return 'rain';
  if (weatherCode >= 71 && weatherCode <= 86) return 'snow';
  if (weatherCode >= 95 && weatherCode <= 99) return 'lightning';
  return 'cloud';
}

export function formatWindDirection(degrees: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}
