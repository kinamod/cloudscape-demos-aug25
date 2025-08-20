// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useRef, useState } from 'react';
import '@cloudscape-design/global-styles/dark-mode-utils.css';

import { CustomAppLayout, Notifications } from '../commons/common-components';
import { Breadcrumbs } from '../commons/breadcrumbs';
import { HelpPanelProvider } from '../commons/help-panel';
import ToolsContent from './tools-content';
import { WeatherHeader } from './components/header';
import { WeatherContent } from './components/content';
import { WeatherNavigation } from './components/side-navigation';

export default function WeatherDashboardApp() {
  const appLayout = useRef();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolsContent, setToolsContent] = useState(() => <ToolsContent />);

  return (
    <HelpPanelProvider value={{ setToolsOpen, setToolsContent }}>
      <CustomAppLayout
        ref={appLayout}
        navigation={<WeatherNavigation />}
        notifications={<Notifications />}
        breadcrumbs={<Breadcrumbs items={[{ text: 'Weather Dashboard', href: '#weather-dashboard' }]} />}
        content={
          <>
            <WeatherHeader />
            <WeatherContent />
          </>
        }
        tools={toolsContent}
        toolsOpen={toolsOpen}
        onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      />
    </HelpPanelProvider>
  );
}
