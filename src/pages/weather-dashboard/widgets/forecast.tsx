// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import { WeatherData, getWeatherDescription } from '../services/weather-api';

interface ForecastProps {
  data: WeatherData | null;
  loading?: boolean;
}

export function Forecast({ data, loading }: ForecastProps) {
  if (loading) {
    return (
      <Container header={<Header>7-Day Forecast</Header>}>
        <Box textAlign="center" padding="l">
          Loading forecast data...
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container header={<Header>7-Day Forecast</Header>}>
        <Box textAlign="center" padding="l">
          No forecast data available
        </Box>
      </Container>
    );
  }

  const forecastItems = data.daily.time.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    }),
    weather: getWeatherDescription(data.daily.weather_code[index]),
    high: Math.round(data.daily.temperature_2m_max[index]),
    low: Math.round(data.daily.temperature_2m_min[index]),
    precipitation: Math.round(data.daily.precipitation_sum[index] * 10) / 10,
    weatherCode: data.daily.weather_code[index]
  }));

  const getPrecipitationBadge = (amount: number) => {
    if (amount === 0) return <Badge>None</Badge>;
    if (amount < 2) return <Badge color="blue">Light</Badge>;
    if (amount < 10) return <Badge color="grey">Moderate</Badge>;
    return <Badge color="red">Heavy</Badge>;
  };

  return (
    <Container header={<Header>7-Day Forecast</Header>}>
      <Table
        columnDefinitions={[
          {
            id: 'date',
            header: 'Date',
            cell: item => <Box fontWeight="bold">{item.date}</Box>,
            width: 120,
          },
          {
            id: 'weather',
            header: 'Conditions',
            cell: item => item.weather,
            width: 150,
          },
          {
            id: 'high',
            header: 'High',
            cell: item => <Box fontWeight="bold">{item.high}°C</Box>,
            width: 80,
          },
          {
            id: 'low',
            header: 'Low',
            cell: item => `${item.low}°C`,
            width: 80,
          },
          {
            id: 'precipitation',
            header: 'Precipitation',
            cell: item => (
              <div>
                {item.precipitation}mm {getPrecipitationBadge(item.precipitation)}
              </div>
            ),
            width: 140,
          },
        ]}
        items={forecastItems}
        trackBy="date"
        empty={
          <Box textAlign="center" color="inherit">
            <Box variant="strong" textAlign="center" color="inherit">
              No forecast data
            </Box>
            <Box variant="p" padding={{ bottom: 's' }} color="inherit">
              Check your connection and try again.
            </Box>
          </Box>
        }
      />
    </Container>
  );
}
