export interface Answer {
  text: string;
  correct: boolean;
}

export interface Question {
  question: string;
  type: string;
  answers: Answer[];
  options: string[];
  _id: string;
  created_at: string;
  updated_at: string;
}
