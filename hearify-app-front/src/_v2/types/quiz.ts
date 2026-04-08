export type QuizGenerationType = 'file' | 'youtube' | 'text';

export type QuizBreakpoint = {
  min_score: number;
  max_score: number;
  message: string;
  description: string;
};

export type QuizSettings = {
  show_leaderboard: boolean;
  show_answers: boolean;
  is_public: boolean;
  minutes?: number;
  breakpoints?: QuizBreakpoint[];
};

export type QuizAnswer = {
  text: string;
  correct: boolean;
};

export type QuizQuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'fill_in'
  | 'opened'
  | 'matching'
  | 'special_single_choice';

export type QuizQuestion = {
  _id: string;
  type: QuizQuestionType;
  question: string;
  answers: Array<QuizAnswer>;
  picture_id?: string;
  is_required?: boolean;
};

export type Quiz = {
  _id: string;
  minutes: number;
  class_code: string;
  user_id: string;
  name: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  picture_id?: string;
  picture_path?: string;
  created_at: string;
};
