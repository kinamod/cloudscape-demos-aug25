// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Header from '@cloudscape-design/components/header';
import HelpPanel from '@cloudscape-design/components/help-panel';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

export interface WeatherHeaderProps {
  actions?: React.ReactNode;
}

export function WeatherHeader({ actions }: WeatherHeaderProps) {
  return (
    <Header
      variant="h1"
      actions={actions}
      description="Real-time weather data and forecasts powered by Open-Meteo API"
    >
      Weather Dashboard
    </Header>
  );
}

export function WeatherMainInfo() {
  return (
    <HelpPanel header={<h2>Weather Dashboard</h2>}>
      <SpaceBetween size="l">
        <Box>
          <Box variant="h3">About this dashboard</Box>
          <Box variant="p">
            This weather dashboard demonstrates how to integrate external APIs with Cloudscape Design System components.
            It uses the free Open-Meteo weather API to display current conditions and forecasts.
          </Box>
        </Box>
        
        <Box>
          <Box variant="h3">Features</Box>
          <ul>
            <li>Current weather conditions</li>
            <li>7-day weather forecast</li>
            <li>Multiple city locations</li>
            <li>Interactive weather charts</li>
            <li>Real-time data updates</li>
          </ul>
        </Box>

        <Box>
          <Box variant="h3">Data source</Box>
          <Box variant="p">
            Weather data is provided by Open-Meteo, a free weather API service that offers 
            high-resolution forecasts without requiring API keys.
          </Box>
        </Box>
      </SpaceBetween>
    </HelpPanel>
  );
}
