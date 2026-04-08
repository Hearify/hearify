import { useEffect, useState } from 'react';

import type { AxiosResponse } from 'axios';
import type { NetworkPage } from '@src/api/response/entity/NetworkPage.ts';
import type { SortType } from '@src/entity/SortType.ts';

export default function useScrollCountPaginationDelegate<T, R, P extends ScrollCountPaginationPayload>(
  startPage: number,
  payload: P,
  request: (lastItemPosition: number, payload: P) => Promise<AxiosResponse<NetworkPage<T>>>,
  mapper: (item: T) => R
): [Array<R>, () => void, () => boolean, boolean] {
  const [lastLoadedItem, setLastLoadedItem] = useState<number>(startPage);
  const [allItemSize, setAllItemSize] = useState<number>(startPage);
  const [loadedItems, setLoadedItems] = useState<Array<R>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  function hasNextPage() {
    return lastLoadedItem < allItemSize;
  }

  async function loadPage() {
    if (isInitialLoading) {
      setIsLoading(true);
    }
    const response = await request(lastLoadedItem, payload);

    setLastLoadedItem(lastLoadedItem + response.data.data.length);
    setAllItemSize(response.data.count);
    setLoadedItems(loadedItems.concat(response.data.data.map(mapper)));
    setIsLoading(false);
    setIsInitialLoading(false);
  }

  async function safeLoadPage() {
    if (hasNextPage() && !isLoading) {
      loadPage();
    }
  }

  useEffect(() => {
    loadPage();
  }, []);

  return [loadedItems, safeLoadPage, hasNextPage, isLoading];
}

export class ScrollCountPaginationPayload {
  pageSize: number;

  sortType: SortType;

  constructor(pageSize: number, sortType: SortType) {
    this.pageSize = pageSize;
    this.sortType = sortType;
  }
}
