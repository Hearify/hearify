import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { ClockIcon } from '@heroicons/react/24/outline';
import cn from 'classnames';

import QuizFlowAPI from '@v2/api/QuizFlowAPI/QuizFlowAPI';
import AppButton from '@v2/components/AppButton/AppButton';
import QuizFlowAnswers from '@v2/templates/QuizFlow/QuizFlowAnswers/QuizFlowAnswers';
import ConfirmationModal from '@v2/containers/ConfirmationModal/ConfirmationModal';
import { formatSeconds } from '@src/util/formatTime';
import styles from './QuizFlowQuestion.module.scss';

import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';
import type { QuizQuestion } from '@v2/types/quiz';

export type QuizFlowAnswer =
  | string // For single choice, fill in and open questions
  | string[] // For multiple choice questions
  | { text: string; answer: string }[]; // For matching questions

type QuizFlowQuestionProps = {
  brandKit: FormattedBrandKit | null;
  processId: string;
  question: QuizQuestion;
  position: number;
  amount: number;
  isTimer: boolean;
  timeLeft: number | null;
  showAnswers: boolean;
  onSubmit: () => void;
};

const QuizFlowQuestion: React.FC<QuizFlowQuestionProps> = ({
  brandKit,
  question,
  processId,
  position,
  amount,
  isTimer,
  timeLeft,
  showAnswers,
  onSubmit,
}) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizFlowQuestion' });

  const [chosenAnswer, setChosenAnswer] = useState<string | string[] | { text: string; answer: string }[]>(
    question.type === 'matching' || question.type === 'fill_in' ? [] : ''
  );

  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean | null>(null);
  const [isSkipModalOpened, setIsSkipModalOpened] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const buttonText = useMemo<string>(() => {
    if ((!chosenAnswer || !chosenAnswer.length) && !question.is_required) return t('skip');

    return showAnswers ? t('check-answer') : t('submit');
  }, [chosenAnswer, showAnswers]);

  const imageSrc = useMemo<string>(() => {
    if (!question.picture_id) return '';

    return `${import.meta.env.VITE_BACKEND_URL}/api/quizzes/${question.picture_id}/picture`;
  }, [question.picture_id]);

  const handleSubmit = () => {
    if (!chosenAnswer || !chosenAnswer.length) {
      setIsSkipModalOpened(true);
      return;
    }

    QuizFlowAPI.submitAnswer(question._id, processId, position, chosenAnswer).then((response) => {
      setIsSubmitted(true);
      setIsCorrectAnswer(response);
      setTimeout(() => onSubmit(), 1500);
    });
  };

  const handleChange = (answer: QuizFlowAnswer) => {
    setChosenAnswer(answer);
  };

  return (
    <div className={styles.wrapper}>
      <ConfirmationModal
        message={t('skip-modal')}
        visible={isSkipModalOpened}
        brandKit={brandKit}
        onConfirm={onSubmit}
        onClose={() => setIsSkipModalOpened(false)}
      />

      <p className={styles.title} style={brandKit?.colorTextStyle}>
        {t('question')} {position + 1}/{amount}
      </p>

      {isTimer && (
        <div className={styles.timer}>
          <ClockIcon />
          {formatSeconds(timeLeft ?? 0)}
        </div>
      )}

      <p className={styles.question} style={brandKit?.textStyle}>
        {question?.question}
      </p>

      {imageSrc && <img className={styles.image} src={imageSrc} alt="Question" />}

      <QuizFlowAnswers
        type={question.type}
        chosenAnswer={chosenAnswer}
        answers={question.answers}
        brandKit={brandKit}
        onChange={handleChange}
      />

      {!isSubmitted && (
        <div className={styles.actions}>
          <AppButton
            size="lg"
            style={brandKit?.buttonStyle}
            onClick={handleSubmit}
            disabled={(!chosenAnswer || !chosenAnswer.length) && question.is_required}
          >
            {buttonText}
            <ChevronRightIcon />
          </AppButton>
        </div>
      )}

      {isSubmitted && showAnswers && (
        <div className={cn(styles.result, isCorrectAnswer ? styles.resultCorrect : styles.resultWrong)}>
          {isCorrectAnswer ? <CheckIcon /> : <XMarkIcon />}
          {isCorrectAnswer ? t('answer-correct') : t('answer-wrong')}
        </div>
      )}

      {isSubmitted && !showAnswers && (
        <div className={styles.result}>
          <CheckIcon />
          {t('answer-submit')}
        </div>
      )}
    </div>
  );
};

export default QuizFlowQuestion;
