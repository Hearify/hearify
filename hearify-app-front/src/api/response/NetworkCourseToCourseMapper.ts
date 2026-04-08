import { Quiz } from '@src/entity/Quiz';

import type { NetworkCourse } from '@src/api/response/entity/NetworkCourse';

export function networkCourseToCourseMapper(networkCourse: NetworkCourse): Quiz {
  return new Quiz(
    networkCourse._id,
    networkCourse?.name?.length > 0 ? networkCourse.name : 'Unnamed Quiz', // TODO: Add translate
    networkCourse.questions,
    networkCourse.class_code,
    networkCourse.picture_id,
    new Date(networkCourse.created_at),
    new Date(networkCourse.updated_at)
  );
}
