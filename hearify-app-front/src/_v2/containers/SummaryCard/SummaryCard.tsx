import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgressbar } from 'react-circular-progressbar';

import styles from './SummaryCard.module.scss';

type SummaryCardProps = {
  data: any;
  value?: number;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ data, value = 89 }) => {
  const { t } = useTranslation('general');

  return (
    <li className={styles.wrapper}>
      <div className={styles.container}>
        <h4 className={styles.title}>{data.name}</h4>
        <div className={styles.box}>
          <p className={styles.text}>
            {data.questions.length} {t('questions_label_2')}
          </p>
          <p className={styles.text}>
            {data.members.length}
            {t('members_passed_the_quiz')}
          </p>
        </div>
        <p className={styles.date}>{data.date}</p>
      </div>
      <CircularProgressbar //
        value={value}
        text={`${value}%`}
        background
        className={styles.progressBar}
      />
    </li>
  );
};

export default SummaryCard;
