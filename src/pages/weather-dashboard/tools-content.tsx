// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from 'react';
import HelpPanel from '@cloudscape-design/components/help-panel';

export default function ToolsContent() {
  return (
    <HelpPanel
      header={<h2>Weather Dashboard</h2>}
      footer={
        <>
          <h3>Learn more</h3>
          <ul>
            <li>
              <a href="https://open-meteo.com/en/docs" target="_blank" rel="noopener noreferrer">
                Open-Meteo API Documentation
              </a>
            </li>
            <li>
              <a href="https://cloudscape.design" target="_blank" rel="noopener noreferrer">
                Cloudscape Design System
              </a>
            </li>
          </ul>
        </>
      }
    >
      <p>
        This weather dashboard demonstrates how to build a responsive weather application using the Open-Meteo API and
        Cloudscape Design System components.
      </p>
      <h3>Key Features</h3>
      <ul>
        <li>Current weather conditions</li>
        <li>7-day weather forecast</li>
        <li>Temperature and precipitation charts</li>
        <li>Multiple location support</li>
        <li>Real-time updates</li>
      </ul>
      <h3>Data Source</h3>
      <p>
        Weather data is provided by Open-Meteo, a free and open-source weather API that offers accurate high-resolution
        weather forecasts without requiring an API key.
      </p>
    </HelpPanel>
  );
}
