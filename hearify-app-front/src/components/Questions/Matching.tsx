import React, { useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

import styles from '@src/components/Questions/SingleChoice.module.scss';
import trashIcon from '@src/assets/images/trash.svg';
import ResultsBar from '../ProgressBar/ResultsBar';
import uploadIcon from '@src/assets/images/add_question_image.svg';
import changeArrow from '@src/assets/images/arrow-path.png';
import deleteImgIcon from '@src/assets/images/trash.png';
import AppButton from '@v2/components/AppButton/AppButton';

import type { Question } from './SingleChoice';

type MatchingProperties = {
  question: Question;
  index: number;
  page: 'summary' | 'preview';
  circleValue?: number;
  edit?: boolean | null;
  setQuiz: (quiz: any) => void;
  onDelete?: (question: Question) => void;
  questionPictureId?: string;
  imageSrc?: string;
  onAddQuestionImage: () => void;
  onQuestionImageDelete: () => void;
};

const OPTIONS = ['A', 'B', 'C', 'D'];

const Matching = ({
  question,
  index,
  page,
  edit,
  imageSrc,
  onDelete,
  setQuiz,
  circleValue,
  questionPictureId,
  onAddQuestionImage,
  onQuestionImageDelete,
}: MatchingProperties) => {
  const { t } = useTranslation('general');
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map());

  const editQuestion = (key: string, value: string | Array<string>) => {
    setQuiz &&
      setQuiz((prev: any) => {
        const newValue = { ...prev };
        const index = newValue.questions.findIndex((q: any) => q._id === question._id);
        newValue.questions[index][key] = value;
        return newValue;
      });
  };

  const handleSelectChange = (question: string, answer: string) => {
    setSelectedAnswers(new Map(selectedAnswers.set(question, answer)));
    validateAnswers();
  };

  const validateAnswers = () => {
    const answersArray = Array.from(selectedAnswers.values());
    const hasDuplicates = new Set(answersArray).size !== answersArray.length;
    onDuplicate && onDuplicate(hasDuplicates);
  };

  const editAnswer = (index: number, key: string, value: string | boolean) => {
    const _answers = [...question.answers];

    _answers[index][key] = value;
    editQuestion('answers', _answers);
  };

  return (
    <div className={styles.container}>
      <div className={styles.title_wrapper}>
        {edit ? (
          <>
            <span className={styles.index} style={{ margin: '9px' }}>
              {index}
            </span>
            <input
              value={question.question}
              onChange={(e) => {
                editQuestion('question', e.target.value);
              }}
            />
          </>
        ) : (
          <p className={styles.title} style={{ maxWidth: page == 'summary' ? '550px' : '' }}>
            <span className={styles.index}>{index}</span> {question.question}
          </p>
        )}

        {edit && (
          <div className={styles.upload_image_container}>
            {!questionPictureId && (
              <AppButton variant="secondary" iconButton onClick={onAddQuestionImage}>
                <PhotoIcon />
              </AppButton>
            )}
            <div className={styles.controls}>
              <AppButton variant="secondary" iconButton onClick={() => onDelete(question)}>
                <TrashIcon />
              </AppButton>
            </div>
          </div>
        )}
      </div>
      {questionPictureId && (
        <div className={styles.question_image_container}>
          {edit && (
            <div className={styles.question_image_btns}>
              <button onClick={onAddQuestionImage} type="button">
                <img src={changeArrow} draggable="false" alt="Change icon" />
                {t('change_image')}
              </button>
              <button onClick={onQuestionImageDelete} type="button">
                <img src={deleteImgIcon} draggable="false" alt="Delete icon" />
                {t('delete_image')}
              </button>
            </div>
          )}
          <img className={styles.question_image} src={imageSrc} alt="Question" />
        </div>
      )}
      {page == 'summary' && (
        <div className={styles.progressbar_wrapper}>
          <p>{circleValue}%</p>
          <ResultsBar percentage={circleValue as number} width="100%" />
        </div>
      )}

      <p className={styles.subtitle}>{t('questions')}:</p>

      {question.answers.map(({ text }: any, index: number) => (
        <div key={index} className={styles.answer}>
          {edit ? (
            <div className={styles.input_container}>
              <span className={styles.matching_index}>{index + 1}.</span>{' '}
              <input value={text} onChange={(e) => editAnswer(index, 'text', e.target.value)} />
            </div>
          ) : (
            <p className={styles.matching_p}>
              <span className={styles.matching_index}>{index + 1}. </span> {text}
            </p>
          )}

          {/* <Select
            options={OPTIONS}
            selected={OPTIONS[index]}
            onSelect={(e: any) => handleSelectChange(OPTIONS[index], e)}
            width={{ width: '60px', height: '44px', padding: '10px' }}
            disabled={!edit}
          /> */}
        </div>
      ))}

      <p className={styles.subtitle}>{t('answers')}:</p>

      {question.answers.map(({ correct }: any, index: number) => (
        <>
          {edit ? (
            <div className={styles.input_container}>
              <span className={styles.matching_index}>{`${OPTIONS[index]})`} </span>
              <input value={correct} onChange={(e) => editAnswer(index, 'correct', e.target.value)} />
            </div>
          ) : (
            <div className={styles.answer}>
              <p style={{ maxWidth: page == 'summary' ? '550px' : '' }}>
                <span className={styles.matching_index}>{`${OPTIONS[index]})`} </span> {correct}
              </p>
            </div>
          )}
        </>
      ))}

      {page == 'summary' && (
        <div className={styles.circle}>
          <CircularProgressbarWithChildren
            value={circleValue as number}
            background
            styles={buildStyles({
              strokeLinecap: 'round',
              pathColor: `#6444f4`,
              trailColor: '#f0ecff',
              backgroundColor: '#f0ecff',
            })}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '-10px',
                fontSize: '13.3px',
                fontWeight: 600,
                lineHeight: '20px',
                textAlign: 'center',
                color: '#15343a',
              }}
            >
              {`${circleValue}%`}
            </div>
          </CircularProgressbarWithChildren>
        </div>
      )}
    </div>
  );
};

export default Matching;
