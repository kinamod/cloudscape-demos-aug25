// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AppLayoutProps } from '@cloudscape-design/components/app-layout';
import Alert from '@cloudscape-design/components/alert';
import Autosuggest, { AutosuggestProps } from '@cloudscape-design/components/autosuggest';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import LineChart from '@cloudscape-design/components/line-chart';
import Link from '@cloudscape-design/components/link';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { CustomAppLayout } from '../commons/common-components';
import { commonChartProps, dateTimeFormatter, lineChartInstructions } from '../dashboard/widgets/chart-commons';

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  timezone: string;
  admin1?: string;
  admin2?: string;
}

interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_units: Record<string, string>;
  current: {
    time: string;
    interval: number;
    temperature_2m?: number;
    relative_humidity_2m?: number;
    apparent_temperature?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
  };
  hourly_units: Record<string, string>;
  hourly: {
    time: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
  };
}

const DEFAULT_LOCATION: GeoResult = {
  id: 2643743,
  name: 'London',
  latitude: 51.50853,
  longitude: -0.12574,
  country: 'United Kingdom',
  timezone: 'Europe/London',
  admin1: 'England',
  admin2: 'Greater London',
};

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function App() {
  const appLayout = useRef<AppLayoutProps.Ref>(null);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query, 300);
  const [suggestions, setSuggestions] = useState<AutosuggestProps.Options>([]);
  const [location, setLocation] = useState<GeoResult>(DEFAULT_LOCATION);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = useCallback(async (name: string) => {
    if (!name || name.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=7&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Geocoding failed (${res.status})`);
      const data = await res.json();
      const options: AutosuggestProps.Options = (data.results || []).map((r: GeoResult) => ({
        value: `${r.name}, ${r.country}${r.admin1 ? `, ${r.admin1}` : ''}`,
        description: `${r.latitude.toFixed(2)}, ${r.longitude.toFixed(2)} • ${r.timezone}`,
        labelTag: r.timezone,
        tags: [r.country],
        extra: r,
      }));
      setSuggestions(options);
    } catch (e: any) {
      // Non-blocking error for suggestions
      console.error(e);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    searchLocations(debouncedQuery);
  }, [debouncedQuery, searchLocations]);

  const fetchWeather = useCallback(async (loc: GeoResult) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        timezone: 'auto',
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'wind_speed_10m',
          'wind_direction_10m',
        ].join(','),
        hourly: ['temperature_2m', 'relative_humidity_2m'].join(','),
        forecast_days: '5',
      });
      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
      const data: WeatherResponse = await res.json();
      setWeather(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(location);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.latitude, location.longitude]);

  const onSelectSuggestion: AutosuggestProps['onSelect'] = ({ detail }) => {
    const selected = detail.option.extra as GeoResult | undefined;
    if (selected) {
      setLocation(selected);
    }
  };

  const onChangeQuery: AutosuggestProps['onChange'] = ({ detail }) => setQuery(detail.value);

  const tryUseGeolocation = async () => {
    if (!('geolocation' in navigator)) return;
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const loc: GeoResult = {
          id: 0,
          name: 'My location',
          latitude,
          longitude,
          country: '',
          timezone: 'auto',
        };
        setLocation(loc);
        setLoading(false);
      },
      geoError => {
        setError(geoError.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const temperatureSeries = useMemo(() => {
    if (!weather?.hourly?.time || !weather?.hourly?.temperature_2m) return [];
    return [
      {
        title: 'Temperature (°C)',
        type: 'line' as const,
        data: weather.hourly.time.map((t, i) => ({ x: new Date(t), y: weather.hourly.temperature_2m![i] })),
      },
    ];
  }, [weather]);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigationOpen={false}
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              description="Live weather and forecast powered by Open‑Meteo. Search for a city or use your current location."
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button iconName="location" onClick={tryUseGeolocation}>
                    Use my location
                  </Button>
                  <Button iconName="external" variant="normal" href="https://open-meteo.com/en/docs" target="_blank">
                    API docs
                  </Button>
                </SpaceBetween>
              }
            >
              Weather dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            {error && (
              <Alert type="error" statusIconAriaLabel="Error">
                {error}
              </Alert>
            )}

            <Container header={<Header variant="h2">Location</Header>}>
              <SpaceBetween size="s">
                <Autosuggest
                  onChange={onChangeQuery}
                  onSelect={onSelectSuggestion}
                  value={query}
                  options={suggestions}
                  placeholder="Search for a city (e.g. London, Paris, Tokyo)"
                  ariaLabel="Search city"
                  empty="No matches"
                />

                <Box variant="p" color="inherit">
                  Showing weather for{' '}
                  <b>
                    {location.name}
                    {location.admin1 ? `, ${location.admin1}` : ''}
                    {location.country ? `, ${location.country}` : ''}
                  </b>{' '}
                  at {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)} •{' '}
                  <Link external href={`https://www.openstreetmap.org/#map=10/${location.latitude}/${location.longitude}`}>
                    View on map
                  </Link>
                </Box>
              </SpaceBetween>
            </Container>

            <ColumnLayout columns={3} variant="text-grid">
              <Container header={<Header variant="h2">Current conditions</Header>}>
                <ColumnLayout columns={3} variant="text-grid">
                  <Box>
                    <Box variant="small" color="text-label">Temperature</Box>
                    <Box variant="h1">
                      {weather?.current?.temperature_2m != null ? `${weather.current.temperature_2m.toFixed(1)} °C` : '—'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="small" color="text-label">Feels like</Box>
                    <Box variant="h1">
                      {weather?.current?.apparent_temperature != null
                        ? `${weather.current.apparent_temperature.toFixed(1)} °C`
                        : '—'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="small" color="text-label">Humidity</Box>
                    <Box variant="h1">
                      {weather?.current?.relative_humidity_2m != null
                        ? `${Math.round(weather.current.relative_humidity_2m)} %`
                        : '—'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="small" color="text-label">Wind speed</Box>
                    <Box variant="h1">
                      {weather?.current?.wind_speed_10m != null
                        ? `${weather.current.wind_speed_10m.toFixed(1)} ${weather?.current_units?.wind_speed_10m ?? 'km/h'}`
                        : '—'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="small" color="text-label">Wind direction</Box>
                    <Box variant="h1">
                      {weather?.current?.wind_direction_10m != null
                        ? `${Math.round(weather.current.wind_direction_10m)}°`
                        : '—'}
                    </Box>
                  </Box>
                  <Box>
                    <Box variant="small" color="text-label">Updated</Box>
                    <Box variant="h1">
                      {weather?.current?.time ? new Date(weather.current.time).toLocaleString() : '—'}
                    </Box>
                  </Box>
                </ColumnLayout>
              </Container>

              <Container header={<Header variant="h2">Hourly temperature</Header>}>
                <LineChart
                  {...commonChartProps}
                  height={300}
                  fitHeight={false}
                  hideFilter={true}
                  series={temperatureSeries}
                  xDomain={
                    weather?.hourly?.time && weather.hourly.time.length
                      ? [new Date(weather.hourly.time[0]), new Date(weather.hourly.time[weather.hourly.time.length - 1])]
                      : undefined
                  }
                  xScaleType="time"
                  xTitle="Time"
                  yTitle="Temp (°C)"
                  ariaLabel="Hourly temperature"
                  ariaDescription={`Line chart showing temperature forecast. ${lineChartInstructions}`}
                  i18nStrings={{
                    ...commonChartProps.i18nStrings,
                    xTickFormatter: dateTimeFormatter,
                  }}
                />
              </Container>

              <Container header={<Header variant="h2">About Open‑Meteo</Header>}>
                <SpaceBetween size="s">
                  <Box variant="p">
                    Open‑Meteo provides free weather APIs with hourly forecasts and current conditions. Data is returned as
                    JSON and can be used directly from the browser.
                  </Box>
                  <Box variant="p">
                    Read the documentation and explore variables at{' '}
                    <Link external href="https://open-meteo.com/en/docs">
                      open-meteo.com/en/docs
                    </Link>
                    . Geocoding provided by{' '}
                    <Link external href="https://geocoding-api.open-meteo.com/v1/search?name=London">
                      geocoding-api.open-meteo.com
                    </Link>
                    .
                  </Box>
                </SpaceBetween>
              </Container>
            </ColumnLayout>
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}
