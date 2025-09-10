// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';
import Grid from '@cloudscape-design/components/grid';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import { WeatherData, Location, DEFAULT_LOCATIONS, fetchWeatherData } from '../services/weather-api';
import { LocationSelector } from '../widgets/location-selector';
import { CurrentWeather } from '../widgets/current-weather';
import { Forecast } from '../widgets/forecast';
import { TemperatureChart } from '../widgets/temperature-chart';

export function WeatherContent() {
  const [selectedLocation, setSelectedLocation] = useState<Location>(DEFAULT_LOCATIONS[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = async (location: Location) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation]);

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleRefresh = () => {
    loadWeatherData(selectedLocation);
  };

  return (
    <SpaceBetween size="l">
      {error && (
        <Alert
          type="error"
          dismissible
          onDismiss={() => setError(null)}
          header="Weather Data Error"
        >
          {error}
        </Alert>
      )}

      <Grid
        gridDefinition={[
          { colspan: { default: 12, xs: 12, s: 12, m: 4, l: 4, xl: 4 } },
          { colspan: { default: 12, xs: 12, s: 12, m: 8, l: 8, xl: 8 } },
        ]}
      >
        <LocationSelector
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
          onRefresh={handleRefresh}
          loading={loading}
        />
        <CurrentWeather
          data={weatherData}
          locationName={selectedLocation.name}
          loading={loading}
        />
      </Grid>

      <Grid
        gridDefinition={[
          { colspan: { default: 12, xs: 12, s: 12, m: 6, l: 6, xl: 6 } },
          { colspan: { default: 12, xs: 12, s: 12, m: 6, l: 6, xl: 6 } },
        ]}
      >
        <TemperatureChart data={weatherData} loading={loading} />
        <Forecast data={weatherData} loading={loading} />
      </Grid>
    </SpaceBetween>
  );
}
