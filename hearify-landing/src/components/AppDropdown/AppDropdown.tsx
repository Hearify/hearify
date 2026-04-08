import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';

import ArrowUp from '@/assets/icons/chevron-up.svg';
import ArrowDown from '@/assets/icons/chevron-down.svg';
import styles from './AppDropdown.module.scss';

export type AppDropdownProps = {
  icon?: React.ReactNode;
  title: string;
  content: string;
};

// TODO(Sasha): Add rotation animation to arrow
const AppDropdown: React.FC<AppDropdownProps> = ({
  icon, //
  content,
  title,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!contentRef.current) return;
    contentRef.current.style.maxHeight = isOpen ? `${contentRef.current.scrollHeight}px` : '';
  }, [isOpen]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
    <div className={styles.wrapper} role="button" onClick={handleClick}>
      <div className={cn(styles.header, [icon && styles.headerIcon])}>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.title}>{title}</span>
        <span className={styles.arrow}>{isOpen ? <ArrowUp /> : <ArrowDown />}</span>
      </div>
      <div className={styles.content} ref={contentRef}>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default AppDropdown;
