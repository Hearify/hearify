import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { DocumentIcon, SparklesIcon } from '@heroicons/react/24/solid';

import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import AppButtonLink from '@v2/components/AppButtonLink/AppButtonLink';
import AppPagination from '@v2/components/AppPagination/AppPagination';
import AppPlaceholder from '@v2/components/AppPlaceholder/AppPlaceholder';
import AppButton from '@v2/components/AppButton/AppButton';
import QuizCard from '@v2/containers/QuizCard/QuizCard';
import { QUIZZES_PAGE_SIZE } from '@src/constants/pagination';
import FileIcon from '@v2/assets/icons/file.svg';
import styles from './QuizList.module.scss';
import useOnboarding from '@v2/hooks/useOnboarding';

import type { Quiz } from '@v2/types/quiz';

const QuizList: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.QuizList' });
  const navigate = useNavigate();
  const location = useLocation();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);
  const [count, setCount] = useState<number>(0);

  const handlePageChange = (newPage: number) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('page', newPage.toString());

    navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });

    setPage(newPage);
  };

  const UpdateQuizzes = (quizId: string) => {
    setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
  };

  useEffect(() => {
    setIsLoading(true);

    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    setPage(currentPage);

    const lastItemIndex = QUIZZES_PAGE_SIZE * (currentPage - 1);

    QuizAPI.getAllQuizzes(QUIZZES_PAGE_SIZE, lastItemIndex)
      .then((response) => {
        setQuizzes(response.data);
        setCount(Math.ceil(response.count / QUIZZES_PAGE_SIZE));
      })
      .catch((err) => console.error('Error fetching quizzes: ', err))
      .finally(() => setIsLoading(false));
  }, [location.search]);

  useOnboarding('quiz-list', isLoading || (!isLoading && !!quizzes.length));

  return (
    <main className={styles.wrapper}>
      {isLoading && <LoadingPage />}

      {!isLoading && quizzes.length === 0 ? (
        <div className={styles.topWrapper}>
          <h2 className={styles.title}>{t('start_journey')}</h2>
          <AppPlaceholder //
            icon={<FileIcon />}
            text={t('latest_actions_empty_state')}
          >
            <AppButton //
              variant="secondary"
              size="lg"
              onClick={() => navigate('/generate-quiz')}
            >
              <SparklesIcon />
              {t('generate').toUpperCase()}
            </AppButton>
          </AppPlaceholder>
        </div>
      ) : (
        <main className={styles.wrapper}>
          <header className={styles.header}>
            <h1 className={styles.title}>{t('title')}</h1>

            <AppButtonLink size="lg" href="/generate-quiz">
              {t('button')} <DocumentIcon />
            </AppButtonLink>
          </header>

          <div className={styles.list}>
            {quizzes.map((quiz) => (
              <QuizCard quiz={quiz} onDelete={UpdateQuizzes} />
            ))}
          </div>

          <div className={styles.pagination}>
            <AppPagination onChange={handlePageChange} count={count} page={page} />
          </div>
        </main>
      )}
    </main>
  );
};

export default QuizList;
