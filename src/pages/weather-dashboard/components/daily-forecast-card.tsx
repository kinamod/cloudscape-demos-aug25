// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Cards from '@cloudscape-design/components/cards';
import Badge from '@cloudscape-design/components/badge';
import ColumnLayout from '@cloudscape-design/components/column-layout';

import { WeatherData, getWeatherDescription } from '../weather-service';

interface DailyForecastCardProps {
  weatherData: WeatherData;
}

export function DailyForecastCard({ weatherData }: DailyForecastCardProps) {
  const { daily } = weatherData;

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
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const dailyData = daily.time.map((time, index) => ({
    time,
    formattedDate: formatDate(time),
    temperatureMax: daily.temperatureMax[index],
    temperatureMin: daily.temperatureMin[index],
    weatherCode: daily.weatherCode[index],
    precipitationSum: daily.precipitationSum[index],
    windSpeedMax: daily.windSpeedMax[index],
  }));

  return (
    <Container
      header={
        <Header variant="h2" description="7-day forecast">
          Daily Forecast
        </Header>
      }
    >
      <Cards
        ariaLabels={{
          itemSelectionLabel: (e, n) => `select ${n.formattedDate}`,
          selectionGroupLabel: 'Daily forecast selection',
        }}
        cardDefinition={{
          header: item => (
            <Box fontWeight="bold" fontSize="heading-s">
              {item.formattedDate}
            </Box>
          ),
          sections: [
            {
              id: 'weather',
              content: item => {
                const weather = getWeatherDescription(item.weatherCode);
                return (
                  <SpaceBetween size="xs">
                    <Box textAlign="center" fontSize="heading-l">
                      {weather.icon}
                    </Box>
                    <Box textAlign="center" variant="small">
                      {weather.description}
                    </Box>
                  </SpaceBetween>
                );
              },
            },
            {
              id: 'temperature',
              content: item => (
                <ColumnLayout columns={2} variant="text-grid">
                  <SpaceBetween size="xxs">
                    <Box variant="awsui-key-label">High</Box>
                    <Box fontWeight="bold" color="text-status-error">
                      {Math.round(item.temperatureMax)}°C
                    </Box>
                  </SpaceBetween>
                  <SpaceBetween size="xxs">
                    <Box variant="awsui-key-label">Low</Box>
                    <Box fontWeight="bold" color="text-status-info">
                      {Math.round(item.temperatureMin)}°C
                    </Box>
                  </SpaceBetween>
                </ColumnLayout>
              ),
            },
            {
              id: 'details',
              content: item => (
                <SpaceBetween size="xs">
                  {item.precipitationSum > 0 && <Badge color="blue">Rain: {item.precipitationSum} mm</Badge>}
                  <Box variant="small">Max wind: {Math.round(item.windSpeedMax)} km/h</Box>
                </SpaceBetween>
              ),
            },
          ],
        }}
        cardsPerRow={[
          { cards: 1, minWidth: 0 },
          { cards: 2, minWidth: 400 },
          { cards: 3, minWidth: 600 },
          { cards: 4, minWidth: 800 },
        ]}
        items={dailyData}
        loadingText="Loading daily forecast"
        trackBy="time"
        empty={
          <Box textAlign="center" color="inherit">
            <Box padding={{ bottom: 's' }} variant="p" color="inherit">
              No daily forecast data available.
            </Box>
          </Box>
        }
      />
    </Container>
  );
}
