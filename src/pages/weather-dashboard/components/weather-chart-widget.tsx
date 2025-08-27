// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState } from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Tabs from '@cloudscape-design/components/tabs';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { ForecastData, Location } from '../types';

interface WeatherChartWidgetProps {
  forecastData: ForecastData | null;
  location: Location;
}

export function WeatherChartWidget({ forecastData, location }: WeatherChartWidgetProps) {
  const [activeTab, setActiveTab] = useState('hourly');

  if (!forecastData) {
    return (
      <Container>
        <Header variant="h2">Weather Trends</Header>
        <Box textAlign="center" padding="xl">
          <StatusIndicator type="loading">Loading weather trends...</StatusIndicator>
        </Box>
      </Container>
    );
  }

  const formatHour = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: 'numeric', 
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const HourlyChart = () => (
    <SpaceBetween size="m">
      <Box variant="h3">Next 24 Hours</Box>
      <div className="weather-chart-container">
        <ColumnLayout columns={6} variant="text-grid">
          {forecastData.hourly.slice(0, 6).map((hour, index) => (
            <div key={hour.time} className="hourly-chart-item" style={{ textAlign: 'center' }}>
              <Box variant="small" color="text-status-inactive">
                {formatHour(hour.time)}
              </Box>
              <Box fontWeight="bold" margin={{ top: 'xs', bottom: 'xs' }}>
                {hour.temperature}°
              </Box>
              <Box variant="small" color="text-status-info">
                {hour.humidity}%
              </Box>
              {hour.precipitationProbability > 0 && (
                <Box variant="small" color="text-status-info" margin={{ top: 'xxs' }}>
                  {hour.precipitationProbability}%
                </Box>
              )}
            </div>
          ))}
        </ColumnLayout>
      </div>
    </SpaceBetween>
  );

  const WeeklyChart = () => (
    <SpaceBetween size="m">
      <Box variant="h3">7-Day Temperature Trend</Box>
      <div className="weather-chart-container">
        <ColumnLayout columns={7} variant="text-grid">
          {forecastData.daily.map((day, index) => (
            <div key={day.date} className="daily-chart-item" style={{ textAlign: 'center' }}>
              <Box variant="small" color="text-status-inactive">
                {formatDate(day.date)}
              </Box>
              <Box fontWeight="bold" margin={{ top: 'xs' }} color="text-status-error">
                {day.temperatureMax}°
              </Box>
              <Box variant="small" color="text-status-info">
                {day.temperatureMin}°
              </Box>
              <Box variant="small" color="text-status-inactive" margin={{ top: 'xs' }}>
                {day.windSpeed} km/h
              </Box>
            </div>
          ))}
        </ColumnLayout>
      </div>
    </SpaceBetween>
  );

  return (
    <Container
      header={
        <Header
          variant="h2"
          description={`Weather trends and forecasts for ${location.name}`}
        >
          Weather Trends
        </Header>
      }
    >
      <Tabs
        tabs={[
          {
            id: 'hourly',
            label: 'Hourly Forecast',
            content: <HourlyChart />,
          },
          {
            id: 'weekly',
            label: 'Weekly Trends',
            content: <WeeklyChart />,
          },
        ]}
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId)}
      />
    </Container>
  );
}
