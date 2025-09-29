// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import Link from '@cloudscape-design/components/link';
import Select from '@cloudscape-design/components/select';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';

import { CustomAppLayout } from '../commons/common-components';

// Minimal mapping based on WMO weather codes
const WEATHER_CODE_MAP: Record<number, string> = {
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
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
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

function describeWeather(code?: number): string {
  if (code === undefined || code === null) return '—';
  return WEATHER_CODE_MAP[code] ?? `Code ${code}`;
}

type Units = 'celsius' | 'fahrenheit';

type CurrentBlock = {
  time: string;
  interval: number;
  temperature_2m?: number;
  weather_code?: number;
  is_day?: number;
  wind_speed_10m?: number;
};

interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_units?: Record<string, string>;
  current?: CurrentBlock;
  daily_units?: Record<string, string>;
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}

type CityOption = {
  label: string;
  description: string;
  value: string; // "lat,lon"
};

const PRESET_CITIES: CityOption[] = [
  { label: 'San Francisco, US', description: '37.7749, -122.4194', value: '37.7749,-122.4194' },
  { label: 'New York, US', description: '40.7128, -74.0060', value: '40.7128,-74.0060' },
  { label: 'London, UK', description: '51.5074, -0.1278', value: '51.5074,-0.1278' },
  { label: 'Berlin, DE', description: '52.5200, 13.4050', value: '52.5200,13.4050' },
  { label: 'Tokyo, JP', description: '35.6762, 139.6503', value: '35.6762,139.6503' },
  { label: 'Sydney, AU', description: '-33.8688, 151.2093', value: '-33.8688,151.2093' },
];

