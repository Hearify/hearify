import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import StarsIcon from '@/assets/icons/stars.svg';
import logo from '@/assets/images/404-logo.png';
import styles from './PageNotFound.module.scss';

const PageNotFound: React.FC = () => {
  const { t } = useTranslation('common', { keyPrefix: 'templates.PageNotFound' });

  return (
    <div className={styles.wrapper}>
      <Image className={styles.logo} src={logo} alt="404 Logo" width={180} height={200} priority />

      <div className={styles.info}>
        <p className={styles.title}>{t('title')}</p>
        <p className={styles.description}>{t('description')}</p>
      </div>

      <div className={styles.buttons}>
        <AppButtonLink variant="secondary" size="lg" width="280px" href="/library">
          {t('secondary-button')}
        </AppButtonLink>
        <AppButtonLink variant="primary" size="lg" width="280px" href="https://app.hearify.org/login">
          <StarsIcon />
          {t('primary-button')}
        </AppButtonLink>
      </div>
    </div>
  );
};

export default PageNotFound;
