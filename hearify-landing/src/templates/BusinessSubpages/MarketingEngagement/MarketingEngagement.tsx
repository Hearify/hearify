import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  InboxArrowDownIcon,
  FireIcon,
  MapIcon,
  ChartBarIcon,
  CursorArrowRaysIcon,
  WindowIcon,
  CalendarIcon,
  MegaphoneIcon,
  GiftIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/solid';

import styles from './MarketingEngagement.module.scss';
import HeroSection from '@/sections/HeroSection/HeroSection';
import heroImage from '@/assets/images/marketing_hero_image.png';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import GroupImg from '@/assets/images/marketing_cta_image.png';

const MarketingEngagement: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('MarketingHero.title')}
        description={t('MarketingHero.description')}
        button={t('MarketingHero.button')}
        image={heroImage}
      />

      <BenefitsSection
        title={t('WhyMarketing.title')}
        benefitBlocks={t('WhyMarketing.benefits', { returnObjects: true })}
        icons={[InboxArrowDownIcon, FireIcon, MapIcon, ChartBarIcon]}
      />

      <InfoBoardSection
        title={t('MarketingInfoBoard.title')}
        description={t('MarketingInfoBoard.description')}
        text_list={t('MarketingInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('MarketingForWhom.title')}
        infoBlocks={t('MarketingForWhom.data', { returnObjects: true })}
        icons={[CursorArrowRaysIcon, CalendarIcon, MegaphoneIcon, WindowIcon, GiftIcon, ShoppingCartIcon]}
      />
      <div style={{ marginBottom: '100px' }} />

      <FAQSection title={t('MarketingFAQ.title')} faqBlocks={t('MarketingFAQ.blocks', { returnObjects: true })} />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('MarketingInfoBoard.alert-title')}
        text={t('MarketingInfoBoard.alert-text')}
        button={t('MarketingInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default MarketingEngagement;
