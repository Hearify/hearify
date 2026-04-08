import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/QuizPage/Student.module.scss';
import axios from '@src/api/axios';
import correctIcon from '@src/assets/images/correct_answers.svg';
import correctGreenIcon from '@src/assets/images/correct_answer_green.svg';
import incorrectRedIcon from '@src/assets/images/incorrect_answer_red.svg';
import incorrectIcon from '@src/assets/images/incorrect_answers.svg';
import trophyIcon from '@src/assets/images/trophy.svg';
import timeIcon from '@src/assets/images/time.svg';
import timeSpentIcon from '@src/assets/images/time_spent.svg';
import calendarIcon from '@src/assets/images/calendar.svg';
import firstPlaceIcon from '@src/assets/images/first_place.svg';
import secondPlaceIcon from '@src/assets/images/second_place.svg';
import thirdPlaceIcon from '@src/assets/images/third_place.svg';
import arrowLeft from '@src/assets/images/arrow-left.svg';
import { formatSecondsIntoTime } from '@src/util/formatTime';
import { formatDate, formatTime } from '@src/util/date';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import { Button } from '@src/components/Button/Button.tsx';
import uploadIcon from '@src/assets/images/upload-icon-sm.svg';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal.ts';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal.tsx';
import downloadFile from '@src/util/downloadFile.ts';
import ResultsBar from '../ProgressBar/ResultsBar';

type StudentProps = {
  switchCase?: string;
  id: string;
  rank: number;
  name: string;
  is_registered: boolean;
  process_id: string;
  onClick: () => void;
};

const Student = ({ id, process_id, name, rank, is_registered, onClick }: StudentProps) => {
  const { t } = useTranslation('general');

  const { classCode } = useParams();
  const [statistics, setStatistics] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [resultsBlob, setResultsBlob] = useState('');

  const downloadModal = useConfirmationModal();

  const { answers } = statistics;

  const getIndex = () => {
    switch (rank) {
      case 1:
        return <img src={firstPlaceIcon} />;
      case 2:
        return <img src={secondPlaceIcon} />;
      case 3:
        return <img src={thirdPlaceIcon} />;
    }
  };

  const getStudent = () => {
    if (is_registered) {
      axios.get(`/api/quizzes/${classCode}/${id}/statistics`).then((res) => {
        setStatistics(res.data.quiz_result);
        setIsLoading(false);
      });
    } else {
      axios.get(`/api/public/${classCode}/${id}/statistics`).then((res) => {
        setStatistics(res.data.quiz_result);
        setIsLoading(false);
      });
    }
  };

  useEffect(getStudent, [id]);

  const onDownloadClick = async () => {
    await axios.get(`/api/csv-loader/${classCode}/csv/${process_id}`, { responseType: 'blob' }).then((res) => {
      setResultsBlob(res.data);
      downloadModal.openModal();
    });
  };

  const onDownloadConfirm = () => {
    downloadFile(new Blob([resultsBlob]), `${name}-Results.csv`);
    downloadModal.closeModal();
  };

  return isLoading ? (
    <LoadingPage />
  ) : (
    <div className={styles.container}>
      {downloadModal.isModalOpened && (
        <ConfirmationModal
          message={t('download_results?')}
          onConfirm={onDownloadConfirm}
          onClose={downloadModal.closeModal}
        />
      )}

      <div className={styles.header}>
        <img src={arrowLeft} onClick={onClick} />
        {t('results')}
      </div>

      <div className={styles.cards_container}>
        <div className={styles.card}>
          <p className={styles.name}>
            {name} {getIndex()}
          </p>

          <div className={styles.bar_container}>
            <p>
              {t('general_score')} {Math.round(statistics.general_score * 100)}%
            </p>
            <ResultsBar percentage={Math.round(statistics.general_score * 100)} width="295px" />
          </div>

          <Button
            style="white"
            padding="8px 16px"
            fontSize="16px"
            width="fit-content"
            textColor="#15343a"
            margin="0"
            onClick={onDownloadClick}
          >
            <img src={uploadIcon} />
            EXPORT TO EXCEL
          </Button>
        </div>

        <div className={styles.card}>
          <p className={styles.title}>{t('results')}</p>

          <div className={styles.info_block}>
            <img src={correctIcon} />
            <p className={styles.text}>{t('correct_answers')}</p>
            <p>{statistics.number_of_correct_answers}</p>
          </div>
          <div className={styles.info_block}>
            <img src={incorrectIcon} />
            <p className={styles.text}>{t('incorrect_answers')}</p>
            <p>{statistics.number_of_incorrect_answers}</p>
          </div>
          <div className={styles.info_block}>
            <img src={trophyIcon} />
            <p className={styles.text}>{t('total_score')}</p>
            <p>{statistics.total_score}</p>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.title}>{t('time')}</p>

          <div className={styles.info_block}>
            <img src={timeSpentIcon} />
            <p>{t('total_time')}</p>
            <p>{formatSecondsIntoTime(statistics.time_spent)}</p>
          </div>
          <div className={styles.info_block}>
            <img src={calendarIcon} />
            <p>{t('date')}</p>
            <p>{formatDate(statistics.date_and_time)}</p>
          </div>
          <div className={styles.info_block}>
            <img src={timeIcon} />
            <p>{t('time')}</p>
            <p>{formatTime(statistics.date_and_time)}</p>
          </div>
        </div>
      </div>

      <div className={styles.answers_container}>
        <p className={styles.title}>{t('answers')}</p>

        <div className={styles.header_row}>
          <p>№</p>
          <p>{t('question')}</p>
          <p>{t('answers')}</p>
          <p>{t('points')}</p>
        </div>
        {answers.map((answer: any, index: number) => {
          if (Array.isArray(answer.answer)) {
            return (
              <div className={styles.row}>
                <p id={styles.index}>{index + 1}</p>
                <p id={styles.question}>{answer.question_text}</p>
                <div className={styles.answer}>
                  <img src={answer.is_correct ? correctGreenIcon : incorrectRedIcon} />
                  {answer.answer.map((item: any, index: number) =>
                    answer.answer.length > 2 ? `${index + 1}. ${item.text} : ${item.answer} \n` : ` ${item}. `
                  )}
                  <br />
                </div>
                <p> {answer.answer.length > 2 ? 4 : 1}</p>
              </div>
            );
          }

          return (
            <div className={styles.row}>
              <p id={styles.index}>{index + 1}</p>
              <p id={styles.question}>{answer.question_text}</p>
              <div className={styles.answer}>
                <img src={answer.is_correct ? correctGreenIcon : incorrectRedIcon} /> {answer.answer}
              </div>
              <p>{answer.is_correct ? 1 : 0}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Student;
