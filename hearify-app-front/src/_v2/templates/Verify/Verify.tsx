import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import AuthAPI from '@v2/api/AuthAPI/AuthAPI';
import { errorToast, successToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';

type VerifyParams = {
  code: string;
};

const Verify: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.Verify' });

  const { code } = useParams<VerifyParams>();

  const navigate = useNavigate();

  const { login, user } = useAuthStore();

  const verifyEmail = () => {
    if (!code) return;

    AuthAPI.verifyEmail(String(user?.id), code)
      .then((response) => {
        successToast(t('success'));
        login(response.access_token, response.user);
      })
      .catch(() => {
        errorToast(t('error'));
      })
      .finally(() => {
        navigate('/');
      });
  };

  useEffect(verifyEmail, []);

  return <LoadingPage />;
};

export default Verify;
