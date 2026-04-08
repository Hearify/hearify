import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/BrandKit/QuizFlowPreview/QuizFlowPreview.module.scss';
import checkDefaultIcon from '@src/assets/images/checked.svg';
import continueArrow from '@src/assets/images/continue-arrow.svg';

import type { BrandKitInterface } from '@src/components/BrandKit/BrandKit.tsx';

interface MultiChoicePreviewProps {
  brandKit: BrandKitInterface;
}

const MultiChoicePreview = ({ brandKit }: MultiChoicePreviewProps) => {
  const { t } = useTranslation('general');
  const [choices, setChoices] = useState<Set<number>>(new Set([1, 3]));

  const question = {
    question: 'What is the answer to your sample question?',
    answers: [
      { text: 'The сorrect answer' },
      { text: 'Another answer' },
      { text: 'A random word' },
      { text: 'A wrong answer' },
    ],
  };

  const handleOnChange = (index: number) => {
    const updatedChoices = new Set(choices);

    if (!choices.has(index)) {
      updatedChoices.add(index);
    } else {
      updatedChoices.delete(index);
    }

    setChoices(updatedChoices);
  };

  return (
    <div className={styles.questionContainer}>
      <p style={{ fontFamily: brandKit.font?.family && brandKit.font.family }} className={styles.title}>
        Question 2/5
      </p>

      <p style={{ fontFamily: brandKit.font?.family && brandKit.font.family }} className={styles.question}>
        {question?.question}
      </p>

      <div className={styles.answers_container}>
        {question.answers.map(({ text }: any, index: number) => {
          const checked = choices.has(index);

          return (
            <div className={styles.answers_item_container}>
              <div
                key={index}
                className={styles.answers_item}
                style={{ background: checked ? brandKit.answerFill : '#fefdff', borderColor: brandKit.answerFill }}
                onClick={() => handleOnChange(index)}
              >
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleOnChange(index)}
                />
                <span className={styles.checkmark}>{checked && <img src={checkDefaultIcon} alt="" />}</span>

                <div
                  className={styles.text}
                  style={{
                    color: checked ? brandKit.answerText : '#15343a',
                    fontFamily: brandKit.font?.family && brandKit.font.family,
                  }}
                >
                  {text}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={styles.check_answers}
        style={{ backgroundColor: brandKit.buttonFill, color: brandKit.buttonText }}
      >
        <span style={{ fontFamily: brandKit.font?.family && brandKit.font.family }}>{t('check_answer')}</span>
        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.25 5L15.75 12.5L8.25 20"
            stroke={brandKit.buttonText}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default MultiChoicePreview;
