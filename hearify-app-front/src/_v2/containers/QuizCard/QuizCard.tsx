import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { trackShareQuiz, TrackShareQuizSourceType, TrackShareQuizType } from '@src/util/analyticTracking';
import QuizDropdown from '@v2/containers/QuizDropdown/QuizDropdown';
import styles from './QuizCard.module.scss';

import type { Quiz } from '@v2/types/quiz';

type QuizCardProps = {
  quiz: Quiz;
  group?: boolean;
  groupId: string;
  onDelete: (id: string) => void;
};

//TODO: Max fix dropdown
const QuizCard: React.FC<QuizCardProps> = ({ group, groupId, quiz, onDelete }) => {
  const { t } = useTranslation('general');

  const navigate = useNavigate();

  const imageSrc = useMemo<string>(() => {
    if (!quiz.picture_id) return '';

    return `${import.meta.env.VITE_BACKEND_URL}/api/quizzes/${quiz.picture_id}/picture`;
  }, [quiz.picture_id]);

  const handleCardClick = (): void => {
    trackShareQuiz(TrackShareQuizSourceType.QUIZ_HOLDER, TrackShareQuizType.CODE);
    navigate(`/quiz/${quiz.class_code}`);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.dropdown}>
        <QuizDropdown group={group} groupId={groupId} quiz={quiz} onDelete={onDelete} />
      </div>

      <div className={styles.container} onClick={handleCardClick}>
        {imageSrc && <img src={imageSrc} className={styles.image} alt="Quiz" />}
        <div className={styles.body}>
          <p className={styles.title}>{quiz.name}</p>
          <p className={styles.text}>
            {quiz.questions.length} {t('questions_label_2')}
          </p>
          <p className={styles.date}>{new Date(quiz.created_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
