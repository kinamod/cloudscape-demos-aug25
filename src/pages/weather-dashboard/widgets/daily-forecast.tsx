// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Spinner from '@cloudscape-design/components/spinner';

import { WidgetConfig } from '../../dashboard/widgets/interfaces';
import { fetchWeatherData, DailyForecast, getWeatherDescription } from '../services/weather-api';

function DailyForecastHeader() {
  return (
    <Header variant="h2" description="7-day weather forecast">
      Daily Forecast
    </Header>
  );
}

function DailyForecastWidget() {
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await fetchWeatherData();
        setForecast(data.daily);
      } catch (error) {
        console.error('Failed to load forecast data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" margin={{ top: 's' }}>
          Loading forecast...
        </Box>
      </Box>
    );
  }

  const forecastItems = forecast.map((day, index) => {
    const date = new Date(day.date);
    const weather = getWeatherDescription(day.weatherCode);
    const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      day: dayName,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weather: weather.icon,
      description: weather.description,
      high: day.maxTemp,
      low: day.minTemp,
      precipitation: day.precipitation,
      wind: day.windSpeed,
    };
  });

  return (
    <Table
      columnDefinitions={[
        {
          id: 'day',
          header: 'Day',
          cell: item => (
            <SpaceBetween size="xs">
              <Box variant="strong">{item.day}</Box>
              <Box variant="small">{item.date}</Box>
            </SpaceBetween>
          ),
          width: 80,
        },
        {
          id: 'weather',
          header: 'Weather',
          cell: item => (
            <SpaceBetween direction="horizontal" size="s">
              <Box fontSize="display-s">{item.weather}</Box>
              <Box variant="p">{item.description}</Box>
            </SpaceBetween>
          ),
          width: 140,
        },
        {
          id: 'temperature',
          header: 'Temperature',
          cell: item => (
            <SpaceBetween direction="horizontal" size="s">
              <Box variant="strong">{item.high}°</Box>
              <Box variant="p" color="text-status-inactive">{item.low}°</Box>
            </SpaceBetween>
          ),
          width: 100,
        },
        {
          id: 'precipitation',
          header: 'Precipitation',
          cell: item => `${item.precipitation.toFixed(1)} mm`,
          width: 100,
        },
        {
          id: 'wind',
          header: 'Wind',
          cell: item => `${item.wind} km/h`,
          width: 80,
        },
      ]}
      items={forecastItems}
      loadingText="Loading forecast"
      trackBy="day"
      empty={
        <Box textAlign="center" color="inherit">
          <Box variant="strong">No forecast data available</Box>
        </Box>
      }
      header={<Box variant="awsui-key-label">7-day forecast</Box>}
    />
  );
}

export const dailyForecast: WidgetConfig = {
  definition: { defaultRowSpan: 4, defaultColumnSpan: 3 },
  data: {
    icon: 'calendar',
    title: 'Daily Forecast',
    description: '7-day weather forecast',
    header: DailyForecastHeader,
    content: DailyForecastWidget,
  },
};
