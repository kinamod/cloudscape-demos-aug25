// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
