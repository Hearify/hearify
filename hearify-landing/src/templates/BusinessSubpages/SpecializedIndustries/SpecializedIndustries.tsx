import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  ClipboardDocumentListIcon,
  MagnifyingGlassCircleIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  HeartIcon,
  BanknotesIcon,
  WrenchIcon,
  ComputerDesktopIcon,
  ScaleIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/solid';

import styles from './SpecializedIndustries.module.scss';
import HeroSection from '@/sections/HeroSection/HeroSection';
import heroImage from '@/assets/images/specialized_hero_image.png';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import GroupImg from '@/assets/images/industry_cta_image.png';

const SpecializedIndustries: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('IndustriesHero.title')}
        description={t('IndustriesHero.description')}
        button={t('IndustriesHero.button')}
        image={heroImage}
      />

      <BenefitsSection
        title={t('WhyIndustries.title')}
        benefitBlocks={t('WhyIndustries.benefits', { returnObjects: true })}
        icons={[ClipboardDocumentListIcon, MagnifyingGlassCircleIcon, ShieldCheckIcon, BookOpenIcon]}
      />

      <InfoBoardSection
        title={t('IndustriesInfoBoard.title')}
        description={t('IndustriesInfoBoard.description')}
        text_list={t('IndustriesInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('IndustriesForWhom.title')}
        infoBlocks={t('IndustriesForWhom.data', { returnObjects: true })}
        icons={[HeartIcon, BanknotesIcon, WrenchIcon, ComputerDesktopIcon, ScaleIcon, PuzzlePieceIcon]}
      />

      <div style={{ marginBottom: '100px' }} />
      <FAQSection title={t('IndustriesFAQ.title')} faqBlocks={t('IndustriesFAQ.blocks', { returnObjects: true })} />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('IndustriesInfoBoard.alert-title')}
        text={t('IndustriesInfoBoard.alert-text')}
        button={t('IndustriesInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default SpecializedIndustries;
