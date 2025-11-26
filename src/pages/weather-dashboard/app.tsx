// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';

import { CustomAppLayout, Notifications } from '../commons/common-components';
import { Content } from './content';

export function App() {
  return (
    <CustomAppLayout
      maxContentWidth={1280}
      toolsHide
      navigationHide
      content={
        <SpaceBetween size="l">
          <Header variant="h1">Weather Dashboard</Header>
          <Content />
        </SpaceBetween>
      }
      notifications={<Notifications />}
    />
  );
}
