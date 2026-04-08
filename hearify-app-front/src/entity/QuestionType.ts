export enum QuestionType {
  SingleChoice = 'Single choice',
  MultipleChoice = 'Multiple choice',
  FillIn = 'Fill in',
  Matching = 'Matching',
  Open = 'Open',
}

export enum QuestionTypeDB {
  SingleChoice = 'single_choice',
  MultipleChoice = 'multiple_choice',
  FillIn = 'fill_in',
  Matching = 'matching',
  Open = 'opened',
}

export function mapTypeToDB(type: QuestionType) {
  for (const val in QuestionType) {
    // @ts-ignore
    if (type === QuestionType[val]) {
      // @ts-ignore
      return QuestionTypeDB[val];
    }
  }
}
