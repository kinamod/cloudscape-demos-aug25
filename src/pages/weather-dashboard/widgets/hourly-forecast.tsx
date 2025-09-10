// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Spinner from '@cloudscape-design/components/spinner';

import { WidgetConfig } from '../../dashboard/widgets/interfaces';
import { fetchWeatherData, HourlyForecast, getWeatherDescription } from '../services/weather-api';

function HourlyForecastHeader() {
  return (
    <Header variant="h2" description="24-hour weather forecast">
      Hourly Forecast
    </Header>
  );
}

function HourlyForecastWidget() {
  const [forecast, setForecast] = useState<HourlyForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await fetchWeatherData();
        setForecast(data.hourly.slice(0, 12)); // Show next 12 hours
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
        {forecast.map((hour, index) => {
          const time = new Date(hour.time);
          const weather = getWeatherDescription(hour.weatherCode);
          
          return (
            <div
              key={index}
              style={{
                minWidth: '80px',
                textAlign: 'center',
                padding: '12px 8px',
                border: '1px solid #e9ebed',
                borderRadius: '8px',
                background: '#fafbfc',
              }}
            >
              <SpaceBetween size="xs">
                <Box variant="small" fontWeight="bold">
                  {time.getHours()}:00
                </Box>
                <Box fontSize="display-s">
                  {weather.icon}
                </Box>
                <Box variant="strong">
                  {hour.temperature}°
                </Box>
                <Box variant="small" color="text-status-info">
                  {hour.precipitationProbability}%
                </Box>
                <Box variant="small">
                  {hour.windSpeed} km/h
                </Box>
              </SpaceBetween>
            </div>
          );
        })}
      </div>
    </Box>
  );
}

export const hourlyForecast: WidgetConfig = {
  definition: { defaultRowSpan: 2, defaultColumnSpan: 4 },
  data: {
    icon: 'calendar',
    title: 'Hourly Forecast',
    description: '24-hour weather forecast',
    header: HourlyForecastHeader,
    content: HourlyForecastWidget,
    disableContentPaddings: true,
  },
};
