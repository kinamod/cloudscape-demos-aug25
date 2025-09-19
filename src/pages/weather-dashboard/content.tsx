// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useMemo, useState } from 'react';
import Autosuggest, { AutosuggestProps } from '@cloudscape-design/components/autosuggest';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';

interface GeoResult {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface ForecastResponse {
  timezone: string;
  current?: Record<string, any>;
  current_units?: Record<string, string>;
  hourly?: { time: string[]; [key: string]: any };
  hourly_units?: Record<string, string>;
  daily?: { time: string[]; [key: string]: any };
  daily_units?: Record<string, string>;
}

function formatLocationLabel(item: GeoResult) {
  const parts = [item.name, item.admin1, item.country].filter(Boolean);
  return parts.join(', ');
}

function weatherCodeText(code: number): string {
  const map: Record<number, string> = {
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
  return map[code] ?? 'Unknown';
}

export function Content() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutosuggestProps.Option[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [selected, setSelected] = useState<GeoResult | null>(null);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced geocoding search
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      const term = query.trim();
      if (!term) {
        setSuggestions([]);
        return;
      }
      setSuggestionsLoading(true);
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          term,
        )}&count=8&language=en&format=json`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Geocoding failed');
        const data = await res.json();
        const items: GeoResult[] = (data.results || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          country: r.country,
          admin1: r.admin1,
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone,
        }));
        setSuggestions(
          items.map(i => ({
            value: formatLocationLabel(i),
            label: formatLocationLabel(i),
            description: `Lat ${i.latitude.toFixed(2)}, Lon ${i.longitude.toFixed(2)}`,
            data: i,
          })) as any,
        );
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [query]);

  const fetchForecast = async (loc: GeoResult) => {
    setLoadingForecast(true);
    setError(null);
    setForecast(null);
    try {
      const params = new URLSearchParams({
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        timezone: 'auto',
        current:
          [
            'temperature_2m',
            'apparent_temperature',
            'relative_humidity_2m',
            'is_day',
            'precipitation',
            'rain',
            'showers',
            'snowfall',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'wind_speed_10m',
            'wind_gusts_10m',
            'wind_direction_10m',
          ].join(','),
        hourly:
          [
            'temperature_2m',
            'apparent_temperature',
            'precipitation_probability',
            'precipitation',
            'weather_code',
            'cloud_cover',
            'pressure_msl',
            'wind_speed_10m',
            'wind_gusts_10m',
            'wind_direction_10m',
          ].join(','),
        daily:
          [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'apparent_temperature_max',
            'apparent_temperature_min',
            'sunrise',
            'sunset',
            'uv_index_max',
            'precipitation_sum',
            'precipitation_probability_max',
            'wind_speed_10m_max',
          ].join(','),
        forecast_days: '7',
      });
      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Forecast request failed');
      const data: ForecastResponse = await res.json();
      setForecast(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load forecast');
    } finally {
      setLoadingForecast(false);
    }
  };

  // Initial default location fetch (San Francisco)
  useEffect(() => {
    const initial: GeoResult = {
      name: 'San Francisco',
      admin1: 'California',
      country: 'USA',
      latitude: 37.7749,
      longitude: -122.4194,
    };
    setSelected(initial);
    fetchForecast(initial);
  }, []);

  const autosuggestOptions: AutosuggestProps['options'] = suggestions;

  const dailyItems = useMemo(() => {
    if (!forecast?.daily) return [] as any[];
    const { daily, daily_units } = forecast as any;
    return daily.time.map((date: string, idx: number) => {
      const code = Number(daily.weather_code[idx]);
      return {
        date,
        summary: weatherCodeText(code),
        tempMax: `${daily.temperature_2m_max[idx]}${daily_units.temperature_2m_max || '°C'}`,
        tempMin: `${daily.temperature_2m_min[idx]}${daily_units.temperature_2m_min || '°C'}`,
        precip: daily.precipitation_sum ? `${daily.precipitation_sum[idx]}${daily_units.precipitation_sum || 'mm'}` : '-',
        uv: daily.uv_index_max ? `${daily.uv_index_max[idx]}` : '-',
      };
    });
  }, [forecast]);

  const hourlyItems = useMemo(() => {
    if (!forecast?.hourly) return [] as any[];
    const { hourly, hourly_units } = forecast as any;
    // next 24 hours
    const limit = Math.min(hourly.time.length, 24);
    return Array.from({ length: limit }).map((_, i) => ({
      time: hourly.time[i],
      temp: `${hourly.temperature_2m?.[i]}${hourly_units.temperature_2m || '°C'}`,
      feels: `${hourly.apparent_temperature?.[i]}${hourly_units.apparent_temperature || '°C'}`,
      precipProb: hourly.precipitation_probability?.[i] != null ? `${hourly.precipitation_probability[i]}%` : '-',
      wind: hourly.wind_speed_10m?.[i] != null ? `${hourly.wind_speed_10m[i]} ${hourly_units.wind_speed_10m || 'km/h'}` : '-',
    }));
  }, [forecast]);

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            description={
              <>
                Data by Open-Meteo. <Link external href="https://open-meteo.com/en/docs">API docs</Link>
              </>
            }
          >
            Location
          </Header>
        }
      >
        <Grid gridDefinition={[{ colspan: { default: 12, s: 8, m: 8, l: 8 } }, { colspan: { default: 12, s: 4, m: 4, l: 4 } }]}>
          <Autosuggest
            value={query}
            onChange={({ detail }) => setQuery(detail.value)}
            onSelect={({ detail }) => {
              const opt = detail.option as any;
              const item = (opt?.data as GeoResult) || null;
              if (item) {
                setSelected(item);
                fetchForecast(item);
              }
            }}
            options={autosuggestOptions}
            ariaLabel="Search for a city"
            placeholder="Search city or place"
            statusType={suggestionsLoading ? 'loading' : 'finished'}
            loadingText="Loading suggestions"
            empty="No matches"
            finishedText={
              suggestions.length > 0 ? 'Use up/down to navigate, enter to select' : 'No suggestions'
            }
          />
          <div>
            <Button
              onClick={() => {
                if (suggestions.length > 0) {
                  const first = (suggestions[0] as any).data as GeoResult;
                  setSelected(first);
                  fetchForecast(first);
                }
              }}
            >
              Use first suggestion
            </Button>
          </div>
        </Grid>
      </Container>

      <Container
        header={
          <Header variant="h2">
            {selected ? `Current conditions — ${formatLocationLabel(selected)}` : 'Current conditions'}
          </Header>
        }
      >
        {loadingForecast && <StatusIndicator type="loading">Loading forecast</StatusIndicator>}
        {error && <StatusIndicator type="error">{error}</StatusIndicator>}
        {!loadingForecast && !error && forecast?.current && (
          <Grid gridDefinition={[{ colspan: { default: 12, s: 6 } }, { colspan: { default: 12, s: 6 } }]}> 
            <SpaceBetween size="s">
              <Box variant="awsui-key-label">Temperature</Box>
              <div>
                {forecast.current.temperature_2m}
                {forecast.current_units?.temperature_2m || '°C'} (feels like {forecast.current.apparent_temperature}
                {forecast.current_units?.apparent_temperature || '°C'})
              </div>
              <Box variant="awsui-key-label">Humidity</Box>
              <div>
                {forecast.current.relative_humidity_2m}
                {forecast.current_units?.relative_humidity_2m || '%'}
              </div>
              <Box variant="awsui-key-label">Cloud cover</Box>
              <div>
                {forecast.current.cloud_cover}
                {forecast.current_units?.cloud_cover || '%'}
              </div>
            </SpaceBetween>
            <SpaceBetween size="s">
              <Box variant="awsui-key-label">Wind</Box>
              <div>
                {forecast.current.wind_speed_10m} {forecast.current_units?.wind_speed_10m || 'km/h'} (gusts{' '}
                {forecast.current.wind_gusts_10m} {forecast.current_units?.wind_gusts_10m || 'km/h'})
              </div>
              <Box variant="awsui-key-label">Pressure</Box>
              <div>
                {forecast.current.pressure_msl}
                {forecast.current_units?.pressure_msl || 'hPa'}
              </div>
              <Box variant="awsui-key-label">Conditions</Box>
              <div>{weatherCodeText(Number(forecast.current.weather_code))}</div>
            </SpaceBetween>
          </Grid>
        )}
      </Container>

      <Container header={<Header variant="h2">7-day forecast</Header>}>
        <Table
          items={dailyItems}
          trackBy="date"
          columnDefinitions={[
            { id: 'date', header: 'Date', cell: item => item.date, sortingField: 'date' },
            { id: 'summary', header: 'Summary', cell: item => item.summary },
            { id: 'max', header: 'Max temp', cell: item => item.tempMax },
            { id: 'min', header: 'Min temp', cell: item => item.tempMin },
            { id: 'precip', header: 'Precipitation', cell: item => item.precip },
            { id: 'uv', header: 'UV index', cell: item => item.uv },
          ]}
          empty={<Box variant="p">No daily data</Box>}
          header={<Header>Daily forecast</Header>}
        />
      </Container>

      <Container header={<Header variant="h2">Next 24 hours</Header>}>
        <Table
          items={hourlyItems}
          trackBy="time"
          columnDefinitions={[
            { id: 'time', header: 'Time', cell: item => item.time, sortingField: 'time' },
            { id: 'temp', header: 'Temp', cell: item => item.temp },
            { id: 'feels', header: 'Feels like', cell: item => item.feels },
            { id: 'precip', header: 'Precip probability', cell: item => item.precipProb },
            { id: 'wind', header: 'Wind', cell: item => item.wind },
          ]}
          empty={<Box variant="p">No hourly data</Box>}
          header={<Header>Hourly forecast</Header>}
        />
      </Container>
    </SpaceBetween>
  );
}
