import React, { useMemo, useState } from 'react';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

import QuizFlowAPI from '@v2/api/QuizFlowAPI/QuizFlowAPI';
import AppInput from '@v2/components/AppInput/AppInput';
import AppButton from '@v2/components/AppButton/AppButton';
import { formatMinutes } from '@src/util/formatTime';
import { useAuthStore } from '@src/store/auth';
import { errorToast } from '@src/toasts/toasts';
import styles from './QuizFlowWaiting.module.scss';

import type { Quiz } from '@v2/types/quiz';
import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';

export type QuizFlowWaitingProps = {
  quiz: Quiz;
  classCode: string;
  brandKit: FormattedBrandKit | null;
  onStartQuiz: (processId: string) => void;
};

const QuizFlowWaiting: React.FC<QuizFlowWaitingProps> = ({
  quiz, //
  classCode,
  brandKit,
  onStartQuiz,
}) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizFlowWaiting' });

  const { user } = useAuthStore((state) => state);

  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isTimer = useMemo<boolean>(() => {
    if (!quiz?.settings.minutes) return false;

    return quiz.settings.minutes > 0;
  }, [quiz]);

  const imageSrc = useMemo<string>(() => {
    if (!quiz.picture_id) return '';

    return `${import.meta.env.VITE_BACKEND_URL}/api/quizzes/${quiz.picture_id}/picture`;
  }, [quiz.picture_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCurrentUsername(e.target.value);
  };

  const handleStartQuiz = (): void => {
    if (currentUsername === '' && !user) {
      errorToast(t('empty-error'));
      return;
    }

    setIsLoading(true);
    QuizFlowAPI.startQuiz(classCode, currentUsername)
      .then((response) => onStartQuiz(response))
      .catch(() => errorToast(t('multiple-attempts-error')))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={styles.wrapper}>
      {imageSrc && <img src={imageSrc} className={styles.image} draggable="false" alt="Quiz" />}

      <h3 className={styles.title} style={brandKit?.textStyle}>
        {quiz.name}
      </h3>

      {classCode === 'hypvpvogpn' && (
        <p className={styles.description} style={brandKit?.textStyle}>
          2 parts, 15 questions, 5 minutes
        </p>
      )}

      {user ? (
        <p className={styles.name}>{user.first_name}</p>
      ) : (
        <AppInput
          value={currentUsername}
          onChange={handleChange}
          placeholder={classCode === 'hypvpvogpn' ? t('name-placeholder-special') : t('name-placeholder')}
          size="lg"
        />
      )}

      {isTimer && <p className={styles.minutes}>{formatMinutes(quiz.settings.minutes ?? 0)}</p>}

      <AppButton size="lg" style={brandKit?.buttonStyle} onClick={handleStartQuiz} loading={isLoading}>
        {t('button')} <ArrowLongRightIcon />
      </AppButton>
    </div>
  );
};

export default QuizFlowWaiting;
