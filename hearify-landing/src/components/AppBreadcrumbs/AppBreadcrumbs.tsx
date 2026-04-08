import React from 'react';
import Link from 'next/link';
import cn from 'classnames';

import ArrowIcon from '@/assets/icons/chevron-right.svg';
import styles from './AppBreadcrumbs.module.scss';

export type BreadcrumbItem = {
  text: string;
  href: string;
};

export type AppBreadcrumbsProps = {
  items: BreadcrumbItem[];
};

// TODO(Sasha): Fix breadcrumbs having the same key
const AppBreadcrumbs: React.FC<AppBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className={styles.wrapper} aria-label="breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <>
            {index !== items.length - 1 ? (
              <li key={item.text} className={cn(styles.item, styles.itemActive)}>
                <Link href={item.href}>{item.text}</Link>
              </li>
            ) : (
              <li key={item.text} className={styles.item}>
                {item.text}
              </li>
            )}

            <li className={styles.item}>{index < items.length - 1 && <ArrowIcon />}</li>
          </>
        ))}
      </ol>
    </nav>
  );
};

export default AppBreadcrumbs;
