import { useEffect, useState } from 'react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/QuizPage/Summary.module.scss';
import chevronIcon from '@src/assets/images/chevron-down.svg';
import downloadIcon from '@src/assets/images/download.svg';
import axios from '@src/api/axios';
import { calculatePercentage } from '@src/util/user';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import { formatDate } from '@src/util/date';
import backIcon from '@src/assets/images/chevron_left.svg';
import errorIcon from '@src/assets/images/results_error.svg';
import MessageBlock from '@src/components/MessageBlock/MessageBlock';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal.ts';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal.tsx';
import downloadFile from '@src/util/downloadFile.ts';
import ResultsBar from '../ProgressBar/ResultsBar';
import Button from '../Button/Button';
import MultiChoice from '../Questions/MultiChoice';
import Matching from '../Questions/Matching';
import Open from '../Questions/Open';
import FillIn from '../Questions/FillIn';
import SingleChoice from '../Questions/SingleChoice';
import ConditionSwitch from '../ConditionSwitch/ConditionSwitch';

import type { LeaderboardResponse } from '@src/interfaces/LeaderboardResponse';
import type { Question } from '../Questions/SingleChoice';

type ResultProps = {
  switchCase?: string;
  quiz_name: string;
  questions: Array<Question>;
  classCode: string;
  onStudentClick: (data: Object) => void;
  onNavigate: (key: string) => void;
};

