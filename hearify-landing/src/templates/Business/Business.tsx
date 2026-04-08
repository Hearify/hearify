import React from 'react';
import { useTranslation } from 'next-i18next';

import styles from './Business.module.scss';
import BusinessHero from './BusinessHero/BusinessHero';
import InfoBoardSection from '@/sections/InfoBoardSection/InfoBoardSection';
import ForWhomSection from '@/sections/ForWhomSection/ForWhomSection';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import GroupImg from '@/assets/images/business-group.png';
import TeacherIcon from '@/assets/business/teacher.svg';
import SchoolIcon from '@/assets/business/school.svg';
import BoardIcon from '@/assets/business/board.svg';
import BriefcaseIcon from '@/assets/business/briefcase.svg';
import UserGroupIcon from '@/assets/business/user-group.svg';
import ScienceIcon from '@/assets/business/science.svg';

import type { FC, SVGProps } from 'react';

const SECTION_ICONS = [TeacherIcon, SchoolIcon, BoardIcon, BriefcaseIcon, UserGroupIcon, ScienceIcon] as FC<
  SVGProps<SVGSVGElement>
>[];

const links = [
  '/business/ai-corporate-training-for-employees',
  '/business/ai-test-generator-for-teachers',
  '/business/lead-generation-quizzes',
  '/business/ai-quizzes-for-small-businesses',
  '/business/partner-program-white-label-quizzes-for-agencies',
  '/business/ai-quizzes-for-specialized-industries',
];

type DataBlock = {
  title: string;
  description: string;
  button: string;
  text_list: string[];
};

const Business: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  const sections = t('BusinessInfoBoard.data', { returnObjects: true });

  return (
    <main className={styles.wrapper}>
      <BusinessHero />

      <ForWhomSection
        title={t('BusinessForWhom.title')}
        infoBlocks={t('BusinessForWhom.data', { returnObjects: true })}
        icons={SECTION_ICONS}
        links={links}
      />

      {(sections as DataBlock[]).map((section, index) => (
        <InfoBoardSection
          key={section.title}
          title={section.title}
          description={section.description}
          text_list={section.text_list}
          button={section.button}
          showButtonIcon={index === 0}
          wrapperStyle={index % 2 === 0 ? 'wrapper1' : 'wrapper2'}
          backImg={SECTION_ICONS[index]}
        />
      ))}

      <BoostAlert
        title={t('BusinessInfoBoard.alert-title')}
        text={t('BusinessInfoBoard.alert-text')}
        button={t('BusinessInfoBoard.alert-button')}
        image={GroupImg}
        width={380}
        height={250}
      />
    </main>
  );
};

export default Business;
