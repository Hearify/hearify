import React from 'react';

import styles from '@src/components/pagination/PagePagination/Pagination.module.scss';

import type { ReactNode } from 'react';

interface PagePaginationProps {
  children: ReactNode;
  loadPage: (pageNumber: number) => void;
  pageCount: number;
  selectedPage?: number;
}

const PagePagination = ({ children, loadPage, pageCount, selectedPage = 1 }: PagePaginationProps) => {
  return (
    <div className={styles.root}>
      {children}
      <div className={styles.parentHorizontalConstraintContainer}>
        <div className={styles.bottomConstraintContainer}>
          <div className={styles.pagination}>
            {generatePaginationIndexes(pageCount, selectedPage).map((index) => (
              <div
                className={`${styles.pagination_item} ${index - 1 === selectedPage ? styles.active : ''}`}
                key={index}
                onClick={() => loadPage(index - 1)}
              >
                {index}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function generatePaginationIndexes(totalPages: number, selectedPage: number): number[] {
  const maxPagesToShow = 5;
  const halfMaxPages = Math.floor(maxPagesToShow / 2);

  let startPage = Math.max(1, selectedPage - halfMaxPages);
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
}

export default PagePagination;
