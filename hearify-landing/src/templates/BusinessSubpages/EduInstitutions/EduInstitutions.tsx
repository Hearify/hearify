import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  DocumentPlusIcon,
  AcademicCapIcon,
  BoltIcon,
  SparklesIcon,
  BookOpenIcon,
  ComputerDesktopIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';

import styles from './EduInstitutions.module.scss';
import heroEduImage from '@/assets/images/edu_institutions_hero_image.png';
import HeroSection from '@/sections/HeroSection/HeroSection';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import GroupImg from '@/assets/images/edu_cta_image.png';

const EduInstitutions: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('EduInstitutionsHero.title')}
        description={t('EduInstitutionsHero.description')}
        button={t('EduInstitutionsHero.button')}
        image={heroEduImage}
      />

      <BenefitsSection
        title={t('WhyEduInstitutions.title')}
        benefitBlocks={t('WhyEduInstitutions.benefits', { returnObjects: true })}
        icons={[DocumentPlusIcon, AcademicCapIcon, BoltIcon, SparklesIcon]}
      />

      <InfoBoardSection
        title={t('EduInstitutionsInfoBoard.title')}
        description={t('EduInstitutionsInfoBoard.description')}
        text_list={t('EduInstitutionsInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('EduInstitutionsForWhom.title')}
        infoBlocks={t('EduInstitutionsForWhom.data', { returnObjects: true })}
        icons={[BookOpenIcon, ComputerDesktopIcon, UserCircleIcon]}
      />

      <div style={{ marginBottom: '100px' }} />
      <FAQSection
        title={t('EduInstitutionsFAQ.title')}
        faqBlocks={t('EduInstitutionsFAQ.blocks', { returnObjects: true })}
      />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('EduInstitutionsInfoBoard.alert-title')}
        text={t('EduInstitutionsInfoBoard.alert-text')}
        button={t('EduInstitutionsInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default EduInstitutions;
