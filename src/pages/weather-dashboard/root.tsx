// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useMemo, useState } from 'react';

import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import { TableProps } from '@cloudscape-design/components/table';

import BreadcrumbGroup from '@cloudscape-design/components/breadcrumb-group';
import { CustomAppLayout, Notifications } from '../commons/common-components';

import '../../styles/base.scss';

interface GeoResultItem {
  id?: number;
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  admin1?: string;
}

interface GeoResponse {
  results?: GeoResultItem[];
}

interface ForecastResponseDaily {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max?: (number | null)[];
  wind_speed_10m_max?: (number | null)[];
  weather_code?: (number | null)[];
}

interface ForecastResponse {
  daily: ForecastResponseDaily;
  timezone?: string;
}

interface DailyRow {
  date: string;
  weekday: string;
  condition: string;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number | null;
  windSpeedMax: number | null;
}

const WMO_CODE_DESCRIPTION: Record<number, string> = {
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

function formatDate(dateIso: string, locale: string) {
  const d = new Date(dateIso + 'T00:00:00');
  const weekday = d.toLocaleDateString(locale, { weekday: 'short' });
  const date = d.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  return { weekday, date };
}

async function geocodeCity(name: string): Promise<GeoResultItem | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data: GeoResponse = await res.json();
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

async function fetchForecast(latitude: number, longitude: number, timezone?: string): Promise<ForecastResponse | null> {
  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'wind_speed_10m_max',
    'weather_code',
  ].join(',');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=${dailyParams}&timezone=${timezone ? encodeURIComponent(timezone) : 'auto'}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as ForecastResponse;
}

export function App() {
  const [cityInput, setCityInput] = useState('San Francisco');
  const [resolvedPlace, setResolvedPlace] = useState<GeoResultItem | null>(null);
  const [rows, setRows] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortingState, setSortingState] = useState<TableProps.SortingState<DailyRow>>();
  const items = useMemo(() => {
    if (!sortingState || !sortingState.sortingColumn || !('sortingField' in sortingState.sortingColumn)) {
      return rows;
    }
    const field = sortingState.sortingColumn.sortingField as keyof DailyRow | undefined;
    if (field !== 'temperatureMax' && field !== 'temperatureMin') return rows;
    const sorted = [...rows].sort((a, b) => {
      const av = a[field] as number;
      const bv = b[field] as number;
      return av - bv;
    });
    return sortingState.isDescending ? sorted.reverse() : sorted;
  }, [rows, sortingState]);

  const locationLabel = useMemo(() => {
    if (!resolvedPlace) return '';
    const parts = [resolvedPlace.name, resolvedPlace.admin1, resolvedPlace.country].filter(Boolean);
    return parts.join(', ');
  }, [resolvedPlace]);

  async function loadCityWeather(name: string) {
    setLoading(true);
    setError(null);
    try {
      const place = await geocodeCity(name);
      if (!place) {
        setResolvedPlace(null);
        setRows([]);
        setError('Location not found');
        setLoading(false);
        return;
      }
      setResolvedPlace(place);
      const forecast = await fetchForecast(place.latitude, place.longitude, place.timezone);
      if (!forecast) {
        setRows([]);
        setError('Could not load forecast');
        setLoading(false);
        return;
      }
      const daily = forecast.daily;
      const result: DailyRow[] = daily.time.map((t, idx) => {
        const { weekday, date } = formatDate(t, Intl.DateTimeFormat().resolvedOptions().locale);
        const code = daily.weather_code && daily.weather_code[idx] != null ? Number(daily.weather_code[idx]) : null;
        return {
          date,
          weekday,
          condition: code != null ? WMO_CODE_DESCRIPTION[code] ?? `Code ${code}` : '—',
          temperatureMax: daily.temperature_2m_max[idx],
          temperatureMin: daily.temperature_2m_min[idx],
          precipitationProbability: daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] ?? null : null,
          windSpeedMax: daily.wind_speed_10m_max ? daily.wind_speed_10m_max[idx] ?? null : null,
        };
      });
      setRows(result);
    } catch (e) {
      setError('Unexpected error loading weather');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial load
    loadCityWeather(cityInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CustomAppLayout
      toolsHide
      navigationHide
      contentType="table"
      content={
        <SpaceBetween size="l">
          <Header variant="h1">Weather dashboard</Header>

          <Container header={<Header variant="h2">Select location</Header>}>
            <SpaceBetween size="m">
              <FormField label="City name" description="Search worldwide places (powered by Open‑Meteo Geocoding)">
                <Input
                  value={cityInput}
                  onChange={({ detail }) => setCityInput(detail.value)}
                  onKeyDown={({ detail }) => {
                    if (detail.key === 'Enter') {
                      loadCityWeather(cityInput);
                    }
                  }}
                  placeholder="e.g., London, Tokyo, Seattle"
                />
              </FormField>
              <Button variant="primary" loading={loading} onClick={() => loadCityWeather(cityInput)}>
                Search
              </Button>
            </SpaceBetween>
          </Container>

          <Container
            header={
              <Header variant="h2" description={locationLabel ? `7‑day forecast for ${locationLabel}` : undefined}>
                Next 7 days
              </Header>
            }
          >
            {error && (
              <Box color="text-status-error" padding={{ bottom: 'm' }}>
                {error}
              </Box>
            )}
            <Table
              loading={loading}
              loadingText="Loading forecast"
              stickyHeader
              variant="full-page"
              columnDefinitions={[
                {
                  id: 'weekday',
                  header: 'Day',
                  cell: (item: DailyRow) => item.weekday,
                },
                {
                  id: 'date',
                  header: 'Date',
                  cell: (item: DailyRow) => item.date,
                },
                {
                  id: 'condition',
                  header: 'Conditions',
                  cell: (item: DailyRow) => item.condition,
                },
                {
                  id: 'temperatureMax',
                  header: 'High (°C)',
                  cell: (item: DailyRow) => `${Math.round(item.temperatureMax)}°`,
                  sortingField: 'temperatureMax',
                },
                {
                  id: 'temperatureMin',
                  header: 'Low (°C)',
                  cell: (item: DailyRow) => `${Math.round(item.temperatureMin)}°`,
                  sortingField: 'temperatureMin',
                },
                {
                  id: 'precipitationProbability',
                  header: 'Precip (%)',
                  cell: (item: DailyRow) => (item.precipitationProbability == null ? '—' : `${Math.round(item.precipitationProbability)}%`),
                },
                {
                  id: 'windSpeedMax',
                  header: 'Wind max (km/h)',
                  cell: (item: DailyRow) => (item.windSpeedMax == null ? '—' : `${Math.round(item.windSpeedMax)}`),
                },
              ]}
              items={items}
              sortingColumn={sortingState?.sortingColumn}
              sortingDescending={sortingState?.isDescending}
              onSortingChange={({ detail }) => setSortingState(detail)}
              empty={<Box padding={{ vertical: 'm' }}>Enter a city to see the forecast.</Box>}
            />
          </Container>

          <Box variant="p">
            Data provided by Open‑Meteo (api.open-meteo.com). Geocoding by Open‑Meteo.
          </Box>
        </SpaceBetween>
      }
      breadcrumbs={
        <BreadcrumbGroup
          items={[
            { text: 'Home', href: '#/' },
            { text: 'Weather dashboard', href: '#/weather-dashboard' },
          ]}
          expandAriaLabel="Show path"
          ariaLabel="Breadcrumbs"
        />
      }
      notifications={<Notifications />}
    />
  );
}
