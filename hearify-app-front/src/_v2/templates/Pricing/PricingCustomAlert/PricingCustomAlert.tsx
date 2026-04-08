import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PricingCustomAlert.module.scss';
import AppIcon from '@v2/components/AppIcon/AppIcon';
import AppButtonLink from '@v2/components/AppButtonLink/AppButtonLink';

const PricingCustomAlert: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.PricingCustomAlert' });
  const planFeatures: string[] = t('features', { returnObjects: true });

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <p className={styles.title}>{t('title')}</p>
        <p className={styles.price}>{t('price')}</p>
        <p className={styles.details}>{t('details')}</p>
      </div>

      <p className={styles.subtitle}>{t('subtitle')}</p>
      <ul className={styles.features}>
        {planFeatures.map((item) => (
          <li key={item} className={styles.featuresItem}>
            {item}
          </li>
        ))}
      </ul>

      <AppButtonLink href="https://linktr.ee/hearify.edu" target="_blank">
        <AppIcon name="envelope" />
        {t('button')}
      </AppButtonLink>
    </div>
  );
};

export default PricingCustomAlert;
