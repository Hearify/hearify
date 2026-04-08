import React from 'react';

import ResultsBar from '@src/components/ProgressBar/ResultsBar';
import styles from './SummaryProgress.module.scss';

type SummaryProgressProps = {
  data: any;
};

const SummaryProgress: React.FC<SummaryProgressProps> = ({ data }) => {
  return (
    <li className={styles.wrapper}>
      <div className={styles.icon}>{data.id}</div>
      <p className={styles.title}>{data.name}</p>
      <div>
        <p className={styles.text}>{data.percent}%</p>
        <ResultsBar percentage={data.percent} width="64px" />
      </div>
    </li>
  );
};

export default SummaryProgress;
