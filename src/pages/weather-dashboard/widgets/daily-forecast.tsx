// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
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

  return (
    <Box>
      <div style={{
        display: 'flex',
        overflowX: 'auto',
        gap: '16px',
        padding: '8px 0',
        scrollBehavior: 'smooth'
      }}>
        {forecast.map((day, index) => {
          const date = new Date(day.date);
          const weather = getWeatherDescription(day.weatherCode);
          const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
          const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={index}
              style={{
                minWidth: '140px',
                textAlign: 'center',
                padding: '16px 12px',
                border: '1px solid #e9ebed',
                borderRadius: '8px',
                background: index === 0 ? '#e1f5fe' : '#fafbfc',
                borderColor: index === 0 ? '#0972d3' : '#e9ebed',
              }}
            >
              <SpaceBetween size="s">
                <SpaceBetween size="xs">
                  <Box variant="strong" fontWeight="bold">
                    {dayName}
                  </Box>
                  <Box variant="small" color="text-status-info">
                    {dateString}
                  </Box>
                </SpaceBetween>

                <Box fontSize="display-l">
                  {weather.icon}
                </Box>

                <Box variant="small" textAlign="center">
                  {weather.description}
                </Box>

                <SpaceBetween size="xs">
                  <SpaceBetween direction="horizontal" size="s" alignItems="center">
                    <Box variant="strong" fontSize="heading-s">
                      {day.maxTemp}°
                    </Box>
                    <Box variant="p" color="text-status-inactive">
                      {day.minTemp}°
                    </Box>
                  </SpaceBetween>
                </SpaceBetween>

                <SpaceBetween size="xs">
                  <Box variant="small" color="text-status-info">
                    💧 {day.precipitation.toFixed(1)}mm
                  </Box>
                  <Box variant="small" color="text-status-info">
                    💨 {day.windSpeed}km/h
                  </Box>
                </SpaceBetween>
              </SpaceBetween>
            </div>
          );
        })}
      </div>
    </Box>
  );
}

export const dailyForecast: WidgetConfig = {
  definition: { defaultRowSpan: 2, defaultColumnSpan: 4 },
  data: {
    icon: 'calendar',
    title: 'Daily Forecast',
    description: '7-day weather forecast',
    header: DailyForecastHeader,
    content: DailyForecastWidget,
    disableContentPaddings: true,
  },
};
