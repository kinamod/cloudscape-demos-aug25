// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Spinner from '@cloudscape-design/components/spinner';

import { WidgetConfig } from '../../dashboard/widgets/interfaces';
import { fetchWeatherData, WeatherCondition } from '../services/weather-api';

function CurrentConditionsHeader() {
  return (
    <Header variant="h2" description="Real-time weather conditions for San Francisco, CA">
      Current Weather
    </Header>
  );
}

function CurrentConditionsWidget() {
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await fetchWeatherData();
        setWeather(data.current);
      } catch (error) {
        console.error('Failed to load weather data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" margin={{ top: 's' }}>
          Loading current conditions...
        </Box>
      </Box>
    );
  }

  if (!weather) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">Unable to load weather data</Box>
      </Box>
    );
  }

  return (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <SpaceBetween size="xs">
          <Box fontSize="display-l" fontWeight="bold">
            {weather.icon}
          </Box>
          <Box fontSize="heading-xl" fontWeight="bold">
            {weather.temperature}°C
          </Box>
          <Box variant="p" color="text-status-info">
            {weather.description}
          </Box>
          <Box variant="small">Feels like {weather.feelsLike}°C</Box>
        </SpaceBetween>
      </Box>

      <KeyValuePairs
        columns={2}
        items={[
          {
            label: 'Humidity',
            value: `${weather.humidity}%`,
          },
          {
            label: 'Wind Speed',
            value: `${weather.windSpeed} km/h`,
          },
          {
            label: 'Cloud Cover',
            value: `${weather.cloudCover}%`,
          },
          {
            label: 'Precipitation',
            value: `${weather.precipitation} mm`,
          },
        ]}
      />
    </SpaceBetween>
  );
}

export const currentConditions: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: 'status-positive',
    title: 'Current Conditions',
    description: 'Real-time weather conditions',
    header: CurrentConditionsHeader,
    content: CurrentConditionsWidget,
  },
};
