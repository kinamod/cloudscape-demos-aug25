// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState } from 'react';
import Select from '@cloudscape-design/components/select';
import Button from '@cloudscape-design/components/button';
import SpaceBetween from '@cloudscape-design/components/space-between';
import FormField from '@cloudscape-design/components/form-field';
import Input from '@cloudscape-design/components/input';
import Grid from '@cloudscape-design/components/grid';
import Box from '@cloudscape-design/components/box';

import { Location } from '../types';

interface LocationSelectorProps {
  currentLocation: Location;
  onLocationChange: (location: Location) => void;
}

const PRESET_LOCATIONS = [
  { label: 'New York City, NY', value: { latitude: 40.7128, longitude: -74.0060, name: 'New York City, NY' } },
  { label: 'London, UK', value: { latitude: 51.5074, longitude: -0.1278, name: 'London, UK' } },
  { label: 'Tokyo, Japan', value: { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo, Japan' } },
  { label: 'Sydney, Australia', value: { latitude: -33.8688, longitude: 151.2093, name: 'Sydney, Australia' } },
  { label: 'Paris, France', value: { latitude: 48.8566, longitude: 2.3522, name: 'Paris, France' } },
  { label: 'Toronto, Canada', value: { latitude: 43.6532, longitude: -79.3832, name: 'Toronto, Canada' } },
  { label: 'Berlin, Germany', value: { latitude: 52.5200, longitude: 13.4050, name: 'Berlin, Germany' } },
  { label: 'Mumbai, India', value: { latitude: 19.0760, longitude: 72.8777, name: 'Mumbai, India' } },
  { label: 'São Paulo, Brazil', value: { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo, Brazil' } },
  { label: 'Dubai, UAE', value: { latitude: 25.2048, longitude: 55.2708, name: 'Dubai, UAE' } },
];

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [customName, setCustomName] = useState('');
  const [customLatitude, setCustomLatitude] = useState('');
  const [customLongitude, setCustomLongitude] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const selectedOption = PRESET_LOCATIONS.find(
    location => 
      location.value.latitude === currentLocation.latitude && 
      location.value.longitude === currentLocation.longitude
  ) || { label: currentLocation.name, value: currentLocation };

  const handlePresetLocationChange = (option: any) => {
    if (option.selectedOption) {
      onLocationChange(option.selectedOption.value);
      setShowCustomForm(false);
    }
  };

  const handleCustomLocationSubmit = () => {
    const lat = parseFloat(customLatitude);
    const lng = parseFloat(customLongitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
      return;
    }

    const name = customName.trim() || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
    
    onLocationChange({
      latitude: lat,
      longitude: lng,
      name: name,
    });

    // Reset form
    setCustomName('');
    setCustomLatitude('');
    setCustomLongitude('');
    setShowCustomForm(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange({
            latitude,
            longitude,
            name: `Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please check your browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <SpaceBetween size="m">
      <Grid gridDefinition={[{ colspan: { default: 12, s: 8 } }, { colspan: { default: 12, s: 4 } }]}>
        <FormField label="Select Location">
          <Select
            selectedOption={selectedOption}
            onChange={handlePresetLocationChange}
            options={PRESET_LOCATIONS}
            placeholder="Choose a city"
          />
        </FormField>
        <FormField label="Quick Actions">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={getCurrentLocation} iconName="location">
              Use Current
            </Button>
            <Button 
              onClick={() => setShowCustomForm(!showCustomForm)}
              variant={showCustomForm ? 'normal' : 'link'}
            >
              Custom Location
            </Button>
          </SpaceBetween>
        </FormField>
      </Grid>

      {showCustomForm && (
        <Box padding="m" backgroundColor="background-container-content">
          <SpaceBetween size="m">
            <Box variant="h4">Enter Custom Location</Box>
            <Grid gridDefinition={[{ colspan: 4 }, { colspan: 4 }, { colspan: 4 }]}>
              <FormField label="Location Name (optional)">
                <Input
                  value={customName}
                  onChange={({ detail }) => setCustomName(detail.value)}
                  placeholder="e.g., My Home"
                />
              </FormField>
              <FormField label="Latitude" constraintText="-90 to 90">
                <Input
                  value={customLatitude}
                  onChange={({ detail }) => setCustomLatitude(detail.value)}
                  placeholder="e.g., 40.7128"
                  type="number"
                />
              </FormField>
              <FormField label="Longitude" constraintText="-180 to 180">
                <Input
                  value={customLongitude}
                  onChange={({ detail }) => setCustomLongitude(detail.value)}
                  placeholder="e.g., -74.0060"
                  type="number"
                />
              </FormField>
            </Grid>
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="primary" onClick={handleCustomLocationSubmit}>
                Set Location
              </Button>
              <Button onClick={() => setShowCustomForm(false)}>
                Cancel
              </Button>
            </SpaceBetween>
          </SpaceBetween>
        </Box>
      )}
      
      <Box variant="small" color="text-status-inactive">
        Current: {currentLocation.name} ({currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)})
      </Box>
    </SpaceBetween>
  );
}
