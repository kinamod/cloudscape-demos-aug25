// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Spinner from '@cloudscape-design/components/spinner';
import Alert from '@cloudscape-design/components/alert';

import { CurrentWeatherWidget } from './current-weather-widget';
import { ForecastWidget } from './forecast-widget';
import { LocationSelector } from './location-selector';
import { WeatherChartWidget } from './weather-chart-widget';
import { fetchWeatherData, fetchForecastData } from '../utils/weather-api';
import { WeatherData, ForecastData, Location } from '../types';

export function Content() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [location, setLocation] = useState<Location>({ 
    latitude: 40.7128, 
    longitude: -74.0060, 
    name: 'New York City, NY' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [location]);

  const loadWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [weatherData, forecastData] = await Promise.all([
        fetchWeatherData(location.latitude, location.longitude),
        fetchForecastData(location.latitude, location.longitude)
      ]);
      
      setCurrentWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation);
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
      <Alert type="error" header="Failed to load weather data">
        {error}
      </Alert>
    );
  }

  return (
    <SpaceBetween size="l">
      <Container>
        <Header
          variant="h2"
          description="Select a location to view current weather conditions and forecasts"
        >
          Location & Current Weather
        </Header>
        <LocationSelector 
          currentLocation={location} 
          onLocationChange={handleLocationChange} 
        />
      </Container>

      <Grid
        gridDefinition={[
          { colspan: { default: 12, l: 6 } },
          { colspan: { default: 12, l: 6 } },
        ]}
      >
        <CurrentWeatherWidget 
          weatherData={currentWeather} 
          location={location} 
        />
        <ForecastWidget 
          forecastData={forecast} 
        />
      </Grid>

      <WeatherChartWidget 
        forecastData={forecast} 
        location={location} 
      />
    </SpaceBetween>
  );
}
