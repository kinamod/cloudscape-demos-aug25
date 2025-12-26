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
import Badge from '@cloudscape-design/components/badge';

import { ForecastData } from '../types';
import { getWeatherIcon } from '../utils/weather-api';

interface ForecastWidgetProps {
  forecastData: ForecastData | null;
}

export function ForecastWidget({ forecastData }: ForecastWidgetProps) {
  if (!forecastData) {
    return (
      <Container>
        <Header variant="h2">7-Day Forecast</Header>
        <Box textAlign="center" padding="xl">
          <StatusIndicator type="loading">Loading forecast...</StatusIndicator>
        </Box>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <Container
      header={
        <Header variant="h2" description="7-day weather forecast">
          Forecast
        </Header>
      }
    >
      <ColumnLayout columns={7} variant="text-grid">
        {forecastData.daily.map(day => (
          <div key={day.date} className="forecast-day-card">
            <Box textAlign="center">
              <Box fontWeight="bold" margin={{ bottom: 'xs' }}>
                {formatDate(day.date)}
              </Box>
              <Box margin={{ bottom: 's' }}>
                <Icon name={getWeatherIcon(day.weatherCode)} />
              </Box>
              <Box fontWeight="bold" margin={{ bottom: 'xs' }}>
                {day.temperatureMax}°
              </Box>
              <Box variant="small" color="text-status-inactive" margin={{ bottom: 's' }}>
                {day.temperatureMin}°
              </Box>
              <Box variant="small" color="text-status-inactive" margin={{ bottom: 'xs' }}>
                {day.description}
              </Box>
              <Box variant="small" color="text-status-inactive" margin={{ bottom: 'xs' }}>
                {day.windSpeed} km/h
              </Box>
              {day.precipitation > 0 && (
                <Badge color={day.precipitation > 5 ? 'blue' : 'grey'}>{day.precipitation.toFixed(1)}mm</Badge>
              )}
            </Box>
          </div>
        ))}
      </ColumnLayout>
    </Container>
  );
}
