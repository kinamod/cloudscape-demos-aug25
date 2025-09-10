// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect } from 'react';

import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import Spinner from '@cloudscape-design/components/spinner';

import { WidgetConfig } from '../../dashboard/widgets/interfaces';
import { fetchWeatherData, HourlyForecast } from '../services/weather-api';

function PrecipitationHeader() {
  return (
    <Header variant="h2" description="Precipitation data and probabilities">
      Precipitation
    </Header>
  );
}

function PrecipitationWidget() {
  const [data, setData] = useState<{
    current: number;
    hourly: HourlyForecast[];
    dailyTotal: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrecipitation() {
      try {
        const weatherData = await fetchWeatherData();
        
        // Calculate daily total from hourly data
        const next24Hours = weatherData.hourly.slice(0, 24);
        const dailyTotal = next24Hours.reduce((sum, hour) => sum + hour.precipitation, 0);
        
        setData({
          current: weatherData.current.precipitation,
          hourly: next24Hours,
          dailyTotal,
        });
      } catch (error) {
        console.error('Failed to load precipitation data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPrecipitation();
  }, []);

  if (loading) {
    return (
      <Box textAlign="center" padding="l">
        <Spinner size="large" />
        <Box variant="p" margin={{ top: 's' }}>
          Loading precipitation data...
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" padding="l">
        <Box variant="p">Unable to load precipitation data</Box>
      </Box>
    );
  }

  // Get next 6 hours for probability display
  const next6Hours = data.hourly.slice(0, 6);
  const maxProbability = Math.max(...next6Hours.map(h => h.precipitationProbability));
  const avgProbability = next6Hours.reduce((sum, h) => sum + h.precipitationProbability, 0) / next6Hours.length;

  return (
    <SpaceBetween size="l">
      <KeyValuePairs
        columns={1}
        items={[
          {
            label: 'Current precipitation',
            value: `${data.current.toFixed(1)} mm`,
          },
          {
            label: '24-hour forecast',
            value: `${data.dailyTotal.toFixed(1)} mm`,
          },
        ]}
      />
      
      <SpaceBetween size="s">
        <Box variant="strong">Probability next 6 hours</Box>
        <ProgressBar
          value={Math.round(avgProbability)}
          additionalInfo={`Peak: ${Math.round(maxProbability)}%`}
          description="Average precipitation probability"
          label="Chance of rain"
        />
      </SpaceBetween>
      
      <SpaceBetween size="s">
        <Box variant="strong">Hourly breakdown</Box>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {next6Hours.map((hour, index) => {
            const time = new Date(hour.time);
            return (
              <Box
                key={index}
                padding="xs"
                textAlign="center"
                background="background-control-default"
              >
                <SpaceBetween size="xs">
                  <Box variant="small">{time.getHours()}:00</Box>
                  <Box variant="strong">{hour.precipitationProbability}%</Box>
                  <Box variant="small">{hour.precipitation.toFixed(1)}mm</Box>
                </SpaceBetween>
              </Box>
            );
          })}
        </div>
      </SpaceBetween>
    </SpaceBetween>
  );
}

export const precipitation: WidgetConfig = {
  definition: { defaultRowSpan: 4, defaultColumnSpan: 2 },
  data: {
    icon: 'cloud',
    title: 'Precipitation',
    description: 'Precipitation data and probabilities',
    header: PrecipitationHeader,
    content: PrecipitationWidget,
  },
};
