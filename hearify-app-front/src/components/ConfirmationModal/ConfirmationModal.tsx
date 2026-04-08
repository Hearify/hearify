import { useTranslation } from 'react-i18next';

import styles from './ConfirmationModal.module.scss';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit';
import type { FC } from 'react';

interface ConfirmationModalProps {
  message: string;
  buttonMessage?: string;
  onConfirm: () => void;
  onClose?: () => void;
  brandKit?: BrandKitInterface;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({ message, buttonMessage, onConfirm, onClose, brandKit }) => {
  const { t } = useTranslation('general');

  return (
    <div className={styles.confirmModalOverlay}>
      <div className={styles.confirmModal}>
        <p
          className={styles.confirmModalMessage}
          style={{ fontFamily: brandKit?.font?.family && brandKit.font.family }}
        >
          {message}
        </p>
        <div className={styles.confirmModalButtons}>
          <button
            className={styles.yesButton}
            onClick={onConfirm}
            style={{
              backgroundColor: brandKit?.buttonFill,
              color: brandKit?.buttonText,
              fontFamily: brandKit?.font?.family && brandKit.font.family,
            }}
          >
            {buttonMessage || t('yes')}
          </button>
          {onClose && (
            <button
              className={styles.cancelButton}
              onClick={onClose}
              style={{ borderColor: brandKit?.buttonFill, fontFamily: brandKit?.font?.family && brandKit.font.family }}
            >
              {t('cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
