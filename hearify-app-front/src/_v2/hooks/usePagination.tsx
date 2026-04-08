import { useMemo } from 'react';

function getRange(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, index) => index + start);
}

const usePagination = (page: number, count: number, siblingCount: number = 1, showLastPage: boolean = true) => {
  const DOTS = '...';

  const paginationRange = useMemo<Array<string | number>>(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= count) {
      return getRange(1, count);
    }

    const leftSiblingIndex: number = Math.max(page - siblingCount, 1);
    const rightSiblingIndex: number = Math.min(page + siblingCount, count);

    const isLeftDotsVisible: boolean = leftSiblingIndex > 1 + 2;
    const isRightDotsVisible: boolean = rightSiblingIndex < count - 2;

    if (!isLeftDotsVisible && isRightDotsVisible) {
      const leftItemsCount: number = 3 + 2 * siblingCount;
      const leftRange = getRange(1, leftItemsCount);

      if (!showLastPage) return [...leftRange, DOTS];
      return [...leftRange, DOTS, count];
    }

    if (isLeftDotsVisible && !isRightDotsVisible) {
      const rightItemsCount = 3 + 2 * siblingCount;
      const rightRange = getRange(count - rightItemsCount + 1, count);
      return [1, DOTS, ...rightRange];
    }

    const middleRange = getRange(leftSiblingIndex, rightSiblingIndex);

    if (!showLastPage) return [1, DOTS, ...middleRange, DOTS];
    return [1, DOTS, ...middleRange, DOTS, count];
  }, [page, count, siblingCount]);

  return {
    paginationRange,
  };
};

export default usePagination;
