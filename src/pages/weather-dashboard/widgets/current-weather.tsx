// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import Icon from '@cloudscape-design/components/icon';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { WeatherData, getWeatherCodeDescription, getWeatherIcon } from '../services/weather-api';

interface CurrentWeatherWidgetProps {
  data: WeatherData;
}

export function CurrentWeatherWidget({ data }: CurrentWeatherWidgetProps) {
  const { current } = data;
  const weatherDescription = getWeatherCodeDescription(current.weatherCode);
  const weatherIcon = getWeatherIcon(current.weatherCode);

  return (
    <Container header={<Header variant="h3">Current Conditions</Header>}>
      <SpaceBetween size="l">
        <div className="current-weather-main">
          <SpaceBetween direction="horizontal" size="m" alignItems="center">
            <Icon name={weatherIcon} size="large" />
            <Box>
              <Box fontSize="display-l" fontWeight="bold">
                {Math.round(current.temperature)}°C
              </Box>
              <Box color="text-status-inactive">{weatherDescription}</Box>
            </Box>
          </SpaceBetween>
        </div>

        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Wind Speed</Box>
            <SpaceBetween direction="horizontal" size="xs" alignItems="center">
              <Icon name="arrow-right" />
              <Box>{current.windSpeed} km/h</Box>
            </SpaceBetween>
          </div>

          <div>
            <Box variant="awsui-key-label">Humidity</Box>
            <Box>{current.humidity}%</Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Pressure</Box>
            <Box>{Math.round(current.pressure)} hPa</Box>
          </div>

          <div>
            <Box variant="awsui-key-label">UV Index</Box>
            <Badge color={getUVIndexColor(current.uvIndex)}>{current.uvIndex}</Badge>
          </div>

          <div>
            <Box variant="awsui-key-label">Visibility</Box>
            <Box>{(current.visibility / 1000).toFixed(1)} km</Box>
          </div>

          <div>
            <Box variant="awsui-key-label">Wind Direction</Box>
            <Box>{getWindDirection(current.windDirection)}</Box>
          </div>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
}

function getUVIndexColor(uvIndex: number): 'blue' | 'green' | 'yellow' | 'red' {
  if (uvIndex <= 2) return 'green';
  if (uvIndex <= 5) return 'yellow';
  if (uvIndex <= 7) return 'red';
  return 'red';
}

function getWindDirection(degrees: number): string {
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
}
