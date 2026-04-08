import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import AppSelect from '@v2/components/AppSelect/AppSelect';
import AppButtonLink from '@v2/components/AppButtonLink/AppButtonLink';
import logoImg from '@src/assets/images/logo.svg';
import { languageOptions } from '@src/components/DashboardHeader/DashboardHeader';
import styles from './UnauthorizedLayout.module.scss';
import AppMenuDrawer from '@v2/components/AppMenuDrawer/AppMenuDrawer';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';

export type UnauthorizedLayoutProps = {
  children: React.ReactNode;
};

const UnauthorizedLayout: React.FC<UnauthorizedLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation('general', { keyPrefix: 'templates.UnauthorizedLayout' });
  const { isDeviceLarge } = useDeviceDetect('sm');

  const [language, setLanguage] = useState<string>(i18n.language);

  const handleChangeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <img src={logoImg} alt="Hearify logo" className={styles.logo} />

        {isDeviceLarge ? (
          <div className={styles.actions}>
            <AppButtonLink href="/register" variant="gradient">
              {t('button')}
            </AppButtonLink>
            <AppSelect options={languageOptions} onSelect={handleChangeLanguage} value={language} />
          </div>
        ) : (
          <AppMenuDrawer>
            <Link to="/">
              <img src={logoImg} alt="Hearify logo" className={styles.drawerLogo} />
            </Link>

            <div className={styles.actions}>
              <AppButtonLink href="/register" variant="gradient">{t('button')}</AppButtonLink>
              <AppSelect options={languageOptions} onSelect={handleChangeLanguage} value={language} />
            </div>
          </AppMenuDrawer>
        )}
      </header>

      <div className={styles.container}>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default UnauthorizedLayout;
