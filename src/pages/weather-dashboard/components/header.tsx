// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Header from '@cloudscape-design/components/header';
import HelpPanel from '@cloudscape-design/components/help-panel';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

interface WeatherDashboardHeaderProps {
  actions?: React.ReactNode;
}

export function WeatherDashboardHeader({ actions }: WeatherDashboardHeaderProps) {
  return (
    <Header
      variant="h1"
      actions={actions}
      description="Real-time weather conditions and forecasts powered by Open-Meteo API"
    >
      Weather Dashboard
    </Header>
  );
}

export function WeatherDashboardMainInfo() {
  return (
    <HelpPanel
      header={<h2>Weather Dashboard</h2>}
      footer={
        <>
          <h3>Learn more</h3>
          <ul>
            <li>
              <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
                Open-Meteo API
              </a>
            </li>
            <li>
              <a href="https://cloudscape.design/" target="_blank" rel="noopener noreferrer">
                Cloudscape Design System
              </a>
            </li>
          </ul>
        </>
      }
    >
      <SpaceBetween size="m">
        <Box>
          <Box variant="strong">About this dashboard</Box>
          <Box variant="p">
            This weather dashboard displays real-time weather data and forecasts using the Open-Meteo API. 
            The dashboard includes current conditions, hourly and daily forecasts, precipitation data, 
            wind conditions, and weather alerts.
          </Box>
        </Box>
        <Box>
          <Box variant="strong">Data source</Box>
          <Box variant="p">
            Weather data is provided by Open-Meteo, a free weather API for non-commercial use. 
            The API provides high-quality weather forecasts and historical data from multiple 
            meteorological services.
          </Box>
        </Box>
      </SpaceBetween>
    </HelpPanel>
  );
}
