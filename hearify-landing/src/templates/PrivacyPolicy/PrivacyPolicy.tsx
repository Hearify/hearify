import React from 'react';
import { useTranslation } from 'next-i18next';

import AppHeading from '@/components/AppHeading/AppHeading';
import styles from './PrivacyPolicy.module.scss';

const PrivacyPolicy: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.PrivacyPolicy' });

  const sections = [
    'introduction',
    'definitions',
    'information-collection',
    'types-data',
    'use-data',
    'data-retention',
    'data-transfer',
    'data-disclosure',
    'data-security',
    'gdpr-rights',
    'caloppa-rights',
    'do-not-track',
    'ccpa-rights',
    'service-providers',
    'analytics',
    'ci-cd',
    'payments',
    'links',
    'children',
    'changes',
    'introduction',
    'contact-us',
  ];

  return (
    <main className={styles.wrapper}>
      <AppHeading variant="h1">{t('title')}</AppHeading>
      <p className={styles.date}>{t('date')}</p>

      {sections.map(key => (
        // eslint-disable-next-line react/no-danger
        <div key={key} className={styles.content} dangerouslySetInnerHTML={{ __html: t(key) }} />
      ))}
    </main>
  );
};

export default PrivacyPolicy;
