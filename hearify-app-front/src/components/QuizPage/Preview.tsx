import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/QuizPage/Preview.module.scss';
import axios from '@src/api/axios';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import AddNewQuestion from '@src/components/Preview/AddNewQuestion';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import QuizQuestion from '@src/components/Questions/QuizQuestion';
import UploadFileModal from '@src/components/UploadFileModal/UploadFileModal';

import type { Question } from '../Questions/SingleChoice';
import type { Quiz, QuizQuestion as QuizQuestionType } from '@v2/types/quiz';

type PreviewProps = {
  quiz: Quiz;
  setQuiz: (func: (prev: Quiz | null) => Quiz) => void;
  setOriginalQuiz: (originalQuiz: Quiz) => void;
  editing: boolean;
};

// TODO(Sasha): Add back logic about deleting quiz with last question.
/* eslint-disable no-underscore-dangle */
const Preview: React.FC<PreviewProps> = ({ quiz, setQuiz, setOriginalQuiz, editing }) => {
  const { t } = useTranslation('general');

  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [deletingQuestion, setDeletingQuestion] = useState<any>({});
  const [duplicateErrorIds, setDuplicateErrorIds] = useState<Array<boolean>>([]);
  const { isModalOpened, openModal, closeModal } = useConfirmationModal();

  const [pictureId, setPictureId] = useState<string | null>(quiz.picture_id);

  const [isQuestionImage, setIsQuestionImage] = useState<boolean>(false);
  const [deleteQuestionImage, setDeleteQuestionImage] = useState<boolean>(false);
  const [questionId, setQuestionId] = useState<string>('');
  const [questionPictureId, setQuestionPictureId] = useState<string | null>('');

  const handleDuplicateIds = (id: boolean) => {
    setDuplicateErrorIds((prev) => [...prev, id]);
  };

  const deleteQuestion = (question: Question) => {
    setDeletingQuestion(question);
    openModal();
  };

  const onQuestionImageDelete = () => {
    setDeleteQuestionImage(true);
    openModal();
  };

  const confirmDelete = () => {
    if (!deletingQuestion) {
      return;
    }

    axios.delete(`/api/quizzes/${quiz._id}/questions/${deletingQuestion._id}`);
    const filtered = quiz.questions.filter((q: any) => q._id !== deletingQuestion._id);
    setQuiz((prev: Quiz) => ({ ...prev, questions: filtered }));
    setDeletingQuestion({});
    closeModal();
  };

  const confirmQuestionImageDelete = async () => {
    try {
      await axios.delete(`/api/quizzes/question/${questionId}/picture`, {});

      setQuiz((prevQuiz: any) => {
        const updatedQuestions = prevQuiz.questions.map((q: any) => {
          if (q._id === questionId) {
            return { ...q, picture_id: '' };
          }
          return q;
        });
        return { ...prevQuiz, questions: updatedQuestions };
      });
      setQuestionPictureId('');
      setQuestionId('');
      closeModal();
    } catch (error) {
      console.error('Error deleting the image:', error);
    }
  };

  const closeQuestionImageModal = () => {
    setDeleteQuestionImage(false);
    closeModal();
  };

  useEffect(() => {
    if (questionPictureId && questionId) {
      setQuiz((prevQuiz: any) => {
        const updatedQuestions = prevQuiz.questions.map((q: any) => {
          if (q._id === questionId) {
            return { ...q, picture_id: questionPictureId };
          }
          return q;
        });
        return { ...prevQuiz, questions: updatedQuestions };
      });
      setQuestionPictureId('');
      setQuestionId('');
    }
  }, [questionPictureId, questionId, setQuiz]);

  return (
    <div className={styles.wrapper}>
      {isModalOpened && (
        <ConfirmationModal message={t('sure_delete_question')} onConfirm={confirmDelete} onClose={closeModal} />
      )}

      {deleteQuestionImage && isModalOpened && (
        <ConfirmationModal
          message={t('sure_delete_quiz_image')}
          onConfirm={confirmQuestionImageDelete}
          onClose={closeQuestionImageModal}
        />
      )}

      {isOpened && (
        <UploadFileModal
          setIsOpened={setIsOpened}
          setIsQuestionImage={setIsQuestionImage}
          isQuestionImage={isQuestionImage}
          questionId={questionId}
          setPictureId={setPictureId}
          setQuestionPictureId={setQuestionPictureId}
        />
      )}

      <div className={styles.virtual_scroll}>
        <div className={styles.scrollable_content}>
          {quiz.questions.map((question: QuizQuestionType, index: number) => (
            <div key={quiz._id} className={styles.questionBlock}>
              <QuizQuestion
                questionType={question.type}
                index={index + 1}
                question={question}
                page="preview"
                edit={editing}
                onDelete={deleteQuestion}
                setQuiz={setQuiz}
                onDuplicate={handleDuplicateIds}
                setIsOpened={setIsOpened}
                setIsQuestionImage={setIsQuestionImage}
                setQuestionId={setQuestionId}
                questionPictureId={question.picture_id}
                onQuestionImageDelete={onQuestionImageDelete}
              />
            </div>
          ))}

          {editing && (
            <AddNewQuestion
              quiz={quiz} //
              setQuiz={setQuiz}
              setOriginalQuiz={setOriginalQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
