import React from 'react';
import { useTranslation } from 'next-i18next';

import GroupImg from '@/assets/images/blog-group.png';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import HomeHero from './HomeHero/HomeHero';
import HomeFeatured from './HomeFeatured/HomeFeatured';
import HomeCreateQuiz from './HomeCreateQuiz/HomeCreateQuiz';
import HomeReviews from './HomeReviews/HomeReviews';
import HomeAudience from './HomeAudience/HomeAudience';
import HomeWhyUs from './HomeWhyUs/HomeWhyUs';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import FAQSection from '@/sections/FAQSection/FAQSection';
import styles from './Home.module.scss';
import ClockIcon from '@/assets/icons/clock.svg';
import LanguageIcon from '@/assets/icons/language.svg';
import MenuIcon from '@/assets/icons/menu.svg';
import CustomizationIcon from '@/assets/icons/customize.svg';
import MediaIcon from '@/assets/icons/media.svg';
import AnalyticsIcon from '@/assets/icons/analytics.svg';
import InteractiveIcon from '@/assets/icons/interactive.svg';
import IntegrationIcon from '@/assets/icons/integration.svg';

// TODO: Fix the issue with the icons
const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.wrapper}>
      <HomeHero />
      <HomeFeatured />
      <HomeCreateQuiz />
      <BenefitsSection
        title={t('templates.HomeBenefits.title')}
        description={t('templates.HomeBenefits.description')}
        benefitBlocks={t('templates.HomeBenefits.benefits', { returnObjects: true })}
        icons={[
          ClockIcon,
          MenuIcon,
          LanguageIcon,
          CustomizationIcon,
          MediaIcon,
          AnalyticsIcon,
          InteractiveIcon,
          IntegrationIcon,
        ]}
      />

      <HomeReviews />
      <HomeAudience />
      <HomeWhyUs />
      {/* <JoinCommunityAlert /> */}
      <FAQSection
        title={t('templates.HomeFAQ.title')}
        faqBlocks={t('templates.HomeFAQ.blocks', { returnObjects: true })}
      />

      <div style={{ marginBottom: '25px' }} />
      <BoostAlert
        title={t('boost_your_knowledge')}
        text={t('try_out_ai_quiz')}
        button={t('try_for_free')}
        image={GroupImg}
        width={360}
        height={300}
      />
    </main>
  );
};

export default Home;
