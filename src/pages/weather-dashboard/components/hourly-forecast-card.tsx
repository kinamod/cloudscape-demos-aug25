// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Badge from '@cloudscape-design/components/badge';

import { WeatherData, getWeatherDescription } from '../weather-service';

interface HourlyForecastCardProps {
  weatherData: WeatherData;
}

export function HourlyForecastCard({ weatherData }: HourlyForecastCardProps) {
  const { hourly } = weatherData;

  const formatHour = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  const hourlyData = hourly.time.map((time, index) => ({
    time,
    formattedTime: formatHour(time),
    temperature: hourly.temperature[index],
    weatherCode: hourly.weatherCode[index],
    precipitation: hourly.precipitation[index],
    windSpeed: hourly.windSpeed[index],
  }));

  return (
    <Container
      header={
        <Header variant="h2" description="Next 24 hours">
          Hourly Forecast
        </Header>
      }
    >
      <Table
        columnDefinitions={[
          {
            id: 'time',
            header: 'Time',
            cell: item => <Box fontWeight="bold">{item.formattedTime}</Box>,
            sortingField: 'time',
            width: 80,
          },
          {
            id: 'weather',
            header: 'Weather',
            cell: item => {
              const weather = getWeatherDescription(item.weatherCode);
              return (
                <SpaceBetween direction="horizontal" size="xs">
                  <span>{weather.icon}</span>
                  <Box variant="small">{weather.description}</Box>
                </SpaceBetween>
              );
            },
            width: 140,
          },
          {
            id: 'temperature',
            header: 'Temp',
            cell: item => (
              <Box fontWeight="bold" color="text-status-info">
                {Math.round(item.temperature)}°C
              </Box>
            ),
            sortingField: 'temperature',
            width: 60,
          },
          {
            id: 'precipitation',
            header: 'Rain',
            cell: item =>
              item.precipitation > 0 ? (
                <Badge color="blue">{item.precipitation} mm</Badge>
              ) : (
                <Box variant="small" color="text-status-inactive">
                  0 mm
                </Box>
              ),
            sortingField: 'precipitation',
            width: 70,
          },
          {
            id: 'wind',
            header: 'Wind',
            cell: item => <Box variant="small">{Math.round(item.windSpeed)} km/h</Box>,
            sortingField: 'windSpeed',
            width: 80,
          },
        ]}
        items={hourlyData}
        loadingText="Loading forecast"
        trackBy="time"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No hourly forecast data available.
            </Box>
          </Box>
        }
        variant="embedded"
      />
    </Container>
  );
}
