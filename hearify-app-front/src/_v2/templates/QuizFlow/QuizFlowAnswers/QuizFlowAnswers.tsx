import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';

import AppInput from '@v2/components/AppInput/AppInput';
import AppSelect from '@v2/components/AppSelect/AppSelect';
import CheckIcon from '@v2/assets/icons/check.svg';
import styles from './QuizFlowAnswers.module.scss';

import type { AppSelectOption } from '@v2/components/AppSelect/AppSelect';
import type { QuizFlowAnswer } from '../QuizFlowQuestion/QuizFlowQuestion';
import type { FormattedBrandKit } from '@v2/utils/formatBrandKit';
import type { QuizQuestionType, QuizAnswer } from '@v2/types/quiz';

/* eslint-disable react/no-unused-prop-types */
export type QuizFlowAnswersProps = {
  type: QuizQuestionType;
  onChange: (answer: QuizFlowAnswer) => void;
  chosenAnswer: QuizFlowAnswer;
  answers: QuizAnswer[];
  brandKit: FormattedBrandKit | null;
};

/* eslint-disable @typescript-eslint/no-use-before-define, react/jsx-props-no-spreading, react/destructuring-assignment */
const QuizFlowAnswers: React.FC<QuizFlowAnswersProps> = (props) => {
  switch (props.type) {
    case 'single_choice':
    case 'special_single_choice':
    case 'fill_in':
      return <SingleChoiceAnswers {...props} />;
    case 'opened':
      return <OpenQuestionAnswers {...props} />;
    case 'multiple_choice':
      return <MultiChoiceAnswers {...props} />;
    case 'matching':
      return <MatchingAnswers {...props} />;
    default:
      return null;
  }
};

export default QuizFlowAnswers;

const SingleChoiceAnswers: React.FC<QuizFlowAnswersProps> = ({ chosenAnswer, onChange, answers }) => {
  const answer = chosenAnswer as string;

  const handleChange = (text: string): void => {
    onChange(text);
  };

  return (
    <div className={styles.wrapper}>
      {answers.map((item) => (
        <button
          type="button"
          key={item.text}
          className={cn(styles.card, item.text === answer && styles.cardActive)}
          onClick={() => handleChange(item.text)}
        >
          <span className={styles.text}>{item.text}</span>
        </button>
      ))}
    </div>
  );
};

const OpenQuestionAnswers: React.FC<QuizFlowAnswersProps> = ({ chosenAnswer, onChange }) => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizFlowAnswers' });

  const answer = chosenAnswer as string;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.wrapperOpen}>
      <AppInput
        size="lg" //
        placeholder={t('open-question-placeholder')}
        value={answer}
        onChange={handleChange}
      />
    </div>
  );
};

const MultiChoiceAnswers: React.FC<QuizFlowAnswersProps> = ({ chosenAnswer, onChange, answers }) => {
  const answer = chosenAnswer as string[];

  const handleChange = (text: string): void => {
    if (answer.includes(text)) {
      onChange(answer.filter((item) => item !== text));
    } else {
      onChange([...answer, text]);
    }
  };

  return (
    <div className={styles.wrapper}>
      {answers.map((item) => (
        <button
          type="button"
          className={cn(styles.card, answer.includes(item.text) && styles.cardActive)}
          onClick={() => handleChange(item.text)}
        >
          <div className={styles.checkbox}>{answer.includes(item.text) && <CheckIcon />}</div>

          <span className={styles.text}>{item.text}</span>
        </button>
      ))}
    </div>
  );
};

const MatchingAnswers: React.FC<QuizFlowAnswersProps> = ({ chosenAnswer, onChange, answers }) => {
  const answer = chosenAnswer as { text: string; answer: string }[];

  const options = useMemo<AppSelectOption[]>(
    () =>
      answers.map((item) => ({
        id: item.text,
        title: item.text,
      })),
    [answers]
  );

  const handleChange = (key: string, value: string): void => {
    if (!answer.find((item) => item.text === key)) {
      onChange([...answer, { text: key, answer: value }]);
      return;
    }

    onChange(
      answer.map((item) => {
        if (item.text === key) {
          return { ...item, answer: value };
        }

        return item;
      })
    );
  };

  return (
    <div className={styles.wrapperMatching}>
      {answers.map((item) => (
        <div key={item.text} className={styles.row}>
          <span className={styles.text}>{item.text}</span>

          <AppSelect
            options={options}
            value={answer.find((answerItem) => answerItem.text === item.text)?.answer || ''}
            onSelect={(value) => handleChange(item.text, value)}
          />
        </div>
      ))}
    </div>
  );
};
