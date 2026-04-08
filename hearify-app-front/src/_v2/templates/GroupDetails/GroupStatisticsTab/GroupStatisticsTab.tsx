import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import SummaryProgress from '@v2/containers/SummaryProgress/SummaryProgress';
import SummaryCard from '@v2/containers/SummaryCard/SummaryCard';
import styles from './GroupStatisticsTab.module.scss';

const GroupStatisticsTab: React.FC = () => {
  const { t } = useTranslation('general', { keyPrefix: 'templates.GroupStatisticsTab' });

  const data = [
    {
      name: 'English B1 Present Continuous',
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 34, 234, 325, 345],
      members: ['chichi', 'chacha', 'cheche'],
      date: '11/10/2023 15:28',
    },
    {
      name: 'English B1 Present Continuous',
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 34, 234, 325, 345],
      members: ['chichi', 'chacha', 'cheche'],
      date: '11/10/2023 15:28',
    },
    {
      name: 'English B1 Present Continuous',
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 34, 234, 325, 345],
      members: ['chichi', 'chacha', 'cheche'],
      date: '11/10/2023 15:28',
    },
    {
      name: 'English B1 Present Continuous',
      questions: [1, 2, 3, 4, 5, 6, 7, 8, 34, 234, 325, 345],
      members: ['chichi', 'chacha', 'cheche'],
      date: '11/10/2023 15:28',
    },
  ];

  const data2 = [
    {
      id: 1,
      name: 'Cody Fisher',
      percent: 14,
    },
    {
      id: 2,
      name: 'Bessie Cooper',
      percent: 24,
    },
    {
      id: 3,
      name: 'Bessie Cooper',
      percent: 70,
    },
  ];

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.topBox}>
          <h3 className={styles.title}>{t('quizzes-score')}</h3>
          <p className={styles.date}>{t('created')} 4/11/2024</p>
          <div className={styles.content}>
            <CircularProgressbar //
              text={`${89}%`}
              value={89}
              background
              className={styles.progressBar}
            />
            <div className={styles.textWrapper}>
              <p className={styles.text}>{t('students-number')} 41</p>
              <p className={styles.text}>{t('questions-number')} 11</p>
            </div>
          </div>
        </div>

        <div className={styles.botBox}>
          <h3 className={styles.secondTitle}>{t('students')}</h3>
          <ul className={styles.list}>
            {data2.map((item) => (
              <SummaryProgress data={item} />
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.rightBox}>
        <h3 className={styles.thirdTitle}>{t('quizzes')}</h3>
        <ul className={styles.list}>
          {data.map((item) => (
            <SummaryCard data={item} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default GroupStatisticsTab;
