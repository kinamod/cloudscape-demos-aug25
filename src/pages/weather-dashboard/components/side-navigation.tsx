// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';

export function WeatherSideNavigation() {
  return (
    <SideNavigation
      activeHref="#overview"
      header={{ href: '#/', text: 'Weather Service' }}
      items={[
        {
          type: 'section',
          text: 'Dashboard',
          items: [
            { type: 'link', text: 'Overview', href: '#overview' },
            { type: 'link', text: 'Current Conditions', href: '#current' },
            { type: 'link', text: 'Forecasts', href: '#forecasts' },
            { type: 'link', text: 'Historical Data', href: '#historical' },
          ],
        },
        {
          type: 'section',
          text: 'Locations',
          items: [
            { type: 'link', text: 'Manage Locations', href: '#locations' },
            { type: 'link', text: 'Add Location', href: '#add-location' },
          ],
        },
        {
          type: 'section',
          text: 'Settings',
          items: [
            { type: 'link', text: 'Preferences', href: '#preferences' },
            { type: 'link', text: 'Notifications', href: '#notifications' },
            { type: 'link', text: 'API Configuration', href: '#api-config' },
          ],
        },
      ]}
    />
  );
}
