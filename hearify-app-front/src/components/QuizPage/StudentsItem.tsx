import styles from '@src/components/QuizPage/Students.module.scss';
import { ChevronRightIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import ResultsBar from '../ProgressBar/ResultsBar';
import AppButton from '@src/_v2/components/AppButton/AppButton';

type StudentsItemTypes = {
  id: string;
  rank: number;
  name: string;
  percentage: number;
  score: string;
  is_registered: boolean;
  process_id: string;
  onClick: (data: Object) => void;
  onDownloadClick: (id: string, name: string) => void;
};

const StudentsItem = ({
  id,
  rank,
  name,
  percentage,
  score,
  is_registered,
  process_id,
  onClick,
  onDownloadClick,
}: StudentsItemTypes) => {
  const { t } = useTranslation('general');

  const handleShowMoreClick = (): void => {
    onClick({ id, name, rank, is_registered, process_id });
  };
  const handleDownloadClick = (): void => {
    onDownloadClick(process_id, name);
  };

  return (
    <div className={styles.table_item} onClick={handleShowMoreClick}>
      <div className={styles.table_cell}>{rank}</div>
      <div className={styles.table_cell}>
        <p className={styles.name}>{name}</p>
      </div>
      <div className={styles.table_cell_percentage}>
        <p>{percentage}%</p>
        <ResultsBar percentage={percentage} width="295px" />
      </div>
      <div className={styles.table_cell}>
        <p>{score}</p>
        <ArrowUpTrayIcon className={styles.uploadBtn} onClick={handleDownloadClick} />
        <AppButton size="sm" variant="tertiary" onClick={handleShowMoreClick}>
          <span className={styles.showMore}>{t('show_more_btn')}</span>
          <ChevronRightIcon />
        </AppButton>
      </div>
    </div>
  );
};

export default StudentsItem;
