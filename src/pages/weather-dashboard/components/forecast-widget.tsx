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
        <Header
          variant="h2"
          description="7-day weather forecast"
        >
          Forecast
        </Header>
      }
    >
      <SpaceBetween size="s">
        {forecastData.daily.map((day, index) => (
          <div key={day.date} className="forecast-day-item">
            <ColumnLayout columns={4} variant="text-grid">
              <div>
                <Box fontWeight="bold">
                  {formatDate(day.date)}
                </Box>
                <Box variant="small" color="text-status-inactive">
                  {day.description}
                </Box>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Icon name={getWeatherIcon(day.weatherCode)} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <Box fontWeight="bold">
                  {day.temperatureMax}° / {day.temperatureMin}°
                </Box>
                <Box variant="small" color="text-status-inactive">
                  {day.windSpeed} km/h
                </Box>
              </div>
              <div style={{ textAlign: 'right' }}>
                {day.precipitationProbability > 0 && (
                  <Badge color={day.precipitationProbability > 70 ? 'blue' : 'grey'}>
                    {day.precipitationProbability}% rain
                  </Badge>
                )}
                {day.precipitation > 0 && (
                  <Box variant="small" color="text-status-info" margin={{ top: 'xxs' }}>
                    {day.precipitation.toFixed(1)}mm
                  </Box>
                )}
              </div>
            </ColumnLayout>
            {index < forecastData.daily.length - 1 && (
              <Box margin={{ top: 's', bottom: 's' }}>
                <hr style={{ border: 'none', borderTop: '1px solid #e9ebed', margin: 0 }} />
              </Box>
            )}
          </div>
        ))}
      </SpaceBetween>
    </Container>
  );
}
