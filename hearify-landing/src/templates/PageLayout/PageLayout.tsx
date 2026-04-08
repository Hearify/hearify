import React, { useEffect, useState } from 'react';
import cn from 'classnames';

import styles from './PageLayout.module.scss';
import PageHeader from './PageHeader/PageHeader';
import PageFooter from './PageFooter/PageFooter';

export type PageLayoutProps = {
  children: React.ReactNode;
};

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [isScrolling, setIsScrolling] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = (): void => {
      setIsScrolling(window.scrollY > 50);
    };

    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <header className={cn(styles.header, isScrolling && styles.headerScroll)}>
        <PageHeader />
      </header>

      <div className={styles.container}>
        <div className={styles.body}>{children}</div>
      </div>

      <footer className={styles.footer}>
        <PageFooter />
      </footer>
    </div>
  );
};

export default PageLayout;
