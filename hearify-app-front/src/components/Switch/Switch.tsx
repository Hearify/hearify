import styles from '@src/components/Switch/Switch.module.scss';
import { FC } from 'react';

type SwitchProps = {
  value: boolean;
  switchCase?: any;
  onClick: () => void;
};

const Switch: FC<SwitchProps> = ({ value, onClick }) => {
  return (
    <div className={`${styles.container} ${value ? styles.active : ''}`} onClick={onClick}>
      <div className={styles.inner} />
    </div>
  );
};

export default Switch;
