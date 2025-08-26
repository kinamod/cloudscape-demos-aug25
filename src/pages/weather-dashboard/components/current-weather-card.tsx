// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Grid from '@cloudscape-design/components/grid';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Badge from '@cloudscape-design/components/badge';

import { WeatherData, getWeatherDescription } from '../weather-service';

interface CurrentWeatherCardProps {
  weatherData: WeatherData;
}

export function CurrentWeatherCard({ weatherData }: CurrentWeatherCardProps) {
  const { current } = weatherData;
  const weather = getWeatherDescription(current.weatherCode);

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getWindDirection = (degrees: number) => {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  return (
    <Container
      header={
        <Header variant="h2" description={`Last updated: ${formatTime(current.time)}`}>
          Current Weather
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Main Temperature Display */}
        <Grid gridDefinition={[{ colspan: { default: 12, s: 6 } }, { colspan: { default: 12, s: 6 } }]}>
          <Box textAlign="center">
            <SpaceBetween size="xs">
              <Box fontSize="display-l" fontWeight="bold" color="text-status-info">
                {Math.round(current.temperature)}°C
              </Box>
              <Box fontSize="heading-l">{weather.icon}</Box>
              <Box variant="h3" color="text-status-info">
                {weather.description}
              </Box>
              <Badge color="grey">Feels like {Math.round(current.apparentTemperature)}°C</Badge>
            </SpaceBetween>
          </Box>

          {/* Weather Details */}
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Wind Speed</Box>
              <Box>{current.windSpeed} km/h</Box>
            </SpaceBetween>

            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Wind Direction</Box>
              <Box>
                {getWindDirection(current.windDirection)} ({current.windDirection}°)
              </Box>
            </SpaceBetween>

            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Humidity</Box>
              <Box>{current.relativeHumidity}%</Box>
            </SpaceBetween>

            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Apparent Temperature</Box>
              <Box>{Math.round(current.apparentTemperature)}°C</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Grid>
      </SpaceBetween>
    </Container>
  );
}
