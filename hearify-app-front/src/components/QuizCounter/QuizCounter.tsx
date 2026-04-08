import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon, LockOpenIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';

import Tooltip from '@src/components/Tooltip/Tooltip';
import CreditsModal from './CreditsModal/CreditsModal';
import { useAuthStore } from '@src/store/auth';
import styles from './QuizCounter.module.scss';

const QuizzesCounter: React.FC = () => {
  const { t } = useTranslation('general');
  const { t: constantsT } = useTranslation('general', { keyPrefix: 'constants' });

  const { user, subscription } = useAuthStore((state) => state);

  const [isOpened, setIsOpened] = useState<boolean>(false);

  const quizzesCount = useMemo<string | number>(() => {
    if (subscription?.name === 'max') {
      return '∞';
    }

    return user?.credits ?? 0;
  }, [user?.credits]);

  const planName: string = constantsT(`subscription.name.${subscription?.name || 'free'}`);
  const buttonText: string = subscription ? planName : t('upgrade');

  const isSubscribed = !!subscription && ['basic', 'premium', 'max'].includes(subscription.name);

  return (
    <>
      <CreditsModal visible={isOpened} onClose={() => setIsOpened(false)} />

      <Tooltip
        text={
          <>
            <span>{t('free_credits')}</span>
            <br />
            <span>{t('credits_updates')}</span>
            <br />
            <span>{t('credit_equals')}</span>
          </>
        }
      >
        <div className={styles.wrapper} onClick={() => setIsOpened(true)}>
          <button className={styles.button} type="button" disabled={!!subscription}>
            {isSubscribed ? <LockOpenIcon className={styles.icon} /> : <LockClosedIcon className={styles.icon} />}
            {buttonText}
          </button>
          <CircleStackIcon width={24} height={24} />
          <span className={cn(styles.count, quizzesCount === '∞' && styles.countLg)}>{quizzesCount}</span>
        </div>
      </Tooltip>
    </>
  );
};

export default QuizzesCounter;
