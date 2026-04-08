import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import LoadingPage from '@src/pages/LoadingPage/LoadingPage.tsx';
import { useAuthStore } from '@src/store/auth.ts';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';

const SupabaseAuthHandle = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore((state) => state);
  function getAccessToken(location: string, nextParam: string | null) {
    if (location && nextParam)
      return location.slice(location.indexOf('=') + 1, location.indexOf(nextParam) - nextParam.length - 2);
  }

  const location = window.location.href;
  const urlParams = new URLSearchParams(location);

  const expiresAt = urlParams.get('expires_at');
  // const expiresIn = urlParams.get("expires_in");
  // const providerToken = urlParams.get("provider_token");
  // const tokenType = urlParams.get("token_type");
  const accessToken = getAccessToken(location, expiresAt);

  axios
    .post('api/auth/oauth/callback', null, { params: { token: accessToken } })
    .then((res) => {
      const { access_token: token, user, user_is_new: userIsNew } = res.data;
      localStorage.removeItem('pageNavigation');
      login(token, user);

      TrackingAPI.userId = String(user.id);
      TrackingAPI.trackEvent('authorization', {
        status: userIsNew ? 'sign_up' : 'login',
        method: 'google',
      });

      if (localStorage.getItem('open-new-quiz') && userIsNew) {
        navigate('/first-quiz');
        return;
      }

      navigate('/home');
    })
    .catch((err) => {
      console.log('LOGIN Request Error: ', err);
    });

  return <LoadingPage />;
};

export default SupabaseAuthHandle;
