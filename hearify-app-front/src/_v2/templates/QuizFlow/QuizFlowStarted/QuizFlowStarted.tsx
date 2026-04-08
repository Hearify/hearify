import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import QuizFlowAPI from '@v2/api/QuizFlowAPI/QuizFlowAPI';
import QuizFlowQuestion from '../QuizFlowQuestion/QuizFlowQuestion';
import ConfirmationModal from '@v2/containers/ConfirmationModal/ConfirmationModal';
import { errorToast } from '@src/toasts/toasts';
import { useAuthStore } from '@src/store/auth';
import styles from './QuizFlowStarted.module.scss';

import type { QuizQuestion, QuizSettings } from '@v2/types/quiz';
import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';

export type QuizFlowQuestionsProps = {
  questions: QuizQuestion[];
  settings: QuizSettings;
  brandKit: FormattedBrandKit | null;
  processId: string;
  classCode: string;
};

const QuizFlowStarted: React.FC<QuizFlowQuestionsProps> = ({
  questions, //
  settings,
  brandKit,
  processId,
  classCode,
}) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizFlowStarted' });

  const { user } = useAuthStore((state) => state);

  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(
    Number(localStorage.getItem(`currentQuestionIndex-${classCode}`) || 0)
  );
  const [timeLeft, setTimeLeft] = useState<number>(settings.minutes || 0);

  const isTimer = useMemo<boolean>(() => {
    if (!settings.minutes) return false;

    return settings.minutes > 0;
  }, [settings]);

  const submitQuiz = (): void => {
    QuizFlowAPI.submitQuiz(processId, !!user)
      .then(() => {
        localStorage.removeItem(`processId-${classCode}`);
        localStorage.removeItem(`currentQuestionIndex-${classCode}`);

        navigate(`/results/${classCode}/${processId}`);
      })
      .catch(() => {
        errorToast(t('submit-error'));
      });
  };

  const handleNextQuestion = (): void => {
    if (currentQuestionIndex === questions.length - 1) {
      submitQuiz();
      return;
    }

    localStorage.setItem(`currentQuestionIndex-${classCode}`, String(currentQuestionIndex + 1));
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  /* eslint-disable consistent-return */
  useEffect(() => {
    if (!isTimer) return;

    const interval = setInterval(() => {
      setTimeLeft((prevState) => prevState - 1);
    }, 1000);

    return () => clearTimeout(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <ConfirmationModal
        visible={timeLeft <= 0 && isTimer}
        message={t('time-over')}
        buttonText={t('go-results')}
        onConfirm={submitQuiz}
        onClose={submitQuiz}
        brandKit={brandKit}
        showCancel={false}
      />

      <QuizFlowQuestion
        key={currentQuestionIndex}
        brandKit={brandKit}
        processId={processId}
        question={questions[currentQuestionIndex]}
        position={currentQuestionIndex}
        amount={questions.length}
        isTimer={isTimer}
        timeLeft={timeLeft}
        showAnswers={settings.show_answers}
        onSubmit={handleNextQuestion}
      />
    </div>
  );
};

export default QuizFlowStarted;
