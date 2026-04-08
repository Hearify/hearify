import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';

import dotsIcon from '@src/assets/images/three_dots.svg';
import ExportDropdown from '@src/components/QuizPage/ExportDropdown';
import { trackShareQuiz, TrackShareQuizSourceType, TrackShareQuizType } from '@src/util/analyticTracking';
import styles from './QuizHolder.module.scss';
import axios from '@src/api/axios';

import type { DropdownType } from '@src/components/QuizPage/ExportDropdown';
import type { Quiz } from '@src/entity/Quiz';

interface QuizProps {
  course: Quiz;
  onClick?: (course: Quiz) => void;
  onDelete?: (id: string) => void;
}

const QuizHolder: React.FC<QuizProps> = ({ course: quiz, onClick = () => {}, onDelete }: QuizProps) => {
  const dropdownRef = useRef<DropdownType>(null);
  const buttonRef = useRef<HTMLImageElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    trackShareQuiz(TrackShareQuizSourceType.QUIZ_HOLDER, TrackShareQuizType.CODE);
    event.stopPropagation();
    onClick(quiz);
  };

  const handleDotsClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    dropdownRef.current?.toggleOpened();
  };

  const fetchImage = async () => {
    if (!quiz.picture_id) {
      return;
    }
    try {
      const response = await axios.get(`/api/quizzes/${quiz.picture_id}/picture`, {
        responseType: 'blob',
      });

      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
      }

      const imageUrl = URL.createObjectURL(response.data);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error('Error fetching the image:', error);
    }
  };

  useEffect(() => {
    fetchImage();
    return () => {
      if (imageSrc) {
        URL.revokeObjectURL(imageSrc);
        setImageSrc(null);
      }
    };
  }, []);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Stack
        direction="column"
        className={styles.courseCard}
        spacing={1}
        sx={{ height: '100% !important', cursor: 'pointer' }}
        onClick={handleClick}
      >
        {imageSrc && <img src={imageSrc} className={styles.quiz_logo} alt="Quiz logo" />}
        <div className={imageSrc ? `${styles.title_container_logo}` : styles.title_container}>
          <p className={styles.courseTitle}>{quiz.name}</p>
          <img ref={buttonRef} onClick={handleDotsClick} className={styles.dots} src={dotsIcon} alt="dots" />
        </div>
        <p className={styles.courseQuestions}>{quiz.questions.length} questions</p>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" display="flex">
          {/* <p className={styles.courseDate}>{quiz.createdAt.toLocaleDateString()}</p> */}
        </Stack>
      </Stack>

      <ExportDropdown
        style={{ top: '70px', right: '30px' }}
        ref={dropdownRef}
        buttonRef={buttonRef}
        onDelete={onDelete}
        quizId={quiz.id}
        classCode={quiz.classCode}
        quiz={quiz}
      />
    </div>
  );
};

export default QuizHolder;
