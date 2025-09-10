// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';

import SideNavigation, { SideNavigationProps } from '@cloudscape-design/components/side-navigation';

const navigationItems: SideNavigationProps['items'] = [
  { type: 'link', text: 'Weather Dashboard', href: '#/weather-dashboard' },
  { type: 'divider' },
  {
    type: 'link',
    text: 'Current Conditions',
    href: '#/weather-dashboard',
    info: <>View real-time weather data</>,
  },
  {
    type: 'link',
    text: 'Forecasts',
    href: '#/weather-dashboard',
    info: <>Hourly and daily weather forecasts</>,
  },
  {
    type: 'link',
    text: 'Weather Alerts',
    href: '#/weather-dashboard',
    info: <>Important weather warnings and alerts</>,
  },
  { type: 'divider' },
  {
    type: 'link',
    text: 'Settings',
    href: '#/weather-dashboard',
    info: <>Configure dashboard preferences</>,
  },
];

export function WeatherDashboardSideNavigation() {
  return (
    <SideNavigation
      activeHref="#/weather-dashboard"
      header={{ href: '#/', text: 'Weather Service' }}
      items={navigationItems}
    />
  );
}
