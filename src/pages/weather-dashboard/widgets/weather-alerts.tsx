// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Alert from '@cloudscape-design/components/alert';
import Icon from '@cloudscape-design/components/icon';

import { WidgetConfig } from '../../dashboard/widgets/interfaces';
import { fetchWeatherData } from '../services/weather-api';

interface WeatherAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  icon: string;
}

function WeatherAlertsHeader() {
  return (
    <Header variant="h2" description="Important weather warnings and advisories">
      Weather Alerts
    </Header>
  );
}

function WeatherAlertsWidget() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchWeatherData();

        // Generate sample alerts based on current conditions
        const generatedAlerts: WeatherAlert[] = [];

        if (data.current.windSpeed > 25) {
          generatedAlerts.push({
            id: 'wind-advisory',
            type: 'warning',
            title: 'Wind Advisory',
            message: `High winds detected: ${data.current.windSpeed} km/h. Take caution when outdoors.`,
            icon: '💨',
          });
        }

        if (data.current.precipitation > 5) {
          generatedAlerts.push({
            id: 'heavy-rain',
            type: 'warning',
            title: 'Heavy Rain Warning',
            message: 'Significant precipitation expected. Potential for flooding in low-lying areas.',
            icon: '🌧️',
          });
        }

        if (data.current.temperature < 0) {
          generatedAlerts.push({
            id: 'freeze-warning',
            type: 'error',
            title: 'Freeze Warning',
            message: 'Temperatures below freezing. Protect pipes and plants.',
            icon: '🧊',
          });
        }

        if (data.current.temperature > 35) {
          generatedAlerts.push({
            id: 'heat-advisory',
            type: 'warning',
            title: 'Heat Advisory',
            message: 'Extreme heat conditions. Stay hydrated and avoid prolonged sun exposure.',
            icon: '🌡️',
          });
        }

        // Add a general info alert if no specific alerts
        if (generatedAlerts.length === 0) {
          generatedAlerts.push({
            id: 'all-clear',
            type: 'info',
            title: 'All Clear',
            message: 'No active weather alerts for your area. Conditions are favorable.',
            icon: '✅',
          });
        }

        setAlerts(generatedAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
        setAlerts([
          {
            id: 'error',
            type: 'error',
            title: 'Service Unavailable',
            message: 'Unable to load weather alerts at this time.',
            icon: '⚠️',
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Icon name="status-pending" size="large" />
        <Box variant="p" margin={{ top: 's' }}>
          Checking for alerts...
        </Box>
      </Box>
    );
  }

  return (
    <SpaceBetween size="s">
      {alerts.map(alert => (
        <Alert
          key={alert.id}
          type={alert.type}
          header={
            <SpaceBetween direction="horizontal" size="xs">
              <span>{alert.icon}</span>
              <span>{alert.title}</span>
            </SpaceBetween>
          }
        >
          {alert.message}
        </Alert>
      ))}
    </SpaceBetween>
  );
}

export const weatherAlerts: WidgetConfig = {
  definition: { defaultRowSpan: 3, defaultColumnSpan: 2 },
  data: {
    icon: 'notification',
    title: 'Weather Alerts',
    description: 'Important weather warnings and advisories',
    header: WeatherAlertsHeader,
    content: WeatherAlertsWidget,
  },
};
