import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { Button } from '@src/components/Button/Button';
import plus from '@src/assets/images/plus.svg';
import { QuestionType, QuestionTypeDB } from '@src/entity/QuestionType';
import { getEnumKeyByEnumValue } from '@src/util/enums/getEnumKeyByValue';
import Select from '@src/components/Inputs/Select';
import usePermission from '@v2/hooks/usePermission';
import styles from '@src/components/QuizPage/Preview.module.scss';

interface AddNewQuestionProps {
  quiz: any;
  setQuiz: (quiz: any) => void;
  setOriginalQuiz: (originalQuiz: any) => void;
}

const AddNewQuestion = ({ quiz, setQuiz, setOriginalQuiz }: AddNewQuestionProps) => {
  const { t } = useTranslation('general');

  const { cannot, openPermissionModal } = usePermission();

  const questionsTypes: string[] = ['Single choice', 'Multiple choice', 'Fill in', 'Matching', 'Open'];
  const [chosenType, setChosenType] = useState<string>('Single choice');
  const [chosenTypeDB, setChosenTypeDB] = useState<string>('single_choice');
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    // @ts-ignore
    setChosenTypeDB(QuestionTypeDB[getEnumKeyByEnumValue(QuestionType, chosenType)]);
  }, [chosenType]);

  const handleClick = () => {
    setIsOpened(!isOpened);
  };

  const handleAddQuestionClick = async () => {
    if (cannot('add-question-manually')) {
      openPermissionModal('add-question-manually');
      return;
    }

    setIsNewQuestion(true);

    await axios.patch(`/api/quizzes/add-question/${chosenTypeDB}/${quiz.class_code}`).then((newQuestion) => {
      axios.get(`/api/quizzes/${quiz.class_code}`).then((originalQuiz: any) => {
        setOriginalQuiz(originalQuiz.data);

        axios.get(`/api/questions/${newQuestion.data.new_question_id}`).then((question) => {
          setQuiz((prev: any) => {
            const newValue = { ...prev };
            newValue.questions.push(question.data);
            return newValue;
          });
        });
      });
    });
  };

  return (
    <div className={styles.new_question_wrapper}>
      <p>{t('choose_type')}</p>
      <div
        onClick={handleClick}
        className={`${styles.new_question_container} ${isOpened ? styles.new_question_container_active : ''}`}
      >
        {/* <select */}
        {/*  value={chosenType} */}
        {/*  onChange={(event) => setChosenType(event.target.value)} */}
        {/* > */}
        {/*  {questionsTypes.map((questionType, index) => { */}
        {/*    return ( */}
        {/*      <option key={index} value={questionType}> */}
        {/*        {questionsTypesTranslations[index]} */}
        {/*      </option> */}
        {/*    ); */}
        {/*  })} */}
        {/* </select> */}

        <Select
          options={questionsTypes}
          selected={chosenType}
          onSelect={setChosenType}
          _className={styles.customSelect}
        />

        <Button
          style="white"
          width="17rem"
          height="46px"
          fontSize="18px"
          textColor="#15343a"
          padding="10px 16px"
          margin="0"
          onClick={handleAddQuestionClick}
        >
          <img src={plus} alt="Add question" />
          <span>{t('add_question')}</span>
        </Button>
      </div>
    </div>
  );
};

export default AddNewQuestion;
