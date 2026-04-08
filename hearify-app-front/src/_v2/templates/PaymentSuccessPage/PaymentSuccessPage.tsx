import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import AppButtonLink from '@v2/components/AppButtonLink/AppButtonLink';
import StarsIcon from '@v2/assets/icons/stars.svg';
import styles from './PaymentSuccessPage.module.scss';

import type { SubscriptionName } from '@v2/types/subscription';

const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.PaymentSuccessPage' });
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { plan } = useParams<{ plan: SubscriptionName }>();

  const planFeatures: string[] = constantsT(`subscription.features.${plan}`, {
    returnObjects: true,
  });

  const planName: string = constantsT(`subscription.name.${plan}`);

  return (
    <main className={styles.wrapper}>
      <div className={styles.container}>
        <StarsIcon />

        <h2 className={styles.title}>{t('title')}</h2>

        <p className={styles.description}>{`${t('description')} ${planName}!`}</p>

        <ul className={styles.list}>
          {planFeatures.slice(3).map((item) => (
            <li className={styles.item}>{item}</li>
          ))}
        </ul>

        <AppButtonLink href="/generate-quiz" size="lg">
          {t('button')}
        </AppButtonLink>
      </div>
    </main>
  );
};

export default PaymentSuccessPage;
