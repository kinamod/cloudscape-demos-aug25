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

function WindConditionsHeader() {
  return (
    <Header variant="h2" description="Current wind speed and direction">
      Wind Conditions
    </Header>
  );
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
  return directions[Math.round(degrees / 22.5) % 16];
}

function getWindSpeedDescription(speed: number): string {
  if (speed < 1) return 'Calm';
  if (speed < 6) return 'Light air';
  if (speed < 12) return 'Light breeze';
  if (speed < 20) return 'Gentle breeze';
  if (speed < 29) return 'Moderate breeze';
  if (speed < 39) return 'Fresh breeze';
  if (speed < 50) return 'Strong breeze';
  if (speed < 62) return 'Near gale';
  if (speed < 75) return 'Gale';
  if (speed < 89) return 'Strong gale';
  if (speed < 103) return 'Storm';
  return 'Hurricane force';
}

function WindConditionsWidget() {
  const [wind, setWind] = useState<WeatherCondition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWind() {
      try {
        const data = await fetchWeatherData();
        setWind(data.current);
      } catch (error) {
        console.error('Failed to load wind data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadWind();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" margin={{ top: 's' }}>
          Loading wind data...
        </Box>
      </Box>
    );
  }

  if (!wind) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">Unable to load wind data</Box>
      </Box>
    );
  }

  const windDirection = getWindDirection(wind.windDirection);
  const windDescription = getWindSpeedDescription(wind.windSpeed);

  return (
    <SpaceBetween size="l">
      <Box textAlign="center">
        <SpaceBetween size="s">
          <Box fontSize="display-l">💨</Box>
          <Box fontSize="heading-l" fontWeight="bold">
            {wind.windSpeed} km/h
          </Box>
          <Box variant="p" color="text-status-info">
            {windDescription}
          </Box>
        </SpaceBetween>
      </Box>

      <KeyValuePairs
        columns={1}
        items={[
          {
            label: 'Direction',
            value: (
              <SpaceBetween direction="horizontal" size="s">
                <Box variant="strong">{windDirection}</Box>
                <Box variant="p">({wind.windDirection}°)</Box>
              </SpaceBetween>
            ),
          },
          {
            label: 'Classification',
            value: windDescription,
          },
        ]}
      />

      <Box>
        <SpaceBetween size="s">
          <Box variant="strong">Wind compass</Box>
          <Box textAlign="center" padding="s">
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: '2px solid #232f3e',
                position: 'relative',
                margin: '0 auto',
                backgroundColor: '#fafbfc',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '2px',
                  height: '30px',
                  backgroundColor: '#0972d3',
                  transformOrigin: 'bottom',
                  transform: `translate(-50%, -100%) rotate(${wind.windDirection}deg)`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                N
              </div>
            </div>
            <Box variant="small" margin={{ top: 'xs' }}>
              Wind direction: {windDirection}
            </Box>
          </Box>
        </SpaceBetween>
      </Box>
    </SpaceBetween>
  );
}

export const windConditions: WidgetConfig = {
  definition: { defaultRowSpan: 4, defaultColumnSpan: 1 },
  data: {
    icon: 'refresh',
    title: 'Wind Conditions',
    description: 'Current wind speed and direction',
    header: WindConditionsHeader,
    content: WindConditionsWidget,
  },
};
