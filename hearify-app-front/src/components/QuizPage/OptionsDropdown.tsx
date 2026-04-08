import React, { forwardRef, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Switch as MuiSwitch } from '@mui/material';

import useModal from '@src/hooks/useModal.tsx';
import useOutsideMouseDown from '@src/hooks/useOutsideMouseDown.ts';
import styles from '@src/components/QuizPage/OptionsDropdown.module.scss';
import { errorToast } from '@src/toasts/toasts.tsx';

export type OptionsDropdownType = {
  style: {};
  buttonRef: any;
  showAnswers: boolean;
  onlyRegUsers: boolean;
  showLeaderboard: boolean;
  isTimer: boolean;
  minutes?: number;
  toggleOpened: () => void;
};

const OptionsDropdown = forwardRef<any, any>(
  ({ style, buttonRef, showAnswers, onlyRegUsers, showLeaderboard, isTimer, minutes }: OptionsDropdownType, ref) => {
    const { t } = useTranslation('general');
    const modal = useModal(ref);

    const containerRef = useRef<any>();

    useOutsideMouseDown(containerRef, ({ target }: any) => {
      buttonRef && !buttonRef.current.contains(target) && modal.setOpened(false);
    });

    return (
      modal.opened && (
        <div ref={containerRef} className={styles.container} style={style}>
          <div className={styles.quiz_option}>
            <Checkbox checked={showAnswers} onClick={() => errorToast(t('edit_demo'))} />
            <label>{t('show_answers')}</label>
          </div>

          <div className={styles.quiz_option}>
            <Checkbox checked={onlyRegUsers} onClick={() => errorToast(t('edit_demo'))} />
            <label>{t('only_reg_users')}</label>
          </div>

          <div className={styles.quiz_option}>
            <Checkbox checked={showLeaderboard} onClick={() => errorToast(t('edit_demo'))} />
            <label>{t('show_leaderboard')}</label>
          </div>

          <div className={styles.timer}>
            <label>{t('time_limit')}</label>
            {isTimer && <input type="number" value={minutes} disabled />}
          </div>
        </div>
      )
    );
  }
);

export default OptionsDropdown;
