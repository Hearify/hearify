import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import PricingCard from './PricingCard/PricingCard';
import PricingPaymentModal from './PricingPaymentModal/PricingPaymentModal';
import PricingCustomAlert from './PricingCustomAlert/PricingCustomAlert';
import PricingAlreadySubscribedAlert from './PricingAlreadySubscribedAlert/PricingAlreadySubscribedAlert';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';
import { useAuthStore } from '@src/store/auth';
import { SUBSCRIPTIONS } from '@v2/constants/subscription';
import styles from './Pricing.module.scss';

import type { Subscription } from '@v2/types/subscription';

const Pricing: React.FC = () => {
  const { t, i18n } = useTranslation('general', { keyPrefix: 'templates.Pricing' });
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { isDeviceLarge } = useDeviceDetect('lg');

  const { subscription: userSubscription } = useAuthStore((state) => state);

  const [activeTab, setActiveTab] = useState<number>(1);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [isModalOpened, setIsModalOpened] = useState<boolean>(false);

  const handleSubscriptionClick = (subscription: Subscription): void => {
    const planTotal: number = i18n.language === 'en' ? subscription.totalUSD : subscription.totalUAH;

    TrackingAPI.trackEvent('begin_checkout', {
      ecommerce: {
        items: [
          {
            item_name: subscription.name,
            item_id: subscription.priceId,
            item_variant: subscription.billing,
            price: planTotal,
            quantity: 1,
          },
        ],
      },
    });

    setCurrentSubscription(subscription);
    setIsModalOpened(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpened(false);
  };

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>{t('title')}</h1>

      {userSubscription && <PricingAlreadySubscribedAlert />}

      {isDeviceLarge ? (
        <div className={styles.list}>
          {SUBSCRIPTIONS.map((item) => (
            <PricingCard
              key={item.id}
              subscription={item}
              bestDeal={item.name === 'premium'}
              onSubscriptionClick={handleSubscriptionClick}
            />
          ))}

          <PricingCustomAlert />
        </div>
      ) : (
        <>
          <nav className={cn(styles.tabs)}>
            <button
              type="button"
              className={cn(styles.tabsItem, activeTab === 0 && styles.tabsItemActive)}
              onClick={() => setActiveTab(0)}
            >
              {constantsT(`subscription.name.basic`)}
            </button>
            <button
              type="button"
              className={cn(styles.tabsItem, activeTab === 1 && styles.tabsItemActive)}
              onClick={() => setActiveTab(1)}
            >
              {constantsT(`subscription.name.premium`)}
            </button>
            <button
              type="button"
              className={cn(styles.tabsItem, activeTab === 2 && styles.tabsItemActive)}
              onClick={() => setActiveTab(2)}
            >
              {constantsT(`subscription.name.max`)}
            </button>
            <button
              type="button"
              className={cn(styles.tabsItem, activeTab === 3 && styles.tabsItemActive)}
              onClick={() => setActiveTab(3)}
            >
              {constantsT(`subscription.name.custom`)}
            </button>
          </nav>

          <div className={styles.content}>
            {activeTab !== 3 ? (
              <PricingCard
                subscription={SUBSCRIPTIONS[activeTab]}
                bestDeal={SUBSCRIPTIONS[activeTab].name === 'premium'}
                onSubscriptionClick={handleSubscriptionClick}
              />
            ) : (
              <PricingCustomAlert />
            )}
          </div>
        </>
      )}

      {currentSubscription && (
        <PricingPaymentModal visible={isModalOpened} subscription={currentSubscription} onClose={handleCloseModal} />
      )}
    </main>
  );
};

export default Pricing;
