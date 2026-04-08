import React from 'react';
import cn from 'classnames';

import styles from './AppButton.module.scss';

export type AppButtonProps = {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  width?: string;
  disabled?: boolean;
  block?: boolean;
  onClick?: () => void;
};

/* eslint-disable react/button-has-type */
const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary', //
  size = 'md',
  type = 'button',
  children,
  width,
  disabled,
  block,
  onClick,
}) => {
  const className: string = cn(
    styles.AppButton, //
    styles[`AppButton--${variant}`],
    styles[`AppButton--${size}`],
    block && styles['AppButton--block'],
    disabled && styles['AppButton--disabled'],
  );

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick} style={{ width }}>
      {children}
    </button>
  );
};

export default AppButton;
