// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';

export function WeatherNavigation() {
  return (
    <SideNavigation
      activeHref="weather-dashboard"
      header={{ href: '#/', text: 'Weather Service' }}
      items={[
        { type: 'link', text: 'Dashboard', href: '#weather-dashboard' },
        { type: 'divider' },
        {
          type: 'section',
          text: 'Locations',
          items: [
            { type: 'link', text: 'Current Location', href: '#current' },
            { type: 'link', text: 'Favorites', href: '#favorites' },
            { type: 'link', text: 'Add Location', href: '#add' },
          ],
        },
        { type: 'divider' },
        {
          type: 'section',
          text: 'Settings',
          items: [
            { type: 'link', text: 'Preferences', href: '#preferences' },
            { type: 'link', text: 'Notifications', href: '#notifications' },
          ],
        },
      ]}
    />
  );
}
