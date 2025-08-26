// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import Button from '@cloudscape-design/components/button';
import Input from '@cloudscape-design/components/input';
import FormField from '@cloudscape-design/components/form-field';
import Alert from '@cloudscape-design/components/alert';
import Spinner from '@cloudscape-design/components/spinner';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';

import { WeatherService, WeatherData } from './weather-service';
import { CurrentWeatherCard } from './components/current-weather-card';
import { HourlyForecastCard } from './components/hourly-forecast-card';
import { DailyForecastCard } from './components/daily-forecast-card';

export function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Load weather for a default location (New York) on component mount
  useEffect(() => {
    loadWeatherData(40.7128, -74.0060, 'New York, NY');
  }, []);

  const loadWeatherData = async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await WeatherService.getWeatherData(lat, lon);
      setWeatherData(data);
      setCurrentLocation({ lat, lon, name: locationName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Simple reverse geocoding using a free service
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const locationData = await response.json();
          const locationName = `${locationData.city || locationData.locality || 'Unknown'}, ${locationData.countryCode || 'Unknown'}`;
          
          loadWeatherData(latitude, longitude, locationName);
        } catch {
          loadWeatherData(latitude, longitude, `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      },
      (error) => {
        setLoading(false);
        setError(`Location error: ${error.message}`);
      }
    );
  };

  const handleLocationSearch = async () => {
    if (!locationQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Using a free geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/geocoding-address?address=${encodeURIComponent(locationQuery)}&localityLanguage=en`
      );
      const locationData = await response.json();
      
      if (locationData.latitude && locationData.longitude) {
        loadWeatherData(locationData.latitude, locationData.longitude, locationQuery);
      } else {
        setError('Location not found. Please try a different search term.');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to search for location');
      setLoading(false);
    }
  };

  return (
    <AppLayout
      navigationHide
      toolsHide
      content={
        <ContentLayout
          header={
            <Header
              variant="h1"
              description="Real-time weather data and forecasts powered by Open-Meteo API"
              actions={
                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    variant="normal"
                    iconName="refresh"
                    onClick={() => {
                      if (currentLocation) {
                        loadWeatherData(currentLocation.lat, currentLocation.lon, currentLocation.name);
                      }
                    }}
                    disabled={loading || !currentLocation}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="primary"
                    iconName="search"
                    onClick={handleGetCurrentLocation}
                    disabled={loading}
                  >
                    Use My Location
                  </Button>
                </SpaceBetween>
              }
            >
              Weather Dashboard
            </Header>
          }
        >
          <SpaceBetween size="l">
            {/* Location Search */}
            <Container>
              <SpaceBetween size="m">
                <Box variant="h2">Location Search</Box>
                <Grid gridDefinition={[{ colspan: { default: 12, s: 8, m: 6 } }, { colspan: { default: 12, s: 4, m: 2 } }]}>
                  <FormField label="Search for a city or location">
                    <Input
                      value={locationQuery}
                      onChange={({ detail }) => setLocationQuery(detail.value)}
                      placeholder="Enter city name (e.g., London, Tokyo, San Francisco)"
                      onKeyDown={(event) => {
                        if (event.detail.key === 'Enter') {
                          handleLocationSearch();
                        }
                      }}
                    />
                  </FormField>
                  <FormField label=" ">
                    <Button
                      variant="primary"
                      onClick={handleLocationSearch}
                      disabled={loading || !locationQuery.trim()}
                      fullWidth
                    >
                      Search
                    </Button>
                  </FormField>
                </Grid>
                {currentLocation && (
                  <Badge color="blue">
                    Current location: {currentLocation.name}
                  </Badge>
                )}
              </SpaceBetween>
            </Container>

            {/* Error Message */}
            {error && (
              <Alert type="error" dismissible onDismiss={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Loading State */}
            {loading && (
              <Container>
                <Box textAlign="center" padding="xl">
                  <SpaceBetween size="m">
                    <Spinner size="large" />
                    <Box variant="p">Loading weather data...</Box>
                  </SpaceBetween>
                </Box>
              </Container>
            )}

            {/* Weather Data */}
            {weatherData && !loading && (
              <SpaceBetween size="l">
                {/* Current Weather */}
                <CurrentWeatherCard weatherData={weatherData} />
                
                {/* Forecasts */}
                <ColumnLayout columns={2} variant="text-grid">
                  <HourlyForecastCard weatherData={weatherData} />
                  <DailyForecastCard weatherData={weatherData} />
                </ColumnLayout>
              </SpaceBetween>
            )}
          </SpaceBetween>
        </ContentLayout>
      }
    />
  );
}
