import React from 'react';
import cn from 'classnames';
import Link from 'next/link';

import styles from './AppButtonLink.module.scss';

export type AppButtonLinkProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href: string;
  width?: string;
  disabled?: boolean;
  target?: string;
  block?: boolean;
  className?: string;
  onClick?: () => void;
};

/* eslint-disable react/button-has-type */
const AppButtonLink: React.FC<AppButtonLinkProps> = ({
  variant = 'primary', //
  size = 'md',
  children,
  width,
  disabled,
  href,
  target,
  block,
  className,
  onClick,
}) => {
  const combinedClassName: string = cn(
    styles.AppButton, //
    styles[`AppButton--${variant}`],
    styles[`AppButton--${size}`],
    block && styles['AppButton--block'],
    disabled && styles['AppButton--disabled'],
    className,
  );

  return (
    <Link href={href} target={target} className={combinedClassName} onPointerDown={onClick} style={{ width }}>
      {children}
    </Link>
  );
};

export default AppButtonLink;
