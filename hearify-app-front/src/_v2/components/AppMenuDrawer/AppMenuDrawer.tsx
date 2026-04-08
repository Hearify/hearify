import React, { useState } from 'react';
import cn from 'classnames';

import useNoScroll from '@v2/hooks/useNoScroll';
import './AppMenuDrawer.scss';
import AppButton from '@v2/components/AppButton/AppButton';

type AppDrawerProps = {
  children: React.ReactNode;
};

const AppMenuDrawer: React.FC<AppDrawerProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  useNoScroll(isMenuOpen);

  return (
    <>
      <AppButton variant="secondary" iconButton onClick={toggleMenu}>
        <div
          aria-label="Burger menu button"
          className={cn('AppMenuDrawer__hamburger', isMenuOpen && 'AppMenuDrawer__hamburger--active')}
        >
          <span className="AppMenuDrawer__bar" />
          <span className="AppMenuDrawer__bar" />
          <span className="AppMenuDrawer__bar" />
        </div>
      </AppButton>

      <div className={cn('AppMenuDrawer', isMenuOpen && 'AppMenuDrawer--active')}>
        <div className="AppMenuDrawer__content">{children}</div>
      </div>

      <div className={cn('AppMenuDrawer__overlay', isMenuOpen && 'AppMenuDrawer__overlay--active')} />
    </>
  );
};

export default AppMenuDrawer;
