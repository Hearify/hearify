import SideNavigation from '@src/components/SideNavigation/SideNavigation';
import DashboardHeader from '@src/components/DashboardHeader/DashboardHeader';
import styles from './LayoutSideNavigation.module.scss';

import type { ReactNode } from 'react';

const LayoutSideNavigation = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.layout}>
      <SideNavigation />

      <div className={styles.main}>
        <div className={styles.header}>
          <DashboardHeader />
        </div>

        {children}
      </div>
    </div>
  );
};

export default LayoutSideNavigation;
