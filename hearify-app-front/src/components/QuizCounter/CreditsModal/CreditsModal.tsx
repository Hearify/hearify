import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LockClosedIcon, CircleStackIcon } from '@heroicons/react/24/outline';

import AppModal from '@v2/components/AppModal/AppModal';
import AppButton from '@src/_v2/components/AppButton/AppButton';
import AppButtonLink from '@src/_v2/components/AppButtonLink/AppButtonLink';
import { useAuthStore } from '@src/store/auth';
import { PERMISSION_HIERARCHY } from '@v2/constants/permission';
import styles from './CreditsModal.module.scss';

import type { PermissionRole } from '@v2/types/permission';

type PermissionModalProps = {
  visible: boolean;
  onClose: () => void;
};

const CreditsModal: React.FC<PermissionModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation('general');
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { subscription } = useAuthStore((state) => state);

  const planText = useMemo<string>(() => {
    const plans = Object.keys(PERMISSION_HIERARCHY) as PermissionRole[];
    const currentPlanIndex = plans.indexOf(subscription?.name || 'free');

    if (currentPlanIndex === -1 || subscription?.name === 'max') {
      return '';
    }

    const availablePlans = plans.slice(currentPlanIndex + 1);
    return ` ${availablePlans.map((plan) => constantsT(`subscription.name.${plan}`)).join(', ')}.`;
  }, [t, subscription]);

  return (
    <AppModal visible={visible} width="600px" onClose={onClose}>
      <div className={styles.wrapper}>
        <CircleStackIcon className={styles.icon} />

        <h3 className={styles.title}>{t('credits')}</h3>
        <p className={styles.text}>{t('use-credits')}</p>
        <p className={styles.text}>
          {t('you-can-get-credits')}
          <Link className={styles.link} to="/pricing" onClick={onClose}>
            {planText}
          </Link>
        </p>

        <div className={styles.buttons}>
          <AppButton variant="secondary" onClick={onClose}>
            {t('skip_button')}
          </AppButton>
          <AppButtonLink href="/pricing" onClick={onClose}>
            <LockClosedIcon />

            <span>{t('upgrade_button')}</span>
          </AppButtonLink>
        </div>
      </div>
    </AppModal>
  );
};

export default CreditsModal;
