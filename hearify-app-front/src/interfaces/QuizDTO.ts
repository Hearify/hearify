export interface QuizDTO {
  id: string;
  minutes: number;
  class_code: string;
  user_id: string;
  name: string;
  questions: string[];
  settings: Settings;
}

export interface Settings {
  show_leaderboard: boolean;
  show_answers: boolean;
  is_public: boolean;
}
