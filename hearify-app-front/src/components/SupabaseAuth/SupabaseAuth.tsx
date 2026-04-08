import React from 'react';
import '@src/components/SupabaseAuth/SupabaseAuth.scss';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { GoogleButton } from '@src/components/GoogleButton/GoogleButton.tsx';
import line from '@src/assets/images/menu/sign-in-line.svg';

export const SupabaseAuth: React.FC = () => {
  const { t, i18n } = useTranslation('general');

  const handleClick = (provider: string) => {
    axios
      .get(`api/auth/login/${provider}`)
      .then((res) => {
        window.location.replace(res.data.url);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className="oauth_wrapper"
      style={{
        width: '100%',
      }}
    >
      <div className="divider">
        <img src={line} alt="" />
        <span>or</span>
        <img src={line} alt="" />
      </div>

      <GoogleButton text={t('sign_in_with_google')} onClick={() => handleClick('google')} />
    </div>
  );
};
