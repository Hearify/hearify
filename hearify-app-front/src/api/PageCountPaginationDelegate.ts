import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import type { NetworkPage } from '@src/api/response/entity/NetworkPage.ts';
import type { SortType } from '@src/entity/SortType.ts';

export default function usePageCountPaginationDelegate<T, R, P extends ScrollCountPaginationPayload>(
  startPage: number,
  payload: P,
  request: (lastItemPosition: number, payload: P) => Promise<AxiosResponse<NetworkPage<T>>>,
  mapper: (item: T) => R
): [Array<R>, (pageIndex: number) => void, () => number, () => number, isLoading: boolean] {
  const [loadedPages, setLoadedPages] = useState<Map<number, Array<R>>>(new Map());
  const [selectedPageItems, setSelectedPageItems] = useState<Array<R>>([]);
  const [selectedPage, setSelectedPage] = useState<number>(startPage);
  const [allPage, setAllPage] = useState<number>(startPage);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  async function loadPage(pageNumber: number) {
    setIsLoading(true);
    const response = await request(pageNumber * payload.pageSize, payload);

    setAllPage(calculateTotalPages(response.data.count, payload.pageSize));

    const newLoadedPages = loadedPages.set(pageNumber, response.data.data.map(mapper));
    updateSelectedPage(newLoadedPages, pageNumber);
    setIsLoading(false);
  }

  async function selectPage(pageIndex: number) {
    if (loadedPages.get(pageIndex)) {
      updateSelectedPage(loadedPages, pageIndex);
    }
    await loadPage(pageIndex);
  }

  function updateSelectedPage(loadpedPages: Map<number, Array<R>>, selectedPage: number) {
    setLoadedPages(loadpedPages);
    setSelectedPage(selectedPage);
    setSelectedPageItems(loadedPages.get(selectedPage) || []);
  }

  function calculateTotalPages(itemCount: number, pageSize: number): number {
    return Math.ceil(itemCount / pageSize);
  }

  useEffect(() => {
    selectPage(startPage);
  }, []);

  return [selectedPageItems, selectPage, () => selectedPage, () => allPage, isLoading];
}

export class ScrollCountPaginationPayload {
  pageSize: number;

  sortType: SortType;

  constructor(pageSize: number, sortType: SortType) {
    this.pageSize = pageSize;
    this.sortType = sortType;
  }
}
