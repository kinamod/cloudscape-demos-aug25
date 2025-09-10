// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import Grid from '@cloudscape-design/components/grid';

import {
  currentConditions,
  hourlyForecast,
  dailyForecast,
  weatherAlerts,
  precipitation,
  windConditions,
  BaseStaticWidget,
} from '../widgets';

export function Content() {
  return (
    <Grid
      gridDefinition={[
        { colspan: { l: 6, m: 6, default: 12 } }, // Current conditions
        { colspan: { l: 6, m: 6, default: 12 } }, // Weather alerts
        { colspan: { l: 12, m: 12, default: 12 } }, // Hourly forecast
        { colspan: { l: 8, m: 8, default: 12 } }, // Daily forecast
        { colspan: { l: 4, m: 4, default: 12 } }, // Wind conditions
        { colspan: { l: 6, m: 6, default: 12 } }, // Precipitation
      ]}
    >
      {[currentConditions, weatherAlerts, hourlyForecast, dailyForecast, windConditions, precipitation].map(
        (widget, index) => (
          <BaseStaticWidget key={index} config={widget.data} />
        ),
      )}
    </Grid>
  );
}
