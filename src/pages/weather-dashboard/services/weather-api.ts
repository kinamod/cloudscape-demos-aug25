// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    weather_code: number[];
    wind_speed_10m_max: number[];
  };
}

// Weather code mappings based on WMO Weather interpretation codes
const weatherCodes: { [key: number]: { description: string; icon: string } } = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow', icon: '🌨️' },
  73: { description: 'Moderate snow', icon: '❄️' },
  75: { description: 'Heavy snow', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// Default coordinates for San Francisco
const DEFAULT_LATITUDE = 37.7749;
const DEFAULT_LONGITUDE = -122.4194;

export interface WeatherCondition {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  feelsLike: number;
  cloudCover: number;
  time: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
  windSpeed: number;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
}

export function getWeatherDescription(code: number): { description: string; icon: string } {
  return weatherCodes[code] || { description: 'Unknown', icon: '❓' };
}

export async function fetchWeatherData(
  latitude: number = DEFAULT_LATITUDE,
  longitude: number = DEFAULT_LONGITUDE
): Promise<{
  current: WeatherCondition;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m');
  url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m');
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,wind_speed_10m_max');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '7');

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data: WeatherData = await response.json();
    
    const weather = getWeatherDescription(data.current.weather_code);
    
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        description: weather.description,
        icon: weather.icon,
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        precipitation: data.current.precipitation,
        feelsLike: Math.round(data.current.apparent_temperature),
        cloudCover: data.current.cloud_cover,
        time: data.current.time,
      },
      hourly: data.hourly.time.slice(0, 24).map((time, index) => ({
        time,
        temperature: Math.round(data.hourly.temperature_2m[index]),
        precipitation: data.hourly.precipitation[index],
        precipitationProbability: data.hourly.precipitation_probability[index],
        weatherCode: data.hourly.weather_code[index],
        windSpeed: Math.round(data.hourly.wind_speed_10m[index]),
      })),
      daily: data.daily.time.map((date, index) => ({
        date,
        maxTemp: Math.round(data.daily.temperature_2m_max[index]),
        minTemp: Math.round(data.daily.temperature_2m_min[index]),
        precipitation: data.daily.precipitation_sum[index],
        weatherCode: data.daily.weather_code[index],
        windSpeed: Math.round(data.daily.wind_speed_10m_max[index]),
      })),
    };
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    // Return mock data for development
    return getMockWeatherData();
  }
}

function getMockWeatherData() {
  return {
    current: {
      temperature: 22,
      description: 'Partly cloudy',
      icon: '⛅',
      humidity: 65,
      windSpeed: 12,
      windDirection: 225,
      precipitation: 0,
      feelsLike: 24,
      cloudCover: 40,
      time: new Date().toISOString(),
    },
    hourly: Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      temperature: 22 + Math.round(Math.random() * 10 - 5),
      precipitation: Math.random() * 2,
      precipitationProbability: Math.round(Math.random() * 100),
      weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
      windSpeed: Math.round(Math.random() * 20 + 5),
    })),
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maxTemp: 25 + Math.round(Math.random() * 10),
      minTemp: 15 + Math.round(Math.random() * 5),
      precipitation: Math.random() * 5,
      weatherCode: [0, 1, 2, 3, 61][Math.floor(Math.random() * 5)],
      windSpeed: Math.round(Math.random() * 25 + 10),
    })),
  };
}
