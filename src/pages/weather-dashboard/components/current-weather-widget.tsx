// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Icon from '@cloudscape-design/components/icon';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { WeatherData, Location } from '../types';
import { getWeatherIcon, formatWindDirection } from '../utils/weather-api';

interface CurrentWeatherWidgetProps {
  weatherData: WeatherData | null;
  location: Location;
}

export function CurrentWeatherWidget({ weatherData, location }: CurrentWeatherWidgetProps) {
  if (!weatherData) {
    return (
      <Container>
        <Header variant="h2">Current Weather</Header>
        <Box textAlign="center" padding="xl">
          <StatusIndicator type="loading">Loading current weather...</StatusIndicator>
        </Box>
      </Container>
    );
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container
      header={
        <Header variant="h2" description={`${location.name} • Updated ${formatTime(weatherData.time)}`}>
          Current Weather
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Main weather display */}
        <Box textAlign="center">
          <div className="current-weather-main">
            <Icon name={getWeatherIcon(weatherData.weatherCode)} size="large" />
            <Box fontSize="display-l" fontWeight="bold" margin={{ top: 's', bottom: 'xs' }}>
              {weatherData.temperature}°C
            </Box>
            <Box fontSize="heading-s" color="text-status-info">
              {weatherData.description}
            </Box>
          </div>
        </Box>

        {/* Weather details */}
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Humidity</Box>
            <Box variant="awsui-value-large">{weatherData.humidity}%</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Wind</Box>
            <Box variant="awsui-value-large">
              {weatherData.windSpeed} km/h {formatWindDirection(weatherData.windDirection)}
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Pressure</Box>
            <Box variant="awsui-value-large">{weatherData.pressure} hPa</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Visibility</Box>
            <Box variant="awsui-value-large">{weatherData.visibility} km</Box>
          </div>
          <div>
            <Box variant="awsui-key-label">UV Index</Box>
            <Box variant="awsui-value-large">
              {weatherData.uvIndex}
              <Box
                variant="small"
                color={
                  weatherData.uvIndex > 7
                    ? 'text-status-error'
                    : weatherData.uvIndex > 5
                      ? 'text-status-warning'
                      : 'text-status-success'
                }
              >
                {weatherData.uvIndex > 7
                  ? 'Very High'
                  : weatherData.uvIndex > 5
                    ? 'High'
                    : weatherData.uvIndex > 2
                      ? 'Moderate'
                      : 'Low'}
              </Box>
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Cloud Cover</Box>
            <Box variant="awsui-value-large">{weatherData.cloudCover}%</Box>
          </div>
        </ColumnLayout>
      </SpaceBetween>
    </Container>
  );
}
