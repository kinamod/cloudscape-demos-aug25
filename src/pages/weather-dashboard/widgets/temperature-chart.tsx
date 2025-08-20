// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';

import { WeatherData } from '../services/weather-api';

interface TemperatureChartWidgetProps {
  data: WeatherData;
}

export function TemperatureChartWidget({ data }: TemperatureChartWidgetProps) {
  const { hourly } = data;

  // Get next 24 hours of data
  const maxTemp = Math.max(...hourly.temperature);
  const minTemp = Math.min(...hourly.temperature);
  const tempRange = maxTemp - minTemp;

  const chartData = hourly.time.map((time, index) => ({
    time: new Date(time).getHours(),
    temperature: hourly.temperature[index],
    humidity: hourly.humidity[index],
  }));

  return (
    <Container
      header={
        <Header variant="h3">
          24-Hour Temperature Trend
        </Header>
      }
    >
      <div className="temperature-chart">
        <Box padding={{ bottom: 'm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Box color="text-status-inactive">Temperature (°C)</Box>
            <Box>
              <span style={{ fontWeight: 'bold' }}>{Math.round(maxTemp)}°</span>
              {' / '}
              <span style={{ color: 'var(--color-text-status-inactive)' }}>{Math.round(minTemp)}°</span>
            </Box>
          </div>

          <div className="chart-container" style={{ height: '200px', position: 'relative', border: '1px solid var(--color-border-divider-default)', borderRadius: '8px', padding: '1rem' }}>
            <svg width="100%" height="100%" viewBox="0 0 800 160">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map(i => (
                <line
                  key={i}
                  x1="0"
                  y1={i * 40}
                  x2="800"
                  y2={i * 40}
                  stroke="var(--color-border-divider-default)"
                  strokeWidth="1"
                  opacity="0.3"
                />
              ))}

              {/* Temperature line */}
              <polyline
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 800;
                  const y = 160 - ((point.temperature - minTemp) / tempRange) * 140 - 10;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="var(--color-text-accent)"
                strokeWidth="3"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {chartData.map((point, index) => {
                const x = (index / (chartData.length - 1)) * 800;
                const y = 160 - ((point.temperature - minTemp) / tempRange) * 140 - 10;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="var(--color-text-accent)"
                  />
                );
              })}

              {/* Hour labels */}
              {chartData.filter((_, index) => index % 4 === 0).map((point, index) => {
                const originalIndex = index * 4;
                const x = (originalIndex / (chartData.length - 1)) * 800;
                return (
                  <text
                    key={originalIndex}
                    x={x}
                    y="155"
                    textAnchor="middle"
                    fontSize="12"
                    fill="var(--color-text-status-inactive)"
                  >
                    {point.time}:00
                  </text>
                );
              })}
            </svg>
          </div>

          <Box padding={{ top: 's' }} color="text-status-inactive" fontSize="body-s">
            Showing hourly temperature for the next 24 hours
          </Box>
        </Box>
      </div>
    </Container>
  );
}
