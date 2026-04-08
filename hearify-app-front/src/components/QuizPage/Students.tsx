import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from '@src/components/QuizPage/Students.module.scss';
import axios from '@src/api/axios';
import { calculatePercentage } from '@src/util/user';
import backIcon from '@src/assets/images/chevron_left.svg';
import errorIcon from '@src/assets/images/results_error.svg';
import sortIcon from '@src/assets/images/chevron-down.svg';
import LoadingPage from '@src/pages/LoadingPage/LoadingPage';
import MessageBlock from '@src/components/MessageBlock/MessageBlock';
import { useConfirmationModal } from '@src/hooks/useConfirmationModal';
import downloadFile from '@src/util/downloadFile';
import ConfirmationModal from '@src/components/ConfirmationModal/ConfirmationModal';
import StudentsItem from './StudentsItem';
import { useAuthStore } from '@src/store/auth';
import usePermission from '@v2/hooks/usePermission';

import type { LeaderboardResponse } from '@src/interfaces/LeaderboardResponse';

type StudentsProps = {
  switchCase?: string;
  classCode: string;
  onClick: (data: Object) => void;
};

const Students = ({ classCode, onClick }: StudentsProps) => {
  const { t } = useTranslation('general');

  const navigate = useNavigate();

  const { cannot, openPermissionModal } = usePermission();

  const [students, setStudents] = useState<Array<any>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getStudents = async (limit: number, skip: number) => {
    let students = [];
    try {
      const res = await axios.get(`/api/quizzes/${classCode}/leaderboard?limit=${limit}&skip=${skip}`);

      students = res.data.leaderboard.map((leaderboardResponse: LeaderboardResponse) => {
        return {
          id: leaderboardResponse.user.id,
          first_name: leaderboardResponse.user.first_name,
          surname: leaderboardResponse.user.surname ? leaderboardResponse.user.surname : '',
          percentage: calculatePercentage(leaderboardResponse.correct_answers, leaderboardResponse.questions),
          correctAnswers: leaderboardResponse.correct_answers,
          questionsCount: leaderboardResponse.questions,
          is_registered: leaderboardResponse.user.is_registered,
          process_id: leaderboardResponse.process_id,
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

  useEffect(() => {
    getStudents(100, 1);
  }, []);

  const [resultsBlob, setResultsBlob] = useState('');
  const [fileName, setFileName] = useState('');
  const downloadModal = useConfirmationModal();

  const onDownloadClick = async (processId: string, name: string) => {
    if (cannot('export-student-results-pdf')) {
      openPermissionModal('export-student-results-pdf');
      return;
    }

    await axios.get(`/api/csv-loader/${classCode}/pdf/${processId}`, { responseType: 'blob' }).then((res) => {
      setResultsBlob(res.data);
      setFileName(`${name}-Results.pdf`);
      downloadModal.openModal();
    });
  };

  const onDownloadConfirm = () => {
    downloadFile(new Blob([resultsBlob]), fileName);
    downloadModal.closeModal();
  };

  return isLoading ? (
    <LoadingPage />
  ) : !students.length ? (
    <MessageBlock
      style={{ marginTop: '100px' }}
      image={errorIcon}
      message={t('no_results_message')}
      onClick={() => navigate('/quizzes')}
    >
      <img src={backIcon} />
      {t('go_back_to_library').toUpperCase()}
    </MessageBlock>
  ) : (
    <div className={styles.table}>
      {downloadModal.isModalOpened && (
        <ConfirmationModal
          message={t('download_results?')}
          onConfirm={onDownloadConfirm}
          onClose={downloadModal.closeModal}
        />
      )}

      <div className={styles.table_header}>
        <div className={styles.header_cell}>
          {t('rank')}
          <img src={sortIcon} alt="" />
        </div>
        <div className={styles.header_cell}>
          {t('name')}
          <img src={sortIcon} alt="" />
        </div>
        <div className={styles.header_cell}>
          {t('correct_answers')}
          <img src={sortIcon} alt="" />
        </div>
        <div className={styles.header_cell}>
          {t('total_score')}
          <img src={sortIcon} alt="" />
        </div>
      </div>

      <div className={styles.virtual_scroll}>
        <div className={styles.scrollable_content}>
          {students.map((student, index) => (
            <StudentsItem
              key={student.id}
              id={student.id}
              rank={index + 1}
              name={`${student.first_name} ${student.surname}`}
              percentage={student.percentage}
              score={`${student.correctAnswers}/${student.questionsCount}`}
              is_registered={student.is_registered}
              process_id={student.process_id}
              onClick={onClick}
              onDownloadClick={onDownloadClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Students;
