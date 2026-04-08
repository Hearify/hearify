import type { Question } from '@src/entity/Question';

export class Quiz {
  id: string;

  name: string;

  questions: Array<Question>;

  classCode: string;

  picture_id: string;

  createdAt: Date;

  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    questions: Array<Question>,
    classCode: string,
    picture_id: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.questions = questions;
    this.classCode = classCode;
    this.picture_id = picture_id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
