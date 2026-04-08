import { useState } from 'react';

import styles from './Tooltip.module.scss';

import type { FC, ReactNode } from 'react';

interface TooltipProps {
  text: string | ReactNode;
  children: ReactNode;
}

const Tooltip: FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <div className={styles.tooltipContent}>{text}</div>}
    </div>
  );
};

export default Tooltip;
