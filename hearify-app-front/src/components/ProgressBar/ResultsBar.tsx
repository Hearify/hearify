import styles from '@src/components/ProgressBar/ResultsBar.module.scss';

type ResultsBarProps = {
  percentage: number;
  width: string;
  color?: string;
};

const ResultsBar = ({ percentage, width, color }: ResultsBarProps) => {
  return (
    <div className={styles.bar} style={{ width: `${width}` }}>
      <div style={{ width: `${percentage}%`, maxWidth: `${width}`, backgroundColor: color || '#6444f4' }} />
    </div>
  );
};

export default ResultsBar;
