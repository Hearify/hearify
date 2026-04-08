import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './CorporateTraining.module.scss';
import HeroSection from '@/sections/HeroSection/HeroSection';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import heroCorpImage from '@/assets/images/corporatetraining_hero_image.png';
import GroupImg from '@/assets/images/corporate_training_cta.png';
import ClockIcon from '@/assets/icons/clock.svg';
import SettingsIcon from '@/assets/icons/settings.svg';
import CoursesIcon from '@/assets/icons/courses.svg';
import AnalyticsIcon from '@/assets/icons/analytics.svg';
import TeacherIcon from '@/assets/business/teacher.svg';
import UserPlusIcon from '@/assets/business/user-plus.svg';
import UserIcon from '@/assets/business/user-group.svg';

const CorporateTraining: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('CorporateTrainingHero.title')}
        description={t('CorporateTrainingHero.description')}
        button={t('CorporateTrainingHero.button')}
        image={heroCorpImage}
      />

      <BenefitsSection
        title={t('WhyCorporateTraining.title')}
        benefitBlocks={t('WhyCorporateTraining.benefits', { returnObjects: true })}
        icons={[ClockIcon, AnalyticsIcon, SettingsIcon, CoursesIcon]}
      />

      <InfoBoardSection
        title={t('CorporateTrainingInfoBoard.title')}
        description={t('CorporateTrainingInfoBoard.description')}
        text_list={t('CorporateTrainingInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('CorporateTrainingForWhom.title')}
        infoBlocks={t('CorporateTrainingForWhom.data', { returnObjects: true })}
        icons={[TeacherIcon, UserPlusIcon, UserIcon]}
      />

      <div style={{ marginBottom: '100px' }} />
      <FAQSection
        title={t('CorporateTrainingFAQ.title')}
        faqBlocks={t('CorporateTrainingFAQ.blocks', { returnObjects: true })}
      />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('CorporateTrainingInfoBoard.alert-title')}
        text={t('CorporateTrainingInfoBoard.alert-text')}
        button={t('CorporateTrainingInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default CorporateTraining;