function parseLatLon(value: string): { lat: number; lon: number } | null {
  const parts = value.split(',');
  if (parts.length !== 2) return null;
  const lat = Number(parts[0].trim());
  const lon = Number(parts[1].trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

function buildUrl(lat: number, lon: number, units: Units): string {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,is_day,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    hourly: 'temperature_2m,precipitation_probability',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: units === 'fahrenheit' ? 'fahrenheit' : 'celsius',
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export function App() {
  const [city, setCity] = useState<CityOption | null>(PRESET_CITIES[0]);
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [units, setUnits] = useState<Units>('celsius');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const coords = useMemo(() => {
    if (useCustom) {
      const valid = parseLatLon(`${customLat},${customLon}`);
      return valid;
    }
    if (city) return parseLatLon(city.value);
    return null;
  }, [useCustom, customLat, customLon, city]);

  const unitLabel = units === 'fahrenheit' ? '°F' : '°C';

  const fetchWeather = async () => {
    if (!coords) {
      setError('Enter valid coordinates.');
      return;
    }
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const url = buildUrl(coords.lat, coords.lon, units);
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as WeatherResponse;
      setData(json);
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        setError(e?.message || 'Failed to load weather');
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, city, useCustom]);

  const dailyRows = useMemo(() => {
    if (!data?.daily) return [] as Array<{ date: string; min?: number; max?: number; code?: number; description: string }>;
    const { time, temperature_2m_min, temperature_2m_max, weather_code } = data.daily;
    return time.map((t, i) => ({
      date: t,
      min: temperature_2m_min?.[i],
      max: temperature_2m_max?.[i],
      code: weather_code?.[i],
      description: describeWeather(weather_code?.[i]),
    }));
  }, [data]);

  return (
    <CustomAppLayout
      navigationHide
      toolsHide
      content={
        <SpaceBetween size="l">
          <Header
            variant="h1"
            actions={
              <SpaceBetween size="xs" direction="horizontal">
                <Button iconName="external" iconAlign="right" onClick={() => window.open('https://open-meteo.com/en/docs', '_blank')}>
                  Open-Meteo docs
                </Button>
                <Button variant="primary" onClick={fetchWeather} disabled={loading}>
                  Refresh
                </Button>
              </SpaceBetween>
            }
          >
            Weather dashboard
          </Header>

          <Container header={<Header variant="h2">Location and units</Header>}>
            <SpaceBetween size="m">
              <Grid gridDefinition={[{ colspan: { default: 12, m: 8 } }, { colspan: { default: 12, m: 4 } }]}>
                <FormField label="Select city" description="Choose a preset city or enter custom coordinates.">
                  <Select
                    selectedOption={useCustom ? null : city}
                    onChange={({ detail }) => {
                      setUseCustom(false);
                      setCity(detail.selectedOption as CityOption);
                    }}
                    options={PRESET_CITIES}
                    placeholder="Choose city"
                    controlId="weather-city-select"
                  />
                </FormField>

                <FormField label="Units">
                  <SegmentedControl
                    selectedId={units}
                    onChange={({ detail }) => setUnits(detail.selectedId as Units)}
                    options={[
                      { id: 'celsius', text: 'Celsius (°C)' },
                      { id: 'fahrenheit', text: 'Fahrenheit (°F)' },
                    ]}
                  />
                </FormField>
              </Grid>

              <Grid gridDefinition={[{ colspan: { default: 12, m: 4 } }, { colspan: { default: 12, m: 4 } }, { colspan: { default: 12, m: 4 } }]}>
                <FormField label="Latitude">
                  <Input
                    value={customLat}
                    onChange={({ detail }) => {
                      setUseCustom(true);
                      setCustomLat(detail.value);
                    }}
                    placeholder="e.g. 37.7749"
                  />
                </FormField>
                <FormField label="Longitude">
                  <Input
                    value={customLon}
                    onChange={({ detail }) => {
                      setUseCustom(true);
                      setCustomLon(detail.value);
                    }}
                    placeholder="e.g. -122.4194"
                  />
                </FormField>
                <FormField label=""></FormField>
              </Grid>

              {coords && (
                <Box variant="p">
                  Coordinates: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)} · Timezone: {data?.timezone ?? '—'}
                </Box>
              )}
            </SpaceBetween>
          </Container>

          <Container
            header={<Header variant="h2">Current conditions</Header>}
          >
            {loading && (
              <Box textAlign="center" padding={{ vertical: 'm' }}>
                <Spinner />
              </Box>
            )}
            {!loading && error && (
              <StatusIndicator type="error">{error}</StatusIndicator>
            )}
            {!loading && !error && (
              <Grid gridDefinition={[{ colspan: { default: 12, m: 3 } }, { colspan: { default: 12, m: 3 } }, { colspan: { default: 12, m: 3 } }, { colspan: { default: 12, m: 3 } }]}>
                <Box variant="h3">Temperature</Box>
                <Box variant="p">{data?.current?.temperature_2m !== undefined ? `${data.current.temperature_2m.toFixed(1)} ${unitLabel}` : '—'}</Box>
                <Box variant="h3">Wind speed</Box>
                <Box variant="p">{data?.current?.wind_speed_10m !== undefined ? `${data.current.wind_speed_10m} ${data?.current_units?.wind_speed_10m ?? 'km/h'}` : '—'}</Box>
                <Box variant="h3">Conditions</Box>
                <Box variant="p">{describeWeather(data?.current?.weather_code)}</Box>
                <Box variant="h3">Local time</Box>
                <Box variant="p">{data?.current?.time ?? '—'}</Box>
              </Grid>
            )}
          </Container>

          <Container
            header={<Header variant="h2">7-day forecast</Header>}
          >
            <Table
              items={dailyRows}
              columnDefinitions=[
                { id: 'date', header: 'Date', cell: item => item.date },
                { id: 'min', header: `Min (${unitLabel})`, cell: item => (item.min !== undefined ? item.min.toFixed(1) : '—') },
                { id: 'max', header: `Max (${unitLabel})`, cell: item => (item.max !== undefined ? item.max.toFixed(1) : '—') },
                { id: 'conditions', header: 'Conditions', cell: item => item.description },
              ]
              trackBy="date"
              resizableColumns
              stickyHeader
              empty={<Box variant="p">No forecast available</Box>}
            />
          </Container>

          <Box variant="p">
            Data from <Link href="https://open-meteo.com/" external>Open‑Meteo</Link>. No API key required for typical use.
          </Box>
        </SpaceBetween>
      }
    />
  );
}