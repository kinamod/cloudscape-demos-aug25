// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState, useEffect } from 'react';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Select from '@cloudscape-design/components/select';
import Alert from '@cloudscape-design/components/alert';
import Spinner from '@cloudscape-design/components/spinner';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';

import { CurrentWeatherWidget } from '../widgets/current-weather';
import { ForecastWidget } from '../widgets/forecast';
import { TemperatureChartWidget } from '../widgets/temperature-chart';
import { PrecipitationChartWidget } from '../widgets/precipitation-chart';

import { fetchWeatherData, getDefaultLocations, WeatherData, WeatherLocation } from '../services/weather-api';

export function WeatherContent() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation>(getDefaultLocations()[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const locations = getDefaultLocations();

  const loadWeatherData = async (location: WeatherLocation) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData(location);
      setWeatherData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(selectedLocation);
  }, [selectedLocation]);

  const handleLocationChange = ({ detail }: { detail: { selectedOption: { value: string } } }) => {
    const location = locations.find(loc => loc.name === detail.selectedOption.value);
    if (location) {
      setSelectedLocation(location);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <Spinner size="large" />
          <div style={{ marginTop: '1rem' }}>Loading weather data...</div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert
        statusIconAriaLabel="Error"
        type="error"
        header="Failed to load weather data"
        action={<button onClick={() => loadWeatherData(selectedLocation)}>Retry</button>}
      >
        {error}
      </Alert>
    );
  }

  if (!weatherData) {
    return null;
  }

  return (
    <SpaceBetween size="l">
      <Container
        header={
          <Header
            variant="h2"
            actions={
              <Select
                selectedOption={{ label: selectedLocation.name, value: selectedLocation.name }}
                onChange={handleLocationChange}
                options={locations.map(location => ({
                  label: location.name,
                  value: location.name,
                }))}
                placeholder="Select location"
              />
            }
          >
            Weather for {selectedLocation.name}
          </Header>
        }
      >
        <Grid
          gridDefinition={[
            { colspan: { default: 12, xs: 12, s: 12, m: 6, l: 6, xl: 4 } },
            { colspan: { default: 12, xs: 12, s: 12, m: 6, l: 6, xl: 8 } },
          ]}
        >
          <CurrentWeatherWidget data={weatherData} />
          <ForecastWidget data={weatherData} />
        </Grid>
      </Container>

      <Grid
        gridDefinition={[
          { colspan: { default: 12, xs: 12, s: 12, m: 12, l: 6, xl: 6 } },
          { colspan: { default: 12, xs: 12, s: 12, m: 12, l: 6, xl: 6 } },
        ]}
      >
        <TemperatureChartWidget data={weatherData} />
        <PrecipitationChartWidget data={weatherData} />
      </Grid>
    </SpaceBetween>
  );
}
