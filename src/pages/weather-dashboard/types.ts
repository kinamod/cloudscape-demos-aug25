// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  uvIndex: number;
  cloudCover: number;
  weatherCode: number;
  description: string;
  time: string;
}

export interface DailyForecast {
  date: string;
  temperatureMax: number;
  temperatureMin: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
  description: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
}

export interface ForecastData {
  daily: DailyForecast[];
  hourly: HourlyForecast[];
}

export interface OpenMeteoCurrentResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    visibility: number;
    uv_index: number;
    cloud_cover: number;
    weather_code: number;
  };
}

export interface OpenMeteoForecastResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    wind_speed_10m_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    wind_speed_10m: number[];
    weather_code: number[];
  };
}
