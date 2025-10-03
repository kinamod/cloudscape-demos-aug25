// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useMemo, useRef, useState } from 'react';

import { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import Flashbar from '@cloudscape-design/components/flashbar';
import Grid from '@cloudscape-design/components/grid';
import Header from '@cloudscape-design/components/header';
import Input from '@cloudscape-design/components/input';
import LineChart from '@cloudscape-design/components/line-chart';
import Select, { SelectProps } from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { Breadcrumbs, Navigation, Notifications } from '../commons';
import { CustomAppLayout } from '../commons/common-components';

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_weather?: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    time: string;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    weather_code?: number[];
    sunrise?: string[];
    sunset?: string[];
  };
}

const WMO_CODE: Record<number, string> = {
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

export function App() {
  const [query, setQuery] = useState('');
  const [units, setUnits] = useState<'celsius' | 'fahrenheit'>('celsius');
  const [windUnit, setWindUnit] = useState<'kmh' | 'mph'>('kmh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoResult | null>(null);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const appLayout = useRef<AppLayoutProps.Ref>(null);

  async function searchCity(name: string): Promise<GeoResult | null> {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    const first = (data?.results?.[0] ?? null) as any;
    if (!first) return null;
    return {
      id: first.id,
      name: first.name,
      latitude: first.latitude,
      longitude: first.longitude,
      country: first.country,
      admin1: first.admin1,
      timezone: first.timezone,
    };
  }

  async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current_weather: 'true',
      hourly: ['temperature_2m'].join(','),
      daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum', 'sunrise', 'sunset', 'weather_code'].join(','),
      forecast_days: '7',
      timezone: 'auto',
      temperature_unit: units,
      wind_speed_unit: windUnit,
    });
    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast request failed');
    return (await res.json()) as ForecastResponse;
  }

  const onSearch = async () => {
    setError(null);
    setLoading(true);
    setForecast(null);
    setLocation(null);
    try {
      if (!query || query.trim().length < 2) {
        throw new Error('Enter at least 2 characters to search.');
      }
      const loc = await searchCity(query.trim());
      if (!loc) {
        throw new Error('No matching location found.');
      }
      setLocation(loc);
      const fc = await fetchForecast(loc.latitude, loc.longitude);
      setForecast(fc);
    } catch (e: any) {
      setError(e?.message || 'Unable to fetch weather data.');
    } finally {
      setLoading(false);
    }
  };

  const cityLabel = useMemo(() => {
    if (!location) return '';
    const parts = [location.name, location.admin1, location.country].filter(Boolean);
    return parts.join(', ');
  }, [location]);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="#/weather-dashboard" />}
      notifications={<Notifications />}
      breadcrumbs={<Breadcrumbs items={[{ text: 'Weather Dashboard', href: '#/' }]} />}
      content={
        <SpaceBetween size="l">
          <Container header={<Header variant="h1">Weather dashboard</Header>}>
            <SpaceBetween size="m">
              <Grid gridDefinition={[{ colspan: { default: 12, m: 6, l: 6 } }, { colspan: { default: 12, m: 3, l: 3 } }, { colspan: { default: 12, m: 3, l: 3 } }]}>
                <Input
                  value={query}
                  onChange={({ detail }) => setQuery(detail.value)}
                  placeholder="Search city (e.g. Berlin, New York)"
                  ariaLabel="Search city"
                />
                <Select
                  selectedOption={{ value: units, label: units === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)' }}
                  onChange={({ detail }) => setUnits((detail.selectedOption.value as 'celsius' | 'fahrenheit') ?? 'celsius')}
                  options={[
                    { value: 'celsius', label: 'Celsius (°C)' },
                    { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
                  ] as SelectProps.Option[]}
                  ariaLabel="Temperature unit"
                />
                <Select
                  selectedOption={{ value: windUnit, label: windUnit === 'kmh' ? 'Wind km/h' : 'Wind mph' }}
                  onChange={({ detail }) => setWindUnit((detail.selectedOption.value as 'kmh' | 'mph') ?? 'kmh')}
                  options={[
                    { value: 'kmh', label: 'Wind km/h' },
                    { value: 'mph', label: 'Wind mph' },
                  ] as SelectProps.Option[]}
                  ariaLabel="Wind speed unit"
                />
              </Grid>
              <Button variant="primary" loading={loading} onClick={onSearch} iconAlign="right" iconName="search">
                Search
              </Button>
              {error && (
                <Flashbar
                  items={[
                    {
                      type: 'error',
                      header: 'Request error',
                      content: error,
                      dismissible: true,
                      onDismiss: () => setError(null),
                    },
                  ]}
                />
              )}
            </SpaceBetween>
          </Container>

          {forecast && location && (
            <SpaceBetween size="l">
              <Container
                header={
                  <Header
                    variant="h2"
                    description={`${cityLabel} • ${forecast.timezone}`}
                  >
                    Current conditions
                  </Header>
                }
              >
                <ColumnLayout columns={4} variant="text-grid">
                  <div>
                    <Box variant="awsui-key-label">Temperature</Box>
                    <Box variant="p">{forecast.current_weather?.temperature}°</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Wind</Box>
                    <Box variant="p">{forecast.current_weather?.windspeed} {windUnit}</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Direction</Box>
                    <Box variant="p">{forecast.current_weather?.winddirection}°</Box>
                  </div>
                  <div>
                    <Box variant="awsui-key-label">Conditions</Box>
                    <Box variant="p">{WMO_CODE[forecast.current_weather?.weathercode ?? -1] ?? '—'}</Box>
                  </div>
                </ColumnLayout>
              </Container>

              <Container header={<Header variant="h2">7‑day forecast</Header>}>
                <LineChart
                  height={280}
                  hideFilter
                  hideLegend={false}
                  xScaleType="time"
                  xTitle="Day"
                  yTitle="Temperature"
                  series={[
                    {
                      title: 'Max',
                      type: 'line',
                      data: (forecast.daily?.time || []).map((t, i) => ({ x: new Date(t), y: forecast.daily?.temperature_2m_max?.[i] ?? null })),
                    },
                    {
                      title: 'Min',
                      type: 'line',
                      data: (forecast.daily?.time || []).map((t, i) => ({ x: new Date(t), y: forecast.daily?.temperature_2m_min?.[i] ?? null })),
                    },
                  ]}
                  i18nStrings={{
                    filterLabel: 'Filter displayed data',
                    filterPlaceholder: 'Filter data',
                    filterSelectedAriaLabel: 'selected',
                    legendAriaLabel: 'Legend',
                    chartAriaRoleDescription: 'line chart',
                    xAxisAriaRoleDescription: 'x axis',
                    yAxisAriaRoleDescription: 'y axis',
                  }}
                />
              </Container>

              <Container header={<Header variant="h2">Daily details</Header>}>
                <ColumnLayout columns={3} variant="text-grid">
                  {(forecast.daily?.time || []).map((t, i) => (
                    <div key={t}>
                      <Box variant="h3">{new Date(t).toLocaleDateString()}</Box>
                      <Box variant="awsui-key-label">Max / Min</Box>
                      <Box variant="p">
                        {forecast.daily?.temperature_2m_max?.[i]}° / {forecast.daily?.temperature_2m_min?.[i]}°
                      </Box>
                      <Box variant="awsui-key-label">Precipitation</Box>
                      <Box variant="p">{forecast.daily?.precipitation_sum?.[i] ?? 0} mm</Box>
                      <Box variant="awsui-key-label">Conditions</Box>
                      <Box variant="p">{WMO_CODE[forecast.daily?.weather_code?.[i] ?? -1] ?? '—'}</Box>
                    </div>
                  ))}
                </ColumnLayout>
              </Container>
            </SpaceBetween>
          )}
        </SpaceBetween>
      }
      toolsOpen={false}
      stickyNotifications
    />
  );
}
