import React from 'react';
import cn from 'classnames';

import './AppButton.scss';
import Spinner from '@src/components/Loaders/Spinner';

export type AppButtonProps = {
  variant?: 'primary' | 'secondary' | 'gradient' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
  width?: string;
  iconButton?: boolean;
  disabled?: boolean;
  block?: boolean;
  id?: string;
  style?: React.CSSProperties;
  loading?: boolean;
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
  iconButton,
  block,
  id,
  loading,
  style,
  onClick,
}) => {
  const className: string = cn(
    'AppButton', //
    `AppButton--${variant}`,
    `AppButton--${size}`,
    block && 'AppButton--block',
    disabled && 'AppButton--disabled',
    iconButton && 'AppButton--icon'
  );

  // TODO(Sasha): Add custom spinner
  return (
    <button type={type} id={id} className={className} disabled={disabled} onClick={onClick} style={{ width, ...style }}>
      <Spinner condition={!loading}>{children}</Spinner>
    </button>
  );
};

export default AppButton;
