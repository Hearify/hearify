import React, { Suspense } from 'react';
import cn from 'classnames';

import { iconMap } from './AppIcon.data';
import './AppIcon.scss';

type AppIconProps = {
  name: keyof typeof iconMap;
  className?: string;
  onClick?: () => void;
};

// TODO(Sasha): Switch to heroicons package
const AppIcon: React.FC<AppIconProps> = ({ name, className, onClick }) => {
  const SvgIcon = iconMap[name] as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

  if (!SvgIcon) return null;

  return (
    <Suspense>
      <SvgIcon className={cn('AppIcon', className)} onClick={onClick} />
    </Suspense>
  );
};

export default AppIcon;
