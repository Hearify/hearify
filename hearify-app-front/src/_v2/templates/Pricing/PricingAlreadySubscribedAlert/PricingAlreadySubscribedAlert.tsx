import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { useAuthStore } from '@src/store/auth';
import styles from './PricingAlreadySubscribedAlert.module.scss';

const PricingAlreadySubscribedAlert: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.PricingAlreadySubscribedAlert' });
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { subscription } = useAuthStore((state) => state);

  const subscriptionName: string = constantsT(`subscription.name.${subscription?.name}`);

  if (!subscription) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <CheckCircleIcon className={styles.icon} />
        <p className={styles.text}>{`${t('text-start')} ${subscriptionName} ${t('text-end')}`}</p>
      </div>
    </div>
  );
};

export default PricingAlreadySubscribedAlert;
