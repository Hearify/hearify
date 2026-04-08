import useScrollCountPaginationDelegate, { ScrollCountPaginationPayload } from '@src/api/ScrollCountPaginationDelegate';
import axios from '@src/api/axios';
import { networkCourseToCourseMapper } from '@src/api/response/NetworkCourseToCourseMapper';
import { SortType } from '@src/entity/SortType';
import usePageCountPaginationDelegate from '@src/api/PageCountPaginationDelegate';

import type { NetworkCourse } from '@src/api/response/entity/NetworkCourse';
import type { NetworkPage } from '@src/api/response/entity/NetworkPage';

export const useQuizzesServiceApi = (startPage: number, pageSize: number, sortType: SortType = SortType.Desc) =>
  useScrollCountPaginationDelegate(
    startPage,
    new ScrollCountPaginationPayload(pageSize, sortType),
    (lastItemPosition, payload) =>
      axios.get<NetworkPage<NetworkCourse>>(
        `/api/quizzes/my?limit=${payload.pageSize}&skip=${lastItemPosition}&sort=${payload.sortType}`
      ),
    (item) => networkCourseToCourseMapper(item)
  );

export const usePageQuizzesServiceApi = (startPage: number, pageSize: number, sortType: SortType = SortType.Desc) =>
  usePageCountPaginationDelegate(
    startPage,
    new ScrollCountPaginationPayload(pageSize, sortType),
    (lastItemPosition, payload) =>
      axios.get<NetworkPage<NetworkCourse>>(
        `/api/quizzes/my?limit=${payload.pageSize}&skip=${lastItemPosition}&sort=${payload.sortType}`
      ),
    (item) => networkCourseToCourseMapper(item)
  );
