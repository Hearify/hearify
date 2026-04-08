import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';

import App from '@src/App';
import '@sjmc11/tourguidejs/src/scss/tour.scss';
import '@src/index.scss';

import '@src/util/i18n';
import { theme } from '@src/util/theme';
import { TimerProvider } from '@src/components/Timer/TimerContext';
import { PermissionModalProvider } from '@v2/context/PermissionModalContext';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TimerProvider>
      <ThemeProvider theme={theme}>
        <BrowserRouter basename="/app">
          <PermissionModalProvider>
            <HelmetProvider>
              <App />
            </HelmetProvider>
          </PermissionModalProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TimerProvider>
  </React.StrictMode>
);
