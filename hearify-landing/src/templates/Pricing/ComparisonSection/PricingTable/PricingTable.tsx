import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './PricingTable.module.scss';
import GreenCheckmark from '@/assets/icons/check.svg';
import RedXMark from '@/assets/icons/x-mark.svg';
import SparklesIcon from '@/assets/icons/sparkles.svg';
import EnvelopeIcon from '@/assets/icons/envelope.svg';

type PlanName = 'Free' | 'Premium' | 'Max' | 'Custom';

const PricingTable: React.FC = () => {
  const { t } = useTranslation('common');

  const features: string[] = t('templates.pricingTable.features', { returnObjects: true });
  const plans: PlanName[] = ['Free', 'Premium', 'Max', 'Custom'];

  const priceDetails = [
    { monthly: t('templates.pricingTable.prices.free'), annual: '' },
    {
      monthly: t('templates.pricingTable.prices.premium.monthly'),
      annual: t('templates.pricingTable.prices.premium.annual'),
    },
    {
      monthly: t('templates.pricingTable.prices.max.monthly'),
      annual: t('templates.pricingTable.prices.max.annual'),
    },
    { monthly: t('templates.pricingTable.prices.custom'), annual: '' },
  ];

  const featureAvailability: string[][] = t('templates.pricingTable.featureAvailability', {
    returnObjects: true,
  });

  const renderValue = (value: string): React.ReactNode => {
    if (value === 'check') return <GreenCheckmark width={20} height={20} />;
    if (value === 'cross') return <RedXMark width={20} height={20} />;
    return value;
  };

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={`${styles.cell} ${styles.header} ${styles.featureHeader}`}>
          <div className={styles.featureHeaderContent}>
            <SparklesIcon />
            <span>{t('templates.pricingTable.featureHeader')}</span>
          </div>
        </div>
        {plans.map(plan => (
          <div key={plan} className={`${styles.cell} ${styles.header} ${plan === 'Premium' ? styles.premium : ''}`}>
            {t(`templates.pricingTable.planNames.${plan.toLowerCase()}`)}
          </div>
        ))}

        {features.map((feature, rowIndex) => (
          <React.Fragment key={feature}>
            <div className={`${styles.cell} ${styles.featureName}`}>{feature}</div>
            {feature === features[0]
              ? priceDetails.map((plan, index) => (
                  <div key={plan.monthly} className={styles.cell}>
                    <div className={styles.priceCell}>
                      <div className={styles.monthly}>{plan.monthly}</div>
                      <div className={styles.annual}>{plan.annual || <br />}</div>
                      {plan.monthly === t('templates.pricingTable.prices.custom') ? (
                        <a href="https://app.hearify.org/pricing" className={styles.priceButton}>
                          <EnvelopeIcon width={22} height={22} />
                          {t('templates.pricingTable.contactUs')}
                        </a>
                      ) : (
                        <a
                          href="https://app.hearify.org/pricing"
                          className={`${styles.priceButton} ${index === 1 ? styles.priceButtonPremium : ''}`}
                        >
                          {t('templates.pricingTable.startNow')}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              : featureAvailability[rowIndex - 1].map((value, colIndex) => {
                  const key = `${feature}-${plans[colIndex]}`;
                  return (
                    <div key={key} className={styles.cell}>
                      {renderValue(value)}
                    </div>
                  );
                })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PricingTable;
