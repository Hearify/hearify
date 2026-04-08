import React from 'react';
import { useTranslation } from 'react-i18next';

import AppModal from '@v2/components/AppModal/AppModal';
import AppButton from '@v2/components/AppButton/AppButton';
import styles from './ConfirmationModal.module.scss';

import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';

export type AppConfirmationModalProps = {
  visible: boolean;
  brandKit?: FormattedBrandKit | null;
  message: string;
  buttonText?: string;
  loading?: boolean;
  showCancel?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmationModal: React.FC<AppConfirmationModalProps> = ({
  visible,
  message,
  buttonText,
  brandKit,
  loading,
  showCancel = true,
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation('general', { keyPrefix: 'containers.ConfirmationModal' });

  return (
    <AppModal visible={visible} width="500px" onClose={onClose}>
      <div className={styles.wrapper}>
        <h3 className={styles.title} style={brandKit?.textStyle}>
          {message}
        </h3>

        <div className={styles.actions}>
          {showCancel && (
            <AppButton size="lg" variant="secondary" block onClick={onClose} style={brandKit?.buttonStyle}>
              {t('cancel')}
            </AppButton>
          )}

          <AppButton size="lg" loading={loading} block style={brandKit?.buttonStyle} onClick={onConfirm}>
            {buttonText ?? t('yes')}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};

export default ConfirmationModal;
