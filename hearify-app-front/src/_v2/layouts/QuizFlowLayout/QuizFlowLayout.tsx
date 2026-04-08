import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRightStartOnRectangleIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';

import AppSelect from '@v2/components/AppSelect/AppSelect';
import logoImg from '@src/assets/images/logo.svg';
import { languageOptions } from '@src/components/DashboardHeader/DashboardHeader';
import AppMenuDrawer from '@v2/components/AppMenuDrawer/AppMenuDrawer';
import useDeviceDetect from '@v2/hooks/useDeviceDetect';
import styles from './QuizFlowLayout.module.scss';
import { useAuthStore } from '@src/store/auth';
import AppButton from '@v2/components/AppButton/AppButton';
import ConfirmationModal from '@v2/containers/ConfirmationModal/ConfirmationModal';

export type QuizFlowLayoutProps = {
  children: React.ReactNode;
};

const QuizFlowLayout: React.FC<QuizFlowLayoutProps> = ({ children }) => {
  const { t, i18n } = useTranslation('general', { keyPrefix: 'layouts.QuizFlowLayout' });
  const navigate = useNavigate();
  const { isDeviceLarge } = useDeviceDetect('sm');

  const { isLoggedIn } = useAuthStore((state) => state);

  const [language, setLanguage] = useState<string>(i18n.language);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [isExitModalOpened, setIsExitModalOpened] = useState<boolean>(false);

  const handleChangeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleExit = (): void => {
    navigate('/home');
    document.exitFullscreen();
  };

  const handleFullScreen = (): void => {
    if (!isFullScreen) document.documentElement.requestFullscreen();
    else document.exitFullscreen();

    setIsFullScreen((prevState) => !prevState);
  };

  useEffect(() => {
    if (language !== i18n.language) setLanguage(i18n.language);
  }, [i18n.language]);

  return (
    <div className={styles.wrapper}>
      <ConfirmationModal
        visible={isExitModalOpened}
        message={t('confirm-exit')}
        onConfirm={handleExit}
        onClose={() => setIsExitModalOpened(false)}
      />

      <header className={styles.header}>
        <img src={logoImg} alt="Hearify logo" className={styles.logo} />

        {isDeviceLarge ? (
          <div className={styles.actions}>
            <AppSelect size="lg" options={languageOptions} onSelect={handleChangeLanguage} value={language} />

            <AppButton variant="secondary" size="lg" onClick={handleFullScreen}>
              {isFullScreen ? (
                <ArrowsPointingInIcon width={30} height={30} />
              ) : (
                <ArrowsPointingOutIcon width={30} height={30} />
              )}
            </AppButton>

            {isLoggedIn && (
              <AppButton variant="secondary" size="lg" onClick={() => setIsExitModalOpened(true)}>
                <ArrowRightStartOnRectangleIcon width={30} height={30} />
                {t('button')}
              </AppButton>
            )}
          </div>
        ) : (
          <AppMenuDrawer>
            <img src={logoImg} alt="Hearify logo" className={styles.drawerLogo} />

            <div className={styles.actions}>
              <AppSelect size="lg" options={languageOptions} onSelect={handleChangeLanguage} value={language} />

              <AppButton variant="secondary" size="lg" onClick={() => setIsExitModalOpened(true)}>
                <ArrowRightStartOnRectangleIcon width={30} height={30} />
                {t('button')}
              </AppButton>
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

export default QuizFlowLayout;
