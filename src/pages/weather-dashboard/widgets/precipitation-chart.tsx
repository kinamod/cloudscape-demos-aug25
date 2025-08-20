// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';

import { WeatherData } from '../services/weather-api';

interface PrecipitationChartWidgetProps {
  data: WeatherData;
}

export function PrecipitationChartWidget({ data }: PrecipitationChartWidgetProps) {
  const { hourly } = data;

  const maxPrecipitation = Math.max(...hourly.precipitation, 10); // Min scale of 10mm
  const totalPrecipitation = hourly.precipitation.reduce((sum, value) => sum + value, 0);

  const chartData = hourly.time.map((time, index) => ({
    time: new Date(time).getHours(),
    precipitation: hourly.precipitation[index],
    windSpeed: hourly.windSpeed[index],
  }));

  return (
    <Container
      header={
        <Header variant="h3">
          24-Hour Precipitation & Wind
        </Header>
      }
    >
      <div className="precipitation-chart">
        <Box padding={{ bottom: 'm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <Box color="text-status-inactive">Precipitation (mm) & Wind (km/h)</Box>
            <Box>
              Total rain: <span style={{ fontWeight: 'bold' }}>{totalPrecipitation.toFixed(1)} mm</span>
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

              {/* Precipitation bars */}
              {chartData.map((point, index) => {
                const x = (index / chartData.length) * 800;
                const barWidth = 800 / chartData.length * 0.6;
                const barHeight = (point.precipitation / maxPrecipitation) * 120;
                return (
                  <rect
                    key={`precip-${index}`}
                    x={x + barWidth * 0.2}
                    y={140 - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill="var(--color-background-status-info)"
                    opacity="0.7"
                  />
                );
              })}

              {/* Wind speed line */}
              <polyline
                points={chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 800;
                  const maxWind = Math.max(...chartData.map(d => d.windSpeed));
                  const y = 140 - (point.windSpeed / maxWind) * 100;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="var(--color-text-status-warning)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />

              {/* Hour labels */}
              {chartData.filter((_, index) => index % 4 === 0).map((point, index) => {
                const originalIndex = index * 4;
                const x = (originalIndex / chartData.length) * 800 + (800 / chartData.length) * 0.5;
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-background-status-info)', opacity: 0.7 }}></div>
              <Box fontSize="body-s" color="text-status-inactive">Precipitation</Box>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '2px', backgroundColor: 'var(--color-text-status-warning)' }}></div>
              <Box fontSize="body-s" color="text-status-inactive">Wind Speed</Box>
            </div>
          </div>

          <Box padding={{ top: 's' }} color="text-status-inactive" fontSize="body-s">
            Showing hourly precipitation and wind speed for the next 24 hours
          </Box>
        </Box>
      </div>
    </Container>
  );
}
