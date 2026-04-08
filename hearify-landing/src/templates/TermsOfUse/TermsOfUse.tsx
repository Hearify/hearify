import React from 'react';
import { useTranslation } from 'next-i18next';

import AppHeading from '@/components/AppHeading/AppHeading';
import styles from './TermsOfUse.module.scss';

const TermsOfUse: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.TermsOfUse' });

  const sections = [
    'introduction',
    'terms',
    'definitions',
    'restrictions',
    'payments',
    'subscriptions',
    'free-trial',
    'fee-changes',
    'refund',
    'promotions',
    'suggestions',
    'links',
    'cookies',
    'changes',
    'modifications',
    'updates',
    'third-party',
    'term-termination',
    'indemnification',
    'warranties',
    'liability',
    'severability',
    'waiver',
    'amendments',
    'agreement',
    'updates-terms',
    'property',
    'notice',
    'arbitrate',
    'binding-arbitration',
    'submissions-privacy',
    'typographical-errors',
    'miscellaneous',
    'disclaimer',
    'consent',
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

export default TermsOfUse;
