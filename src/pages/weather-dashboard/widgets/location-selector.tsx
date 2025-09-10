// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import { Location, DEFAULT_LOCATIONS } from '../services/weather-api';

interface LocationSelectorProps {
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export function LocationSelector({ selectedLocation, onLocationChange, onRefresh, loading }: LocationSelectorProps) {
  const locationOptions = DEFAULT_LOCATIONS.map(location => ({
    label: location.name,
    value: location.name,
    description: `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`,
  }));

  const selectedOption = locationOptions.find(option => option.value === selectedLocation.name);

  return (
    <Container
      header={
        <Header
          actions={
            <Button 
              iconName="refresh" 
              loading={loading}
              onClick={onRefresh}
            >
              Refresh Data
            </Button>
          }
        >
          Location
        </Header>
      }
    >
      <SpaceBetween size="m">
        <Select
          selectedOption={selectedOption || null}
          onChange={({ detail }) => {
            const location = DEFAULT_LOCATIONS.find(loc => loc.name === detail.selectedOption.value);
            if (location) {
              onLocationChange(location);
            }
          }}
          options={locationOptions}
          placeholder="Select a location"
          expandToViewport
        />
      </SpaceBetween>
    </Container>
  );
}
