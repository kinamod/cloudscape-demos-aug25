// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';

export function WeatherHeader() {
  return (
    <Header
      variant="h1"
      description="Real-time weather data and forecasts powered by Open-Meteo API"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <Button iconName="refresh" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button variant="primary" iconName="settings">
            Settings
          </Button>
        </SpaceBetween>
      }
    >
      Weather Dashboard
    </Header>
  );
}
