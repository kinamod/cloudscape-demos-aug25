// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Badge from '@cloudscape-design/components/badge';
import { WeatherData, getWeatherDescription } from '../services/weather-api';

interface CurrentWeatherProps {
  data: WeatherData | null;
  locationName: string;
  loading?: boolean;
}

export function CurrentWeather({ data, locationName, loading }: CurrentWeatherProps) {
  if (loading) {
    return (
      <Container header={<Header>Current Weather</Header>}>
        <Box textAlign="center" padding="l">
          Loading current weather data...
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container header={<Header>Current Weather</Header>}>
        <Box textAlign="center" padding="l">
          No weather data available
        </Box>
      </Container>
    );
  }

  const current = data.current;
  const temperature = Math.round(current.temperature_2m);
  const description = getWeatherDescription(current.weather_code);

  return (
    <Container
      header={
        <Header description={`Current conditions for ${locationName}`} actions={<Badge color="green">Live</Badge>}>
          Current Weather
        </Header>
      }
    >
      <SpaceBetween size="l">
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Temperature</Box>
            <Box fontSize="display-l" fontWeight="bold">
              {temperature}°C
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Conditions</Box>
            <Box fontSize="heading-m">{description}</Box>
          </div>
        </ColumnLayout>

        <ColumnLayout columns={4} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Humidity</Box>
            <Box>{current.relative_humidity_2m}%</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Wind Speed</Box>
            <Box>{Math.round(current.wind_speed_10m)} km/h</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Wind Direction</Box>
            <Box>{current.wind_direction_10m}°</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Last Updated</Box>
            <Box>{new Date(current.time).toLocaleTimeString()}</Box>
          </div>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
}
