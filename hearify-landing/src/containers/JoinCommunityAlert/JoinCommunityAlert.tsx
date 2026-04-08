import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import joinCommunityImage from '@/assets/images/join-community.png';
import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import styles from './JoinCommunityAlert.module.scss';

const JoinCommunityAlert: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'containers.JoinCommunityAlert' });

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h3 className={styles.title}>{t('title')}</h3>
        <p className={styles.text}>{t('description')}</p>
        <AppButtonLink
          className={styles.button}
          href="https://www.facebook.com/groups/1165181404773630/?ref=share"
          width="280px"
          size="lg"
        >
          {t('button')}
        </AppButtonLink>
      </div>

      <Image src={joinCommunityImage} alt="Community of people" width={350} height={300} className={styles.image} />
    </div>
  );
};

export default JoinCommunityAlert;
