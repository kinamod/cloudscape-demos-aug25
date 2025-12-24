// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import { WeatherData } from '../services/weather-api';

interface TemperatureChartProps {
  data: WeatherData | null;
  loading?: boolean;
}

export function TemperatureChart({ data, loading }: TemperatureChartProps) {
  if (loading) {
    return (
      <Container header={<Header>24-Hour Temperature Trend</Header>}>
        <Box textAlign="center" padding="l">
          Loading temperature data...
        </Box>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container header={<Header>24-Hour Temperature Trend</Header>}>
        <Box textAlign="center" padding="l">
          No temperature data available
        </Box>
      </Container>
    );
  }

  // Get next 24 hours of data
  const next24Hours = data.hourly.time.slice(0, 24).map((time, index) => ({
    time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temperature: Math.round(data.hourly.temperature_2m[index]),
    precipitation: Math.round(data.hourly.precipitation[index] * 10) / 10,
  }));

  // Simple text-based chart representation (in a real app, you'd use a charting library)
  const maxTemp = Math.max(...next24Hours.map(h => h.temperature));
  const minTemp = Math.min(...next24Hours.map(h => h.temperature));
  const tempRange = maxTemp - minTemp;

  const getBarHeight = (temp: number) => {
    if (tempRange === 0) return 50;
    return 20 + ((temp - minTemp) / tempRange) * 60; // 20-80% height
  };

  return (
    <Container header={<Header>24-Hour Temperature Trend</Header>}>
      <Box>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Temperature Range</Box>
            <Box>
              {minTemp}°C - {maxTemp}°C
            </Box>
          </div>
          <div>
            <Box variant="awsui-key-label">Data Points</Box>
            <Box>{next24Hours.length} hours</Box>
          </div>
        </ColumnLayout>

        <Box margin={{ top: 'l' }}>
          <Box variant="h4">Hourly Temperature (Next 24 Hours)</Box>
          <Box margin={{ top: 's' }}>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'end', height: '100px', marginTop: '10px' }}>
              {next24Hours.slice(0, 12).map((hour, index) => (
                <div key={index} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${getBarHeight(hour.temperature)}px`,
                      backgroundColor:
                        hour.temperature > 20 ? '#d73027' : hour.temperature > 10 ? '#fee08b' : '#4575b4',
                      marginBottom: '5px',
                      borderRadius: '2px',
                    }}
                    title={`${hour.time}: ${hour.temperature}°C`}
                  />
                  <Box fontSize="body-s" color="text-status-inactive">
                    {hour.time}
                  </Box>
                  <Box fontSize="body-s" fontWeight="bold">
                    {hour.temperature}°
                  </Box>
                </div>
              ))}
            </div>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
