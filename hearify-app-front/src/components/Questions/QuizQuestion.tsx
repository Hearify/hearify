import React, { useState, useEffect } from 'react';

import SingleChoice from './SingleChoice';
import MultiChoice from './MultiChoice';
import FillIn from './FillIn';
import Open from './Open';
import Matching from './Matching';
import axios from '@src/api/axios';
import usePermission from '@v2/hooks/usePermission';

import type { Question } from './SingleChoice';

export type QuzQuestionProps = {
  questionType: 'single_choice' | 'multiple_choice' | 'fill_in' | 'opened' | 'matching';
  question: Question;
  index: number;
  page: 'summary' | 'preview';
  circleValue?: number;
  edit?: boolean | null;
  setQuiz: (quiz: any) => void;
  onDuplicate?: (duplicate: boolean) => void;
  onDelete?: (question: Question) => void;
  setIsOpened: (b: boolean) => void;
  setIsQuestionImage: (b: boolean) => void;
  setQuestionId: (id: string) => void;
  questionPictureId: string;
  onQuestionImageDelete: () => void;
};

/* eslint-disable react/jsx-props-no-spreading */
const QuzQuestion: React.FC<QuzQuestionProps> = ({
  questionType,
  setIsOpened,
  setIsQuestionImage,
  setQuestionId,
  questionPictureId,
  onQuestionImageDelete,
  question,
  ...rest
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');

  const { cannot, openPermissionModal } = usePermission();

  const handleAddQuestionImage = () => {
    if (cannot('add-question-cover')) {
      openPermissionModal('add-question-cover');
      return;
    }

    setIsOpened(true);
    setIsQuestionImage(true);
    setQuestionId(question._id);
  };

  const handleDeleteQuestionImage = () => {
    onQuestionImageDelete();
    setQuestionId(question._id);
  };

  const fetchImage = async () => {
    if (!questionPictureId) {
      return;
    }
    try {
      const response = await axios.get(`/api/quizzes/${questionPictureId}/picture`, {
        responseType: 'blob',
      });

      const imageUrl = URL.createObjectURL(response.data);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error('Error fetching the image:', error);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [questionPictureId]);

  switch (questionType) {
    case 'single_choice':
      return (
        <SingleChoice
          {...rest}
          question={question}
          imageSrc={imageSrc}
          onQuestionImageDelete={handleDeleteQuestionImage}
          onAddQuestionImage={handleAddQuestionImage}
          questionPictureId={questionPictureId}
        />
      );
    case 'multiple_choice':
      return (
        <MultiChoice
          {...rest}
          question={question}
          imageSrc={imageSrc}
          questionPictureId={questionPictureId}
          onQuestionImageDelete={handleDeleteQuestionImage}
          onAddQuestionImage={handleAddQuestionImage}
        />
      );
    case 'fill_in':
      return (
        <FillIn
          {...rest}
          question={question}
          imageSrc={imageSrc}
          questionPictureId={questionPictureId}
          onQuestionImageDelete={handleDeleteQuestionImage}
          onAddQuestionImage={handleAddQuestionImage}
        />
      );
    case 'opened':
      return (
        <Open
          {...rest}
          imageSrc={imageSrc}
          question={question}
          questionPictureId={questionPictureId}
          onQuestionImageDelete={handleDeleteQuestionImage}
          onAddQuestionImage={handleAddQuestionImage}
        />
      );
    case 'matching':
      return (
        <Matching
          {...rest}
          imageSrc={imageSrc}
          question={question}
          questionPictureId={questionPictureId}
          onQuestionImageDelete={handleDeleteQuestionImage}
          onAddQuestionImage={handleAddQuestionImage}
        />
      );
    default:
      return null;
  }
};

export default QuzQuestion;
