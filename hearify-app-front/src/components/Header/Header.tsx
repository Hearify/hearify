import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowsPointingOutIcon, ArrowRightStartOnRectangleIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';

import AppButton from '@src/_v2/components/AppButton/AppButton';
import { useAuthStore } from '@src/store/auth';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import logo from '@src/assets/images/logo.svg';
import styles from './Header.module.scss';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit';

type HeaderProps = {
  brandKit?: BrandKitInterface | null;
  onExit?: () => void;
};

const Header: React.FC<HeaderProps> = ({ brandKit, onExit }) => {
  const { t } = useTranslation('general');
  const { isLoggedIn } = useAuthStore((state) => state);
  const navigate = useNavigate();
  const { isModalOpened, openModal, closeModal } = useConfirmationModal();
  const [isFullScreen, setIsFullScreen] = useState<boolean>(!document.fullscreenElement);

  const handleExitButton = (): void => {
    onExit && onExit();
    navigate('/home');
    document.exitFullscreen();
  };

  const handleFullScreen = (): void => {
    !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen();
    setIsFullScreen(!!document.fullscreenElement);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <img src={brandKit?.logoUrl ? brandKit?.logoUrl : logo} alt="Hearify Logo Image" />
      </div>

      {isLoggedIn && (
        <div className={styles.wrapper}>
          <AppButton variant="secondary" size="lg" onClick={openModal}>
            <ArrowRightStartOnRectangleIcon width={30} height={30} />
            <span className={styles.text}>{t('exit')}</span>
          </AppButton>
          <AppButton variant="secondary" size="lg" onClick={handleFullScreen}>
            {isFullScreen ? (
              <ArrowsPointingOutIcon width={30} height={30} />
            ) : (
              <ArrowsPointingInIcon width={30} height={30} />
            )}
          </AppButton>
        </div>
      )}

      {isModalOpened && (
        <ConfirmationModal
          message={t('sure_return_dashboard')}
          onConfirm={handleExitButton}
          onClose={closeModal}
          brandKit={brandKit}
        />
      )}
    </header>
  );
};

export default Header;
