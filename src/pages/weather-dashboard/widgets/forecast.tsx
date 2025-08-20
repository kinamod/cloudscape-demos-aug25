// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Icon from '@cloudscape-design/components/icon';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { WeatherData, getWeatherCodeDescription, getWeatherIcon } from '../services/weather-api';

interface ForecastWidgetProps {
  data: WeatherData;
}

export function ForecastWidget({ data }: ForecastWidgetProps) {
  const { daily } = data;

  const forecastItems = daily.time.map((date, index) => ({
    date,
    temperatureMax: daily.temperatureMax[index],
    temperatureMin: daily.temperatureMin[index],
    precipitation: daily.precipitation[index],
    windSpeed: daily.windSpeedMax[index],
    weatherCode: daily.weatherCode[index],
  }));

  return (
    <Container
      header={
        <Header variant="h3">
          7-Day Forecast
        </Header>
      }
    >
      <Table
        columnDefinitions={[
          {
            id: 'date',
            header: 'Date',
            cell: item => {
              const date = new Date(item.date);
              const today = new Date();
              const isToday = date.toDateString() === today.toDateString();
              const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();
              
              if (isToday) return 'Today';
              if (isTomorrow) return 'Tomorrow';
              return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            },
            width: 120,
          },
          {
            id: 'condition',
            header: 'Condition',
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs" alignItems="center">
                <Icon name={getWeatherIcon(item.weatherCode)} />
                <Box fontSize="body-s">
                  {getWeatherCodeDescription(item.weatherCode)}
                </Box>
              </SpaceBetween>
            ),
            width: 150,
          },
          {
            id: 'temperature',
            header: 'Temperature',
            cell: item => (
              <SpaceBetween direction="horizontal" size="xs">
                <Box fontWeight="bold">{Math.round(item.temperatureMax)}°</Box>
                <Box color="text-status-inactive">{Math.round(item.temperatureMin)}°</Box>
              </SpaceBetween>
            ),
            width: 100,
          },
          {
            id: 'precipitation',
            header: 'Rain',
            cell: item => `${item.precipitation.toFixed(1)} mm`,
            width: 80,
          },
          {
            id: 'wind',
            header: 'Wind',
            cell: item => `${Math.round(item.windSpeed)} km/h`,
            width: 80,
          },
        ]}
        items={forecastItems}
        loadingText="Loading forecast"
        trackBy="date"
        empty={
          <Box textAlign="center" color="inherit">
            <Box variant="strong" textAlign="center" color="inherit">
              No forecast data available
            </Box>
            <Box variant="p" padding={{ bottom: 's' }} color="inherit">
              Unable to load forecast information.
            </Box>
          </Box>
        }
        header={null}
      />
    </Container>
  );
}
