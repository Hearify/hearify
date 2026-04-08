import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

import Switch from '@src/components/Switch/Switch';
import usePermission from '@v2/hooks/usePermission';
import AppButton from '@v2/components/AppButton/AppButton';
import styles from './QuizConfigureTab.module.scss';

import type { Quiz } from '@v2/types/quiz';

export type QuizConfigureTabProps = {
  quiz: Quiz;
};

const QuizConfigureTab: React.FC<QuizConfigureTabProps> = ({ quiz }) => {
  const { t } = useTranslation('general');

  const { cannot, openPermissionModal } = usePermission();

  const [showAnswers, setShowAnswers] = useState<boolean>(quiz.settings.show_answers);
  const [onlyRegUsers, setOnlyRegUsers] = useState<boolean>(!quiz.settings.is_public);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(quiz.settings.show_leaderboard);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(quiz.settings.minutes ?? null);

  const isDirty = useMemo<boolean>(
    () =>
      showAnswers !== quiz.settings.show_answers ||
      onlyRegUsers !== !quiz.settings.is_public ||
      showLeaderboard !== quiz.settings.show_leaderboard ||
      timerMinutes !== quiz.settings.minutes,
    [showAnswers, onlyRegUsers, showLeaderboard, timerMinutes]
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const saveChanges = (): void => {
    const requestBody = {
      settings: {
        show_answers: showAnswers,
        is_public: !onlyRegUsers,
        show_leaderboard: showLeaderboard,
        minutes: timerMinutes ?? 0,
      },
    };

    const formData = new FormData();

    formData.append('request_data', JSON.stringify(requestBody));

    setIsLoading(true);

    axios.patch(`/api/quizzes/${quiz._id}`, formData).then(() => {
      setTimeout(() => {
        setIsLoading(false);
        window.location.reload();
      }, 1000);
    });
  };

  const handleTimerToggle = (): void => {
    if (cannot('enable-timer')) {
      openPermissionModal('enable-timer');
      return;
    }

    setTimerMinutes((prevState) => {
      if (prevState === null) return 0;
      return null;
    });
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimerMinutes(parseInt(e.target.value));
  };

  const handleShowAnswersToggle = () => {
    setShowAnswers((prevState) => !prevState);
  };

  const handleOnlyRegUsersToggle = () => {
    setOnlyRegUsers((prevState) => !prevState);
  };

  const handleShowLeaderboardToggle = () => {
    if (cannot('enable-leaderboard')) {
      openPermissionModal('enable-leaderboard');
      return;
    }

    setShowLeaderboard((prevState) => !prevState);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.block}>
        <div className={styles.body}>
          <h4 className={styles.subtitle}>{t('show_answers')}</h4>
          <Switch value={showAnswers} onClick={handleShowAnswersToggle} />
        </div>

        <p className={styles.text}>{t('show_answers_description')}</p>
      </div>

      <div className={styles.block}>
        <div className={styles.body}>
          <h4 className={styles.subtitle}>{t('only_reg_users')}</h4>
          <Switch value={onlyRegUsers} onClick={handleOnlyRegUsersToggle} />
        </div>

        <p className={styles.text}>{t('only_reg_users_description')}</p>
      </div>

      <div className={styles.block}>
        <div className={styles.body}>
          <h4 className={styles.subtitle}>{t('show_leaderboard')}</h4>
          <Switch value={showLeaderboard} onClick={handleShowLeaderboardToggle} />
        </div>

        <p className={styles.text}>{t('show_leaderboard_description')}</p>
      </div>

      <div className={styles.block}>
        <div className={styles.body}>
          <div className={styles.actions}>
            <h4 className={styles.subtitle}>{t('time_limit')}</h4>
            <input
              style={{ width: '90px', height: '40px' }}
              type="number"
              className={styles.input}
              value={timerMinutes ?? ''}
              onChange={handleTimerChange}
              disabled={timerMinutes === null}
            />
          </div>

          <Switch value={timerMinutes !== null} onClick={handleTimerToggle} />
        </div>

        <p className={styles.text}>{t('time_limit_description')}</p>
      </div>

      <div className={styles.footer}>
        <AppButton onClick={saveChanges} width="200px" disabled={!isDirty} loading={isLoading}>
          <CheckCircleIcon />
          {t('save_changes').toUpperCase()}
        </AppButton>
      </div>
    </div>
  );
};

export default QuizConfigureTab;
