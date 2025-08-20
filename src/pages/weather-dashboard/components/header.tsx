// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import Header from '@cloudscape-design/components/header';
import Button from '@cloudscape-design/components/button';
import ButtonDropdown from '@cloudscape-design/components/button-dropdown';
import SpaceBetween from '@cloudscape-design/components/space-between';

export function WeatherHeader() {
  return (
    <Header
      variant="h1"
      actions={
        <SpaceBetween direction="horizontal" size="xs">
          <ButtonDropdown
            items={[
              { id: 'celsius', text: 'Celsius' },
              { id: 'fahrenheit', text: 'Fahrenheit' },
            ]}
            onItemClick={() => {}}
          >
            Temperature Unit
          </ButtonDropdown>
          <Button iconName="refresh" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </SpaceBetween>
      }
    >
      Weather Dashboard
    </Header>
  );
}
