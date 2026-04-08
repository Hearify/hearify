import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';

import styles from '@src/components/pagination/PagePagination/Pagination.module.scss';

import type { ReactNode } from 'react';

interface PagePaginationProps {
  children: ReactNode;
  loadPage: () => void;
  hasNext: () => boolean;
  isButtonLoad?: boolean;
}

export const InfiniteScrollPagination = ({ children, loadPage, hasNext, isButtonLoad = true }: PagePaginationProps) => {
  const { t } = useTranslation('general');

  if (!isButtonLoad) {
    throw 'NotSupportedException isButtonLoad == false';
  }
  return (
    <div className={styles.root}>
      {children}
      <div className={styles.pagination} style={{}}>
        {hasNext() && isButtonLoad && (
          <Button variant="outlined" size="large" onClick={loadPage}>
            {t('load_more')}
          </Button>
        )}
      </div>
    </div>
  );
};
