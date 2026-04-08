import React from 'react';
import { useTranslation } from 'next-i18next';
import { BoltIcon, AdjustmentsHorizontalIcon, LightBulbIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

import GroupImg from '@/assets/images/about-us/group-about-us.png';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BenefitsSection from '@/sections/BenefitsSection/BenefitsSection';
import AboutUsValues from './AboutUsValues/AboutUsValues';
import styles from './AboutUs.module.scss';
import AboutUsTeam from './AboutUsTeam/AboutUsTeam';

type DataType = {
  title: string;
  description: string;
};

const AboutUs: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates' });

  const data = t('AboutUs.data', { returnObjects: true });

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>{t('AboutUs.title')}</h1>
      <ul className={styles.list}>
        {(data as DataType[]).map(item => (
          <li key={item.title} className={styles.item}>
            <h2 className={styles.itemTitle}>{item.title}</h2>
            <p className={styles.description}>{item.description}</p>
          </li>
        ))}
      </ul>
      <BenefitsSection
        title={t('AboutUsCommitted.title')}
        benefitBlocks={t('AboutUsCommitted.data', { returnObjects: true })}
        icons={[BoltIcon, AdjustmentsHorizontalIcon, LightBulbIcon, GlobeAltIcon]}
      />

      <div style={{ marginBottom: '100px' }} />
      <AboutUsTeam />
      <AboutUsValues />
      <div className={styles.box}>
        <h2 className={styles.boxTitle}>{t('AboutUs.bottom-title')}</h2>
        <p className={styles.boxDescription}>{t('AboutUs.description')}</p>
      </div>
      <BoostAlert
        title={t('AboutUs.alert-title')}
        text={t('AboutUs.alert-text')}
        button={t('AboutUs.alert-button')}
        image={GroupImg}
        width={360}
        height={280}
      />
    </main>
  );
};

export default AboutUs;
