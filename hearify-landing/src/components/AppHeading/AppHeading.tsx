import React from 'react';
import Image from 'next/image';
import cn from 'classnames';

import LineImg from '@/assets/images/line.png';
import styles from './AppHeading.module.scss';

export type AppHeaderProps = {
  variant: 'h1' | 'h2' | 'h3';
  className?: string;
  children: React.ReactNode;
};

const AppHeading: React.FC<AppHeaderProps> = ({
  variant, //
  className,
  children,
}) => {
  const HeaderTag = variant;

  const combinedClassName = cn(
    styles.wrapper, //
    styles[`wrapper--${variant}`],
    className,
  );

  return (
    <HeaderTag className={combinedClassName}>
      <span className={styles.container}>
        <Image src={LineImg} alt="Header background line" fill className={styles.image} />
        {children}
      </span>
    </HeaderTag>
  );
};

export default AppHeading;
