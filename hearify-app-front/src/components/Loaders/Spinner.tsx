import styles from '@src/components/Loaders/Spinner.module.scss';

type SpinnerProperties = {
  condition: boolean | undefined;
  children?: any;
};

const Spinner = ({ condition, children }: SpinnerProperties) => {
  const smallCircleStyle = {
    strokeDasharray: '38.7044px',
    strokeDashoffset: '19.3522px',
    stroke: '#ffffff',
    strokeWidth: '10%',
  };

  return condition ? (
    <>{children}</>
  ) : (
    <div className={styles.root}>
      <div className={styles.determinate}>
        <svg xmlns="http://www.w3.org/2000/svg" focusable="false" viewBox="0 0 14.552 14.552">
          <circle
            cx="50%"
            cy="50%"
            style={{
              strokeDasharray: '38.7044px',
              strokeWidth: '10%',
            }}
            r="6.16"
          />
        </svg>
      </div>
      <div className={styles.indeterminate}>
        <div className={styles.spinner_layer}>
          <div className={styles.progress_circle}>
            <svg xmlns="http://www.w3.org/2000/svg" focusable="false" viewBox="0 0 14.552 14.552">
              <circle cx="50%" cy="50%" style={smallCircleStyle} r="6.16" />
            </svg>
          </div>
          <div className={styles.progress_gap}>
            <svg xmlns="http://www.w3.org/2000/svg" focusable="false" viewBox="0 0 14.552 14.552">
              <circle cx="50%" cy="50%" style={smallCircleStyle} r="6.16" />
            </svg>
          </div>
          <div className={styles.progress_clipper}>
            <svg xmlns="http://www.w3.org/2000/svg" focusable="false" viewBox="0 0 14.552 14.552">
              <circle cx="50%" cy="50%" style={smallCircleStyle} r="6.16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
