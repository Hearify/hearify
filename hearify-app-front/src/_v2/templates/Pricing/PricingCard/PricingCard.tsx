import React from 'react';
import { useTranslation } from 'react-i18next';

import styles from './PricingCard.module.scss';
import AppButton from '@v2/components/AppButton/AppButton';
import formatPrice from '@v2/utils/formatPrice';
import { useAuthStore } from '@src/store/auth';

import type { Subscription } from '@v2/types/subscription';

export type PricingCardProps = {
  subscription: Subscription;
  bestDeal?: boolean;
  onSubscriptionClick: (subscription: Subscription) => void;
};

const PricingCard: React.FC<PricingCardProps> = ({
  subscription, //
  bestDeal,
  onSubscriptionClick,
}) => {
  const { t, i18n } = useTranslation('general', { keyPrefix: 'templates.PricingCard' });
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { subscription: userSubscription } = useAuthStore((state) => state);

  const planName: string = constantsT(`subscription.name.${subscription.name}`);
  const planBilling: string = constantsT(`subscription.billing.${subscription.billing}`);
  const planFeatures: string[] = constantsT(`subscription.features.${subscription.name}`, { returnObjects: true });

  const planTotal: number = i18n.language === 'en' ? subscription.totalUSD : subscription.totalUAH;
  const planPrice: number = i18n.language === 'en' ? subscription.priceUSD : subscription.priceUAH;

  return (
    <div className={styles.wrapper}>
      {bestDeal && <span className={styles.deal}>{t('best-deal')}</span>}

      <p className={styles.title}>
        {planName} {t('plan')}
      </p>

      <p className={styles.price}>
        {formatPrice(planPrice)}/{t('month')}
      </p>

      <div className={styles.row}>
        {subscription.billing === 'semianually' && (
          <span className={styles.planTotal}>
            {formatPrice(planTotal)} - 6 {t('months')}
          </span>
        )}
        <span className={styles.tag}>
          {t('billed')} {planBilling}
        </span>
      </div>

      {userSubscription?.name === subscription.name ? (
        <p className={styles.text}>{t('already-subscribed')}</p>
      ) : (
        <AppButton variant={bestDeal ? 'primary' : 'secondary'} block onClick={() => onSubscriptionClick(subscription)}>
          {t('button')}
        </AppButton>
      )}

      <p className={styles.subtitle}>{t('subtitle')}</p>
      <ul className={styles.features}>
        {planFeatures.map((item) => (
          <li key={item} className={styles.featuresItem}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingCard;
