import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SparklesIcon } from '@heroicons/react/24/solid';

import quizIcon from '@src/assets/images/quiz.svg';
import FileIcon from '@v2/assets/icons/file.svg';
import joinQuizIcon from '@src/assets/images/join_quiz.svg';
import EmailVerificationAlert from '@v2/containers/EmailVerificationAlert/EmailVerificationAlert';
import AppPlaceholder from '@v2/components/AppPlaceholder/AppPlaceholder';
import AppPagination from '@v2/components/AppPagination/AppPagination';
import AppButton from '@v2/components/AppButton/AppButton';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import QuizCard from '@v2/containers/QuizCard/QuizCard';
import { HOME_PAGE_SIZE } from '@src/constants/pagination';
import QuizAPI from '@v2/api/QuizAPI/QuizAPI';
import styles from './Home.module.scss';

import type { Quiz } from '@v2/types/quiz';

const Home: React.FC = () => {
  const { t } = useTranslation('general');
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

  const UpdateQuizzes = (quizId: string): void => {
    setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
  };

  useEffect(() => {
    setIsLoading(true);

    const searchParams = new URLSearchParams(location.search);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    setPage(currentPage);

    const lastItemIndex = HOME_PAGE_SIZE * (currentPage - 1);

    QuizAPI.getAllQuizzes(HOME_PAGE_SIZE, lastItemIndex)
      .then((response) => {
        setQuizzes(response.data);
        setCount(Math.ceil(response.count / HOME_PAGE_SIZE));
      })
      .catch((err) => console.error('Error fetching quizzes: ', err))
      .finally(() => setIsLoading(false));
  }, [location.search]);

  return (
    <main className={styles.wrapper}>
      <EmailVerificationAlert />

      {isLoading && <LoadingPage />}

      {!isLoading && quizzes.length === 0 ? (
        <div className={styles.header}>
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
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t('start_journey')}</h2>
            <div className={styles.actions}>
              <Link to="/generate-quiz" className={styles.button}>
                <img className={styles.buttonIcon} src={quizIcon} alt="Panel button icon" />
                {t('generate_quiz')}
              </Link>
              <Link to="/join-quiz" className={styles.button}>
                <img className={styles.buttonIcon} src={joinQuizIcon} alt="Panel button icon" />
                {t('join_quiz')}
              </Link>
            </div>
          </div>
          <h2 className={styles.title}>{t('latest_actions')}</h2>

          <div className={styles.list}>
            {quizzes.map((quiz) => (
              <QuizCard quiz={quiz} onDelete={UpdateQuizzes} />
            ))}
          </div>

          <div className={styles.pagination}>
            <AppPagination onChange={handlePageChange} count={count} page={page} />
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