const Summary = ({ quiz_name, questions, classCode, onNavigate, onStudentClick }: ResultProps) => {
  const { t } = useTranslation('general');

  const navigate = useNavigate();

  const [students, setStudents] = useState<Array<any>>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resultsBlob, setResultsBlob] = useState('');

  const downloadModal = useConfirmationModal();
  const { quiz, average_quiz_result: quizResult, average_questions_results: questionsResults } = statistics;

  const getStatistics = async () => {
    let res: any;
    setIsLoading(true);

    res = await axios.get(`/api/quizzes/${classCode}/statistics`);
    console.log(res);
    if (res.data.detail) {
      return;
    }

    setStatistics(res.data);
  };

  const getQuizAverage = () => {
    return Math.round((quizResult?.number_of_correct_answers / quizResult?.number_of_answered_questions) * 100);
  };

  const getQuestionAverage = (text: string) => {
    const question = questionsResults?.results.find((question: any) => question?.question_text == text);

    return Math.round((question?.correct_answers / question?.overall_answers) * 100);
  };

  const getStudents = async () => {
    let students = [];
    try {
      const res = await axios.get(`/api/quizzes/${classCode}/leaderboard?limit=${6}&skip=${1}`);

      students = res.data.leaderboard.map((leaderboardResponse: LeaderboardResponse) => {
        return {
          id: leaderboardResponse.user.id,
          first_name: leaderboardResponse.user.first_name,
          surname: leaderboardResponse.user.surname ? leaderboardResponse.user.surname : '',
          percentage: calculatePercentage(leaderboardResponse.correct_answers, leaderboardResponse.questions),
          is_registered: leaderboardResponse.user.is_registered,
        };
      });

      students.sort((a: { percentage: number }, b: { percentage: number }) => {
        if (typeof a.percentage === 'number' && typeof b.percentage === 'number') {
          return b.percentage - a.percentage;
        }
        return 0;
      });
      setStudents(students);

      setIsLoading(false);
    } catch (error) {
      console.log('error in classcode', error);
      setIsLoading(false);
      return undefined;
    }
  };

  const onDownloadClick = async () => {
    await axios.get(`/api/csv-loader/${classCode}/csv`, { responseType: 'blob' }).then((res) => {
      setResultsBlob(res.data);
      downloadModal.openModal();
    });
  };

  const onDownloadConfirm = () => {
    downloadFile(new Blob([resultsBlob]), `${quiz_name}-Results.csv`);
    downloadModal.closeModal();
  };

  useEffect(() => {
    getStatistics();
    getStudents();
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!students.length) {
    return (
      <MessageBlock
        style={{ marginTop: '100px' }}
        image={errorIcon}
        message={t('no_results_message')}
        onClick={() => navigate('/quizzes')}
      >
        <img src={backIcon} />
        {t('go_back_to_library').toUpperCase()}
      </MessageBlock>
    );
  }

  return (
    <>
      {downloadModal.isModalOpened && (
        <ConfirmationModal
          message={t('download_results?')}
          onConfirm={onDownloadConfirm}
          onClose={downloadModal.closeModal}
        />
      )}

      <div className={styles.container}>
        <div className={styles.left_block}>
          <div className={styles.score}>
            <p className={styles.title}>{t('quiz_score')}</p>

            <p className={styles.created}>
              {t('created')} {formatDate(quiz?.created_at)}
            </p>

            <div className={styles.statistics}>
              <div className={styles.circle}>
                <CircularProgressbarWithChildren
                  value={getQuizAverage()}
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
                      marginTop: '-15px',
                      fontSize: '20px',
                      fontWeight: 600,
                      lineHeight: '30px',
                      textAlign: 'center',
                      color: '#15343a',
                    }}
                  >
                    {getQuizAverage()}%
                  </div>
                </CircularProgressbarWithChildren>
              </div>
              <div className={styles.text_block}>
                <p>
                  {t('students')}: {quiz?.total_number_of_students}{' '}
                </p>

                <p>
                  {t('questions')}: {quiz?.total_number_of_questions}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.students}>
            <p className={styles.title}>{t('students')}</p>

            {students.map((student: any, index: number) => {
              return (
                <div className={styles.item} key={student.id}>
                  <div className={styles.left_block}>
                    <div className={styles.index}>{index + 1}</div>
                    <p
                      className={styles.name}
                      onClick={() =>
                        onStudentClick({
                          id: student.id,
                          name: `${student.first_name} ${student.surname}`,
                          rank: index + 1,
                          navigate: true,
                          is_registered: student.is_registered,
                        })
                      }
                    >{`${student.first_name} ${student.surname}`}</p>
                  </div>

                  <div className={styles.right_block}>
                    <p>{student.percentage}%</p>
                    <ResultsBar percentage={student.percentage} width="64px" />
                  </div>
                </div>
              );
            })}

            <img src={chevronIcon} onClick={() => onNavigate('students')} />
          </div>
        </div>

        <div className={styles.questions}>
          <div className={styles.header}>
            <p className={styles.title}>{t('questions')}</p>

            <div className={styles.download_results_lg}>
              <Button
                style="white"
                margin="0"
                padding="8px 16px"
                fontSize="16px"
                width="fit-content"
                onClick={onDownloadClick}
              >
                <img src={downloadIcon} alt="" />
                <p style={{ color: '#6444f4' }}>{t('download_results')}</p>
              </Button>
            </div>
          </div>

          <div className={styles.virtual_scroll}>
            <div className={styles.total_padding} />
            <div className={styles.scrollable_content}>
              {questions.map((question: any, index: number) => (
                <ConditionSwitch value={question.type}>
                  <SingleChoice
                    switchCase="single_choice"
                    index={index + 1}
                    question={question}
                    page="summary"
                    circleValue={getQuestionAverage(question.question)}
                  />

                  <MultiChoice
                    switchCase="multiple_choice"
                    index={index + 1}
                    question={question}
                    page="summary"
                    circleValue={getQuestionAverage(question.question)}
                  />

                  <FillIn
                    switchCase="fill_in"
                    index={index + 1}
                    question={question}
                    page="summary"
                    circleValue={getQuestionAverage(question.question)}
                  />

                  <Open
                    switchCase="opened"
                    index={index + 1}
                    question={question}
                    page="summary"
                    circleValue={getQuestionAverage(question.question)}
                  />

                  <Matching
                    switchCase="matching"
                    index={index + 1}
                    question={question}
                    page="summary"
                    circleValue={getQuestionAverage(question.question)}
                  />
                </ConditionSwitch>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.download_results_xs}>
        <Button style="white" margin="0" padding="8px 16px" fontSize="16px" width="fit-content">
          <img src={downloadIcon} alt="" />
          <p style={{ color: '#6444f4' }}>{t('download_results')}</p>
        </Button>
      </div>
    </>
  );
};

export default Summary;
