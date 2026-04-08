import React from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import './AppButtonLink.scss';

export type AppButtonLinkProps = {
  variant?: 'primary' | 'secondary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  href: string;
  width?: string;
  disabled?: boolean;
  target?: string;
  block?: boolean;
  className?: string;
  id?: string;
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
  id,
  onClick,
}) => {
  const combinedClassName: string = cn(
    'AppButton', //
    `AppButton--${variant}`,
    `AppButton--${size}`,
    block && 'AppButton--block',
    disabled && 'AppButton--disabled',
    className
  );

  return (
    <Link to={href} target={target} id={id} className={combinedClassName} onPointerDown={onClick} style={{ width }}>
      {children}
    </Link>
  );
};

export default AppButtonLink;
