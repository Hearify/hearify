import React from 'react';
import { useTranslation } from 'next-i18next';
import {
  WrenchIcon,
  BuildingLibraryIcon,
  UsersIcon,
  MegaphoneIcon,
  ClipboardDocumentCheckIcon,
  HandRaisedIcon,
  ChatBubbleBottomCenterTextIcon,
  ShoppingBagIcon,
  CursorArrowRaysIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid';

import styles from './SMBSolutions.module.scss';
import HeroSection from '@/sections/HeroSection/HeroSection';
import heroImage from '@/assets/images/smb_hero_image.png';
import FAQSection from '@/sections/FAQSection/FAQSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import GroupImg from '@/assets/images/smb_cta_image.png';

const SMBSolutions: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  return (
    <main className={styles.wrapper}>
      <HeroSection
        title={t('SMBHero.title')}
        description={t('SMBHero.description')}
        button={t('SMBHero.button')}
        image={heroImage}
      />

      <BenefitsSection
        title={t('WhySMB.title')}
        benefitBlocks={t('WhySMB.benefits', { returnObjects: true })}
        icons={[WrenchIcon, BuildingLibraryIcon, UsersIcon, MegaphoneIcon]}
      />

      <InfoBoardSection
        title={t('SMBInfoBoard.title')}
        description={t('SMBInfoBoard.description')}
        text_list={t('SMBInfoBoard.text_list', { returnObjects: true })}
      />

      <ForWhomSection
        title={t('SMBForWhom.title')}
        infoBlocks={t('SMBForWhom.data', { returnObjects: true })}
        icons={[
          ClipboardDocumentCheckIcon,
          HandRaisedIcon,
          ChatBubbleBottomCenterTextIcon,
          ShoppingBagIcon,
          CursorArrowRaysIcon,
          RocketLaunchIcon,
        ]}
      />
      <div style={{ marginBottom: '100px' }} />

      <FAQSection title={t('SMBFAQ.title')} faqBlocks={t('SMBFAQ.blocks', { returnObjects: true })} />

      <div style={{ marginBottom: '100px' }} />
      <BoostAlert
        title={t('SMBInfoBoard.alert-title')}
        text={t('SMBInfoBoard.alert-text')}
        button={t('SMBInfoBoard.alert-button')}
        image={GroupImg}
        width={360}
        height={260}
      />
    </main>
  );
};

export default SMBSolutions;
