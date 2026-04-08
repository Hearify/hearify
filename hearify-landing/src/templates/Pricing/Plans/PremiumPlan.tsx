import React from 'react';
import { useTranslation } from 'next-i18next';

import GreenCheckmark from '@/assets/icons/check.svg';
import RedXMark from '@/assets/icons/x-mark.svg';
import styles from '@/templates/Pricing/Plans/DesktopPlans.module.scss';
import ChevronRight from '@/assets/icons/chevron-right.svg';

type PlanInfo = {
  title: string;
  price: string;
  annualPrice: string;
  description: string;
  buttonText: string;
  dealLabel?: string;
  features: {
    feature: string;
    value: string;
  }[];
};

const PremiumPlan: React.FC = () => {
  const { t } = useTranslation('common');

  const planInfo: PlanInfo = t('templates.premiumPlan', { returnObjects: true });

  const renderFeatureValue = (value: string) => {
    if (value === 'check') return <GreenCheckmark width={20} height={20} />;
    if (value === 'cross') return <RedXMark width={20} height={20} />;
    return value;
  };

  return (
    <div className={`${styles.plan} ${styles.premium}`}>
      {planInfo.dealLabel && (
        <div className={styles.deal}>
          <p>{planInfo.dealLabel}</p>
        </div>
      )}
      <div className={styles.body}>
        <div className={styles['general-info']}>
          <p className={styles.title}>{planInfo.title}</p>
          <p className={styles.price}>{planInfo.price}</p>
          <p className={styles['annual-price']}>{planInfo.annualPrice}</p>
          <p className={styles.description}>{planInfo.description}</p>
        </div>
        <a href="https://app.hearify.org/pricing" target="_blank" className={styles['start-button']}>
          {planInfo.buttonText}
        </a>
        <div className={styles.features}>
          <p className={styles.title}>Features:</p>
          {planInfo.features.map(({ feature, value }) => (
            <div className={styles.feature} key={feature}>
              <span>{feature}</span>
              <span>{renderFeatureValue(value)}</span>
            </div>
          ))}
        </div>
        <div className={styles['btn-container']}>
          <a href="#pricing-table" className={styles.btn} type="button">
            SEE ALL FEATURES <ChevronRight />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PremiumPlan;
