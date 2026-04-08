import type { Question } from '@src/entity/Question';

export interface NetworkCourse {
  _id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  class_code: string;
  name: string;
  picture_id: string;
  questions: Question[];
}
