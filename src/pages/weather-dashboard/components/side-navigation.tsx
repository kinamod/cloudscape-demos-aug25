// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';

export function WeatherSideNavigation() {
  return (
    <SideNavigation
      header={{
        href: '#/',
        text: 'Weather Dashboard',
      }}
      items={[
        {
          type: 'section',
          text: 'Current Weather',
          items: [
            { type: 'link', text: 'Overview', href: '#/overview' },
            { type: 'link', text: 'Details', href: '#/details' },
          ],
        },
        {
          type: 'section',
          text: 'Forecasts',
          items: [
            { type: 'link', text: '7-Day Forecast', href: '#/forecast' },
            { type: 'link', text: 'Hourly Forecast', href: '#/hourly' },
          ],
        },
        {
          type: 'section',
          text: 'Historical',
          items: [
            { type: 'link', text: 'Past Week', href: '#/historical' },
            { type: 'link', text: 'Monthly Trends', href: '#/trends' },
          ],
        },
        {
          type: 'divider',
        },
        {
          type: 'link',
          text: 'Settings',
          href: '#/settings',
        },
      ]}
    />
  );
}
