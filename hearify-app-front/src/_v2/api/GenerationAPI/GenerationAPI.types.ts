export type GenerationType = 'text' | 'youtube' | 'file';

export type QuestionType = 'SingleChoice' | 'MultipleChoice' | 'FillInChoice' | 'Matching' | 'Open';

export type Question = {
  name: QuestionType;
  number_of_questions: string;
};

export type GenerateFileQuestionsRequest = {
  difficulty: string;
  language: string;
  additional_prompt?: string;
  question_types: Array<Question>;
  end_page: string;
  start_page: string;
};

export type GenerateYoutubeQuestionsRequest = {
  difficulty: string;
  language: string;
  additional_prompt?: string;
  question_types: Array<Question>;
  url: string;
  start_time: string;
  end_time: string;
};

export type GenerateTextQuestionsRequest = {
  difficulty: string;
  language: string;
  question_types: Array<Question>;
  text: string;
};

export type GenerateQuestionsResponse = {
  task_id: string;
  class_code: string;
};

export type GetYoutubeTimecodesResponse = {
  from: string;
  to: string;
};
