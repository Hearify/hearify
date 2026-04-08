import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  PaintBrushIcon,
  ArrowsRightLeftIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  EnvelopeOpenIcon,
  BookOpenIcon,
  UsersIcon,
  WindowIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';

import styles from './Agencies.module.scss';
import HeroSection from '@/sections/HeroSection/HeroSection';
import heroImage from '@/assets/images/agencies_hero_image.png';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import GroupImg from '@/assets/images/agencies_cta_image.png';

const Agencies: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('PartnerProgramsHero.title')}
        description={t('PartnerProgramsHero.description')}
        button={t('PartnerProgramsHero.button')}
        image={heroImage}
      />

      <BenefitsSection
        title={t('WhyPartnerPrograms.title')}
        benefitBlocks={t('WhyPartnerPrograms.benefits', { returnObjects: true })}
        icons={[PaintBrushIcon, ArrowsRightLeftIcon, ChartPieIcon, Cog6ToothIcon]}
      />

      <InfoBoardSection
        title={t('PartnerProgramsInfoBoard.title')}
        description={t('PartnerProgramsInfoBoard.description')}
        text_list={t('PartnerProgramsInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('PartnerProgramsForWhom.title')}
        infoBlocks={t('PartnerProgramsForWhom.data', { returnObjects: true })}
        icons={[EnvelopeOpenIcon, BookOpenIcon, UsersIcon, WindowIcon, AcademicCapIcon, QuestionMarkCircleIcon]}
      />

      <div style={{ marginBottom: '100px' }} />
      <FAQSection
        title={t('PartnerProgramsFAQ.title')}
        faqBlocks={t('PartnerProgramsFAQ.blocks', { returnObjects: true })}
      />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('PartnerProgramsInfoBoard.alert-title')}
        text={t('PartnerProgramsInfoBoard.alert-text')}
        button={t('PartnerProgramsInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default Agencies;
