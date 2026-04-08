import type { QuestionType } from '@src/entity/QuestionType.ts';

export class Question {
  _id: string;

  type: string;

  question: string;

  answers: Array<any>;

  constructor(id: string, type: QuestionType, question: string, answers: Array<any>) {
    this._id = id;
    this.type = type;
    this.question = question;
    this.answers = answers;
  }
}
