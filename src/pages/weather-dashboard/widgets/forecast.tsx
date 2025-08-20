// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Container header={<Header variant="h3">7-Day Forecast</Header>}>
      <div
        className="forecast-container"
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          padding: '0.5rem 0',
          minHeight: '200px',
        }}
      >
        {forecastItems.map((item, index) => (
          <div
            key={item.date}
            className="forecast-card"
            style={{
              minWidth: '120px',
              flex: '0 0 auto',
              backgroundColor:
                index === 0
                  ? 'var(--color-background-layout-panel-content)'
                  : 'var(--color-background-container-content)',
              border:
                index === 0
                  ? '2px solid var(--color-border-item-selected)'
                  : '1px solid var(--color-border-divider-default)',
              borderRadius: '8px',
              padding: '1rem 0.75rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <SpaceBetween size="s">
              <Box
                fontSize={index === 0 ? 'body-m' : 'body-s'}
                fontWeight={index === 0 ? 'bold' : 'normal'}
                color={index === 0 ? 'text-body-default' : 'text-status-inactive'}
              >
                {formatDate(item.date)}
              </Box>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '32px' }}>
                <Icon name={getWeatherIcon(item.weatherCode)} size="medium" />
              </div>

              <Box
                fontSize="body-xs"
                textAlign="center"
                style={{ minHeight: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {getWeatherCodeDescription(item.weatherCode)}
              </Box>

              <SpaceBetween size="xs" alignItems="center">
                <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                  <Box fontSize="body-m" fontWeight="bold">
                    {Math.round(item.temperatureMax)}°
                  </Box>
                  <Box fontSize="body-s" color="text-status-inactive">
                    {Math.round(item.temperatureMin)}°
                  </Box>
                </div>
              </SpaceBetween>

              <SpaceBetween size="xs" alignItems="center">
                <Box fontSize="body-xs" color="text-status-inactive">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                    <Icon name="tint" size="small" />
                    {item.precipitation.toFixed(1)}mm
                  </div>
                </Box>
                <Box fontSize="body-xs" color="text-status-inactive">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                    <Icon name="arrow-right" size="small" />
                    {Math.round(item.windSpeed)}km/h
                  </div>
                </Box>
              </SpaceBetween>
            </SpaceBetween>
          </div>
        ))}
      </div>

      <Box padding={{ top: 's' }} color="text-status-inactive" fontSize="body-s" textAlign="center">
        Scroll horizontally to view all days
      </Box>
    </Container>
  );
}
