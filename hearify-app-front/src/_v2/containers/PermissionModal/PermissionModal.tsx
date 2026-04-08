import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LockClosedIcon } from '@heroicons/react/24/outline';

import AppModal from '@v2/components/AppModal/AppModal';
import AppButton from '@src/_v2/components/AppButton/AppButton';
import AppButtonLink from '@src/_v2/components/AppButtonLink/AppButtonLink';
import styles from './PermissionModal.module.scss';

import type { Action } from '@v2/types/action';

type PermissionModalProps = {
  visible: boolean;
  action: Action;
  onSkip: () => void;
  onClose: () => void;
};

const PermissionModal: React.FC<PermissionModalProps> = ({
  visible, //
  action,
  onClose,
  onSkip = () => {},
}) => {
  const { t } = useTranslation('general', { keyPrefix: 'containers.PermissionModal' });

  const title: string = t(`title.${action}`);
  const message: string = t(`message.${action}`);

  const handleSkip = (): void => {
    onClose();
    onSkip();
  };

  return (
    <AppModal visible={visible} width="600px" onClose={handleSkip}>
      <div className={styles.wrapper}>
        <LockClosedIcon className={styles.icon} />

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{message}</p>

        <p className={styles.description}>
          {t('description')}{' '}
          <Link className={styles.link} to="/pricing" onClick={onClose}>
            {t('link')}
          </Link>
        </p>

        <div className={styles.buttons}>
          <AppButton variant="secondary" size="md" onClick={handleSkip}>
            {t('skip')}
          </AppButton>
          <AppButtonLink href="/pricing" size="md" onClick={onClose}>
            <LockClosedIcon />
            {t('upgrade')}
          </AppButtonLink>
        </div>
      </div>
    </AppModal>
  );
};

export default PermissionModal;
