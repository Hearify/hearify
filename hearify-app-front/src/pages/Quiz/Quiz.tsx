import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  Cog8ToothIcon,
  PhotoIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { ShareIcon, PlayIcon, PencilIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import cn from 'classnames';
import { updatedDiff } from 'deep-object-diff';

import Summary from '@src/components/QuizPage/Summary';
import Students from '@src/components/QuizPage/Students';
import Preview from '@src/components/QuizPage/Preview';
import Student from '@src/components/QuizPage/Student';
import LoadingPage from '../LoadingPage/LoadingPage';
import TrackingAPI from '@v2/api/TrackingAPI/TrackingAPI';
import usePermission from '@v2/hooks/usePermission';
import ExportDropdown, { type DropdownType } from '@src/components/QuizPage/ExportDropdown';
import AppButton from '@v2/components/AppButton/AppButton';
import { errorToast } from '@src/toasts/toasts';
import { trackEvent } from '@src/util/analyticTracking';
import QuizConfigureTab from './QuizConfigureTab/QuizConfigureTab';
import QuizTitleModal from './QuizTitleModal/QuizTitleModal';
import styles from '@src/pages/Quiz/Quiz.module.scss';
import AppModal from '@v2/components/AppModal/AppModal';
import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import UserAPI from '@v2/api/UserAPI/UserAPI';
import UploadFileModal from '@src/components/UploadFileModal/UploadFileModal';
import axios from '@src/api/axios';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal';
import useOnboarding from '@v2/hooks/useOnboarding';

import type { Quiz as QuizType, QuizQuestion } from '@v2/types/quiz';
import type { UserQuizRole } from '@v2/types/user';

// TODO(Sasha): Make so that information for all tabs loaded at once.
const Quiz: React.FC = () => {
  const navigate = useNavigate();

  const { t } = useTranslation('general');

  const { cannot, openPermissionModal } = usePermission();

  const tabs = [
    { icon: BookOpenIcon, key: 'preview', name: t('preview') },
    { icon: Cog8ToothIcon, key: 'configure', name: t('configure') },
    { icon: DocumentTextIcon, key: 'summary', name: t('summary') },
    { icon: UsersIcon, key: 'students', name: t('students') },
  ];

  const dropdownRef = useRef<DropdownType>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<string>('preview');

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [originalQuiz, setOriginalQuiz] = useState<QuizType | null>(null);

  const [currentStudent, setCurrentStudent] = useState<any>({});
  const [showStudent, setShowStudent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [myRole, setMyRole] = useState<UserQuizRole>('viewer');

  const { classCode } = useParams();
  const [searchParams] = useSearchParams();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isTitleModalOpened, setIsTitleModalOpened] = useState<boolean>(false);
  const [isPictureModalOpened, setIsPictureModalOpened] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const isEmptyQuestions = useMemo<boolean>(() => {
    if (!quiz) return false;

    return quiz.questions.some(
      (question) => question.question === '' || question.answers.every((answer) => answer.text === '')
    );
  }, [quiz]);

  const onNavigate = (tab: string) => {
    if (cannot('open-summary-tab') && tab === 'summary') {
      openPermissionModal('open-summary-tab');
      return;
    }

    setIsEditing(false);
    setShowStudent(false);
    setActiveTab(tab);
  };

  const onStudentClick = (data: Object) => {
    setCurrentStudent(data);
    setShowStudent(true);

    // @ts-ignore
    if (data.navigate) {
      setActiveTab('students');
    }
  };

  const handleToggleEdit = (): void => {
    if (myRole === 'viewer') {
      errorToast('access_denied');
    }

    setIsEditing((prev) => !prev);
  };

  const handleOpenExportDropdown = (): void => {
    dropdownRef.current?.toggleOpened();
  };

  const handleStartQuiz = (): void => {
    if (!quiz) return;

    if (cannot('start-quiz')) {
      errorToast(t('verify-before-start'));
      return;
    }

    trackEvent({
      event_type: 'Start quiz',
      event_properties: {
        // eslint-disable-next-line no-restricted-globals
        location: location.pathname,
      },
    });

    navigate(`/waiting/${classCode}`);
  };

  const handleTitleChange = (title: string): void => {
    setIsTitleModalOpened(false);

    setQuiz((prev) => {
      if (!prev) return prev;
      return { ...prev, name: title };
    });
  };

  const handleSaveQuestions = (): void => {
    if (!quiz || !originalQuiz) return;

    const difference: Partial<QuizType> = updatedDiff(originalQuiz, quiz);

    if (!difference.questions) {
      setIsEditing(false);
      return;
    }

    if (isEmptyQuestions) {
      errorToast('Please fill the empty question');
    }

    const newQuestions = Object.keys(difference.questions).reduce<Record<string, QuizQuestion>>((acc, key) => {
      if (!quiz.questions || !difference.questions) return acc;

      const index = key as unknown as number;

      const question = quiz.questions[index];
      acc[question._id] = difference.questions[index];

      return acc;
    }, {});

    QuizAPI.changeQuestions(quiz._id, newQuestions).then(() => {
      setIsLoading(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  };

  const deleteImage = async () => {
    if (!classCode) return;

    try {
      await axios.delete(`/api/quizzes/${classCode}/picture`);
    } catch (error) {
      console.error('Error deleting the image:', error);
    }

    setQuiz((prev) => {
      if (!prev) return prev;
      return { ...prev, picture_path: undefined, picture_id: undefined };
    });
    setIsDeleteModalOpen(false);
  };

  const loadQuiz = (): void => {
    if (!classCode) return;

    QuizAPI.getQuiz(classCode).then((data) => {
      setQuiz(data);
      setOriginalQuiz(JSON.parse(JSON.stringify(data)) as QuizType);

      setIsLoading(false);

      if (searchParams.get('firstTime')) {
        TrackingAPI.trackEvent('quiz_generated', {
          quiz_id: classCode,
          quiz_questions: data.questions.length,
          quiz_timer: data.settings.minutes,
        });
      }
    });

    UserAPI.getQuizRole(classCode).then((data) => {
      setMyRole(data);
    });
  };

  const handlePictureUpload = (url?: string) => {
    if (!url) {
      setTimeout(() => {
        window.location.reload();
      }, 100);

      return;
    }

    setQuiz((prev) => {
      if (!prev) return prev;
      return { ...prev, picture_path: url };
    });
  };

  const handleOpenPictureModal = (): void => {
    if (cannot('add-quiz-cover')) {
      openPermissionModal('add-quiz-cover');
      return;
    }

    setIsPictureModalOpened(true);
  };

  useEffect(loadQuiz, [classCode]);

  useOnboarding('quiz-details', !isLoading);

  if (isLoading || !quiz || !originalQuiz) {
    return <LoadingPage />;
  }

  return (
    <div className={styles.wrapper}>
      {quiz.picture_path && <img src={quiz.picture_path} className={styles.image} draggable="false" alt="Quiz icon" />}

      {isPictureModalOpened && (
        <UploadFileModal //
          setIsOpened={setIsPictureModalOpened}
          onPictureUpload={handlePictureUpload}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          message={t('sure_delete_quiz_image')}
          onConfirm={deleteImage}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}

      <AppModal visible={isTitleModalOpened} onClose={() => setIsTitleModalOpened(false)}>
        <QuizTitleModal onTitleChange={handleTitleChange} quizId={quiz._id} title={quiz.name} />
      </AppModal>

      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>{quiz.name}</h1>

        {isEditing && (
          <>
            <AppButton iconButton variant="secondary" onClick={() => setIsTitleModalOpened(true)}>
              <PencilIcon />
            </AppButton>

            <AppButton iconButton variant="secondary" onClick={handleOpenPictureModal}>
              <PhotoIcon />
            </AppButton>

            {quiz.picture_path && (
              <AppButton iconButton variant="secondary" onClick={() => setIsDeleteModalOpen(true)}>
                <TrashIcon />
              </AppButton>
            )}
          </>
        )}
      </div>

      <div className={styles.header}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events
            <div
              key={tab.key}
              className={cn(styles.tab, activeTab === tab.key && styles.tabActive)}
              id={`quiz-tab-${tab.key}`}
              onClick={() => onNavigate(tab.key)}
            >
              <tab.icon className={styles.tabIcon} />
              {tab.name}
            </div>
          ))}
        </div>

        {activeTab === 'preview' && (
          <div className={styles.actions}>
            {isEditing ? (
              <AppButton size="lg" onClick={handleSaveQuestions}>
                <CheckCircleIcon />
                {t('save_changes').toUpperCase()}
              </AppButton>
            ) : (
              <AppButton id="edit-quiz-title-button" size="lg" onClick={handleToggleEdit}>
                <PencilIcon width={24} height={24} />
                {t('edit_quiz').toUpperCase()}
              </AppButton>
            )}

            <div className={styles.buttonWrapper} ref={buttonRef}>
              <AppButton size="lg" variant="secondary" onClick={handleStartQuiz}>
                <PlayIcon />
                {t('start_quiz').toUpperCase()}
              </AppButton>

              <ExportDropdown
                ref={dropdownRef}
                buttonRef={buttonRef}
                quizName={quiz.name}
                classCode={classCode}
                isPublic={quiz.settings.is_public}
                quiz={quiz}
              />
            </div>

            <AppButton id="share-quiz-button" size="lg" variant="secondary" onClick={handleOpenExportDropdown}>
              <ShareIcon />
              {t('share').toUpperCase()}
            </AppButton>
          </div>
        )}
      </div>

      {activeTab === 'preview' && (
        <Preview quiz={quiz} setQuiz={setQuiz} setOriginalQuiz={setOriginalQuiz} editing={isEditing} />
      )}

      {activeTab === 'configure' && <QuizConfigureTab quiz={quiz} />}

      {activeTab === 'summary' && (
        <Summary
          questions={quiz.questions}
          classCode={quiz.class_code}
          onNavigate={onNavigate}
          onStudentClick={onStudentClick}
          quiz_name={quiz.name}
        />
      )}

      {activeTab === 'students' &&
        (showStudent ? (
          <Student
            onClick={() => setShowStudent(false)}
            id={currentStudent.id}
            rank={currentStudent.rank}
            name={currentStudent.name}
            is_registered={currentStudent.is_registered}
            process_id={currentStudent.process_id}
          />
        ) : (
          <Students classCode={quiz.class_code} onClick={onStudentClick} />
        ))}
    </div>
  );
};

export default Quiz;
