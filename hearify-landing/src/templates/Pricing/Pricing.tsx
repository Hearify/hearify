import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './Pricing.module.scss';
import HomeReviews from '@/templates/Home/HomeReviews/HomeReviews';
import FAQSection from '@/sections/FAQSection/FAQSection';
import GroupImg from '@/assets/images/blog-group.png';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import DesktopPlans from '@/templates/Pricing/Plans/DesktopPlans';
import useDeviceDetect from '@/hooks/useDeviceDetect';
import TabletPlans from '@/templates/Pricing/Plans/TabletPlans';
import Comparison from '@/templates/Pricing/ComparisonSection/Comparison';

const Pricing: React.FC = () => {
  const { t } = useTranslation('common');

  const { isDeviceLarge } = useDeviceDetect('md');

  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{t('templates.Pricing.title')}</p>

      {isDeviceLarge ? <DesktopPlans /> : <TabletPlans />}

      <span id="pricing-table" />
      <Comparison />

      <HomeReviews />

      <FAQSection
        title={t('templates.PricingFAQ.title')}
        faqBlocks={t('templates.PricingFAQ.blocks', { returnObjects: true })}
      />

      <BoostAlert
        title={t('boost_your_knowledge')}
        text={t('try_out_ai_quiz')}
        button={t('try_for_free')}
        image={GroupImg}
        width={360}
        height={300}
      />
    </div>
  );
};

export default Pricing;
