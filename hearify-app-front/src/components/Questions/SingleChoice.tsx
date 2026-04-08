import React, { useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';

import styles from '@src/components/Questions/SingleChoice.module.scss';
import ResultsBar from '../ProgressBar/ResultsBar';
import changeArrow from '@src/assets/images/arrow-path.png';
import deleteImgIcon from '@src/assets/images/trash.png';
import AppButton from '@v2/components/AppButton/AppButton';

export type Question = {
  _id: string;
  type: string;
  question: string;
  picture_id: string;
  answers: Array<any>;
};

type SingleChoiceProperties = {
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

const SingleChoice = ({
  question,
  index,
  page,
  edit,
  imageSrc,
  onDelete = () => {},
  setQuiz,
  circleValue,
  questionPictureId,
  onAddQuestionImage,
  onQuestionImageDelete,
}: SingleChoiceProperties) => {
  const { t } = useTranslation('general');

  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number>(
    question.answers.findIndex((answer) => answer.correct)
  );

  const editQuestion = (key: string, value: string | Array<string>) => {
    setQuiz &&
      setQuiz((prev: any) => {
        const newValue = { ...prev };
        const index = newValue.questions.findIndex((q: any) => q._id === question._id);
        newValue.questions[index][key] = value;
        return newValue;
      });
  };

  const editAnswer = (index: number, key: string, value: string | boolean) => {
    let _answers = [...question.answers];
    if (key == 'correct') {
      _answers = _answers.map((answer) => ({ ...answer, correct: false }));
      setCorrectAnswerIndex(index);
    }
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

      <RadioGroup
        value={correctAnswerIndex}
        onChange={(e) => editAnswer(+e.target.value, 'correct', true)}
        style={{ gap: '14px' }}
      >
        {question.answers.map(({ text }: any, index: number) => (
          <div key={index} className={styles.answer}>
            {edit ? (
              <>
                <Radio value={index} />
                <input value={text} onChange={(e) => editAnswer(index, 'text', e.target.value)} />
              </>
            ) : (
              <>
                <Radio value={index} disabled />
                <p style={{ maxWidth: page == 'summary' ? '550px' : '' }}>{text}</p>
              </>
            )}
          </div>
        ))}
      </RadioGroup>

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

export default SingleChoice;
