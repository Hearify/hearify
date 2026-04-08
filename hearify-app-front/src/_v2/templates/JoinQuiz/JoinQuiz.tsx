import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';

import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import AppInput from '@v2/components/AppInput/AppInput';
import AppButton from '@v2/components/AppButton/AppButton';
import { errorToast } from '@src/toasts/toasts';
import { trackEvent } from '@src/util/analyticTracking';
import styles from './JoinQuiz.module.scss';

const JoinQuiz: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.JoinQuiz' });
  const navigate = useNavigate();

  const [currentCode, setCurrentCode] = useState<string>('');

  const handleSubmit = (): void => {
    if (currentCode === '') {
      errorToast(t('empty-error'));
      return;
    }

    trackEvent({
      event_type: 'Join to quiz',
      event_properties: {
        type: 'Join with code',
        // eslint-disable-next-line no-restricted-globals
        location: location.pathname,
      },
    });

    QuizAPI.getQuiz(currentCode)
      .then(() => navigate(`/waiting/${currentCode}`))
      .catch(() => errorToast(t('not-found-error')));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentCode(e.target.value);
  };

  return (
    <main className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          {t('title')} <span className={styles.titleHighlight}>Hearify</span>
        </h1>

        <div className={styles.subtitle}>{t('subtitle')}</div>

        <div className={styles.body}>
          <AppInput value={currentCode} onChange={handleChange} placeholder={t('input-placeholder')} size="lg" />

          <AppButton size="lg" onClick={handleSubmit}>
            {t('button')} <ArrowRightEndOnRectangleIcon />
          </AppButton>
        </div>

        <p className={styles.text}>
          {t('text')} <a href="https://hearify.org/">hearify.org</a>
        </p>

        <p className={styles.note}>
          <a href="https://hearify.org/terms-of-use" target="_blank" rel="noreferrer">
            {t('terms')}
          </a>{' '}
          |{' '}
          <a href="https://hearify.org/privacy-policy" target="_blank" rel="noreferrer">
            {t('privacy')}
          </a>
        </p>
      </div>
    </main>
  );
};

export default JoinQuiz;
