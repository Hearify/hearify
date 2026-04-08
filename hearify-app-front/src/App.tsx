import 'react-toastify/dist/ReactToastify.min.css';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { Route, type RouteProps, Routes, useLocation, useNavigate } from 'react-router-dom';

import i18n from '@src/util/i18n';
import axios from '@src/api/axios';
import { useAuthStore } from '@src/store/auth';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import uk from '@src/assets/uk.json';
import en from '@src/assets/en.json';
import { useSideNavigationLocalStorage } from '@src/util/hook/useSideNavigationLocalStorage';
import { initTracking, trackEvent } from '@src/util/analyticTracking';
import protectedRoutes from '@src/routes/protected';
import publicRoutes from '@src/routes/public';
import sharedRoutes from '@src/routes/shared';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';

import type { User } from '@src/store/auth';

/* eslint-disable react/jsx-props-no-spreading */
const App: React.FC = () => {
  const location = useLocation();
  const [_, __, setSideNavigationPosition] = useSideNavigationLocalStorage();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(!!localStorage.getItem('@token'));
  const { login, logout, isLoggedIn } = useAuthStore((state) => state);

  const activeRoutes = useMemo<RouteProps[]>(() => {
    if (isLoggedIn) {
      return [...protectedRoutes, ...sharedRoutes];
    }

    return [...publicRoutes, ...sharedRoutes];
  }, [isLoggedIn]);

  initTracking();

  useEffect(() => {
    if (!i18n.hasResourceBundle('en', 'general')) {
      i18n.addResourceBundle('en', 'general', en);
    }
    if (!i18n.hasResourceBundle('uk', 'general')) {
      i18n.addResourceBundle('uk', 'general', uk);
    }

    const fetchLogin = async () => {
      const token = localStorage.getItem('@token');
      if (token === null || token === undefined) {
        console.log('TOKEN IS NULL OR UNDEFINED!!');
        logout();
        setIsLoading(false);
      } else {
        try {
          const response = await axios.get('/api/users/me');
          const user = response.data as User;

          TrackingAPI.userId = String(user.id);
          TrackingAPI.trackEvent('authorization', {
            status: 'logged_in',
          });

          login(token, user);
          navigate(pathname);
        } catch (err) {
          console.log('error: ', err);
          logout();
          navigate('/login');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchLogin();
  }, []);

  useEffect(() => {
    trackEvent({
      event_type: 'Navigation',
      event_properties: {
        location: location.pathname,
      },
    });
    setSideNavigationPosition(location.pathname);
  }, [location]);

  if (isLoading) {
    return (
      <Routes>
        <Route path="*" element={<LoadingPage />} />
      </Routes>
    );
  }

  return (
    <>
      <ToastContainer />

      <Routes>
        {activeRoutes.map((route) => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
    </>
  );
};

export default App;
