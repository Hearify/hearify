import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import UserAPI from '@v2/api/UserAPI/UserAPI';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import QuizFlowWaiting from './QuizFlowWaiting/QuizFlowWaiting';
import QuizFlowStarted from '@v2/templates/QuizFlow/QuizFlowStarted/QuizFlowStarted';
import formatBrandKit from '@v2/utils/formatBrandKit';
import { useAuthStore } from '@src/store/auth';
import { shuffle } from '@src/util/array';
import { errorToast, successToast } from '@src/toasts/toasts';
import styles from './QuizFlow.module.scss';

import type { Quiz } from '@v2/types/quiz';
import type { Answer } from '@src/interfaces/QuizQuestionDto';
import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';

const QuizFlow: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizFlow' });

  const navigate = useNavigate();
  const { classCode } = useParams();

  const { user } = useAuthStore((state) => state);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [brandKit, setBrandKit] = useState<FormattedBrandKit | null>(null);
  const [processId, setProcessId] = useState<string | null>(localStorage.getItem(`processId-${classCode}`));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadQuiz = async (): Promise<void> => {
    if (!classCode) return;

    try {
      const quizResponse = await QuizAPI.getQuiz(classCode);
      const brandKitResponse = await UserAPI.getBrandKit(quizResponse.user_id);

      // Shuffle answers for each question
      quizResponse.questions = quizResponse.questions.map((question) => ({
        ...question,
        answers: shuffle<Answer>(question.answers),
      }));

      if (brandKitResponse) setBrandKit(formatBrandKit(brandKitResponse));
      setQuiz(quizResponse);
    } catch {
      errorToast(t('quiz-not-found'));
      navigate('/');
    }

    setIsLoading(false);
  };

  const handleStartQuiz = (id: string): void => {
    setProcessId(id);
    localStorage.setItem(`processId-${classCode}`, id);
  };

  useEffect(() => {
    loadQuiz();
  }, []);

  useEffect(() => {
    if (!quiz) return;
    if (quiz.settings.is_public || user) return;

    successToast(t('private-quiz-error'));
    navigate('/login');
  }, [quiz, user]);

  if (isLoading || !quiz || !classCode) {
    return <LoadingPage />;
  }

  return (
    <main className={styles.wrapper}>
      {processId ? (
        <QuizFlowStarted
          questions={quiz.questions} //
          settings={quiz.settings}
          brandKit={brandKit}
          processId={processId}
          classCode={classCode}
        />
      ) : (
        <QuizFlowWaiting
          quiz={quiz} //
          brandKit={brandKit}
          classCode={classCode}
          onStartQuiz={handleStartQuiz}
        />
      )}
    </main>
  );
};

export default QuizFlow;
