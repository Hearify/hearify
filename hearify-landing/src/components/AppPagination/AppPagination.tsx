import React from 'react';
import cn from 'classnames';

import ArrowRightIcon from '@/assets/icons/chevron-right.svg';
import ArrowLeftIcon from '@/assets/icons/chevron-left.svg';
import usePagination from '../../hooks/usePagination';
import styles from './AppPagination.module.scss';

export type AlphaPaginationProps = {
  page: number;
  count: number;
  siblingCount?: number;
  showLastPage?: boolean;
  onChange: (page: number) => void;
};

/* eslint-disable react/no-array-index-key */
const AppPagination: React.FC<AlphaPaginationProps> = ({
  page,
  count,
  siblingCount,
  onChange,
  showLastPage = true,
}) => {
  const { paginationRange } = usePagination(page, count, siblingCount, showLastPage);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        aria-label="Previous page arrow"
        className={styles.button}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeftIcon />
      </button>

      {paginationRange.map((item, index) => {
        if (typeof item === 'string') {
          return (
            <span key={index} className={styles.dots}>
              {item}
            </span>
          );
        }

        return (
          <button
            key={index}
            type="button"
            className={cn(styles.page, page === item && styles.pageActive)}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="Next page arrow"
        className={styles.button}
        disabled={page === count}
        onClick={() => onChange(page + 1)}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
};

export default AppPagination;
