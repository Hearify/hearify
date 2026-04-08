import React from 'react';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';
import { Link, useNavigate } from 'react-router-dom';

import AppIcon from '@v2/components/AppIcon/AppIcon';
import logoImg from '@src/assets/images/logo.svg';
import TimelineIcon from '@v2/assets/icons/free-trial-timeline.svg';
import ReviewerImage from '@v2/assets/images/reviewer.png';
import styles from './PricingPaymentModal.module.scss';
import PricingPaddleForm from '../PricingPaddleForm/PricingPaddleForm';
import formatPrice from '@v2/utils/formatPrice';
import { errorToast } from '@src/toasts/toasts';
import PaymentAPI from '@v2/api/PaymentAPI/PaymentAPI';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';

import type { Subscription } from '@v2/types/subscription';

export type PricingPaymentModalProps = {
  visible: boolean;
  subscription: Subscription;
  onClose: () => void;
};

// TODO(Sasha): Use shared AppModal component once it is ready
const PricingPaymentModal: React.FC<PricingPaymentModalProps> = ({
  visible, //
  subscription,
  onClose,
}) => {
  const navigate = useNavigate();

  const { t, i18n } = useTranslation('general', { keyPrefix: 'templates.PricingPaymentModal' });
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const planName: string = constantsT(`subscription.name.${subscription.name}`);
  const planFeatures: string[] = constantsT(`subscription.features.${subscription.name}`, { returnObjects: true });

  const planTotal: number = i18n.language === 'en' ? subscription.totalUSD : subscription.totalUAH;

  const paymentDate = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString(i18n.language, {
    month: 'long',
    day: 'numeric',
  });

  const handlePaymentError = (): void => {
    errorToast(t('error'));
  };

  // TODO(Sasha): on the second step of payment form height increases. fix this

  const handlePaymentSuccess = (orderId: string): void => {
    PaymentAPI.connectSubscription(orderId)
      .then(() => {
        TrackingAPI.trackEvent('purchase', {
          ecommerce: {
            currency: i18n.language === 'en' ? 'USD' : 'UAH',
            value: planTotal,
            transaction_id: orderId,
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

        navigate(`/payment-success/${subscription.name}`);

        // TODO(Sasha): Fix this hack, update through Authstore instead
        window.location.reload();
      })
      .catch(() => errorToast(t('error')));
  };

  return (
    <CSSTransition in={visible} timeout={300} unmountOnExit classNames={styles.backdrop}>
      <div className={styles.backdrop} onPointerDown={() => onClose()}>
        <div className={styles.wrapper} onPointerDown={(e) => e.stopPropagation()}>
          <div className={styles.container}>
            <h2 className={styles.title}>
              {planName} {t('plan')} - {formatPrice(planTotal)}
            </h2>

            <div className={styles.body}>
              <div className={styles.advantages}>
                <p className={styles.advantagesTitle}>{t('advantages-title')}</p>

                <ul className={styles.advantagesList}>
                  {planFeatures.map((item) => (
                    <li key={item} className={styles.advantagesItem}>
                      <AppIcon name="check-circle" />
                      <span className={styles.advantagesText}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.timeline}>
                <p className={styles.timelineTitle}>{t('timeline')}</p>

                <div className={styles.timelineBody}>
                  <TimelineIcon />

                  <div className={styles.timelineContent}>
                    <div className={styles.timelineBlock}>
                      <p className={styles.timelineSubtitle}>{t('timeline-subtitle')}</p>
                      <p className={styles.timelineText}>{t('timeline-text-1')}</p>
                    </div>

                    <div className={styles.timelineBlock}>
                      <p className={styles.timelineSubtitle}>{paymentDate}</p>
                      <p className={styles.timelineText}>{t('timeline-text-2')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.review}>
              <p className={styles.reviewTitle}>{t('review')}</p>

              <div className={styles.reviewContainer}>
                <div className={styles.reviewHeader}>
                  <img src={ReviewerImage} alt="Yuliia Gorbatenko" width={48} height={48} />

                  <div className={styles.reviewContent}>
                    <p className={styles.reviewName}>{t('review-name')}</p>
                    <p className={styles.reviewPosition}>{t('review-position')}</p>
                  </div>
                </div>

                <p className={styles.reviewBody}>{t('review-text')}</p>
              </div>
            </div>
          </div>

          <div className={styles.form}>
            <Link to="/" className={styles.logo}>
              <img src={logoImg} alt="Hearify logo" />
            </Link>

            <div className={styles.formBody}>
              <PricingPaddleForm
                priceId={subscription.priceId}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </div>

            <div className={styles.footer}>
              <div className={styles.footerBlock}>
                <span className={styles.footerText}>{t('footer-subtitle')}</span>
                <span className={styles.footerPrice}>{formatPrice(1)}</span>
              </div>

              <div className={styles.footerBlock}>
                <span className={styles.footerText}>
                  {t('due')} {paymentDate}
                </span>
                <span className={styles.footerPrice}>{formatPrice(planTotal)}</span>
              </div>
            </div>
          </div>

          <AppIcon name="close" className={styles.close} onClick={onClose} />
        </div>
      </div>
    </CSSTransition>
  );
};

export default PricingPaymentModal;
