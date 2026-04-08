import React from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@src/store/auth';
import AppButton from '@v2/components/AppButton/AppButton';
import ProgressCheckIcon from '@v2/assets/icons/progress-check.svg';
import AuthAPI from '@v2/api/AuthAPI/AuthAPI';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './EmailVerificationAlert.module.scss';

const EmailVerificationAlert: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'containers.EmailVerificationAlert' });

  const user = useAuthStore((state) => state.user);

  const sendEmail = () => {
    if (!user) return;

    AuthAPI.sendVerificationEmail(String(user.id))
      .then(() => {
        successToast(t('email-sent'));
      })
      .catch(() => {
        errorToast(t('error'));
      });
  };

  if (!user || user.email_verified) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <ProgressCheckIcon className={styles.icon} />
        <p className={styles.text}>{`${t('text')} ${user.email}`}</p>
      </div>

      <div className={styles.actions}>
        <AppButton size="sm" onClick={sendEmail}>
          {t('send-again')}
        </AppButton>
      </div>
    </div>
  );
};

export default EmailVerificationAlert;
