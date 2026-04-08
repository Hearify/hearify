export type UserQuizRole = 'owner' | 'editor' | 'viewer';

export type User = {
  id: number;
  email: string;
  first_name?: string;
  surname?: string;
  birthdate?: string;
  role: string;
  created_at: string;
  company: string;
  workplace: string;
  updated_at: string;
  subscription_id: string;
  enable_mailing: boolean;
  email_verified: boolean;
  credits: number;
};

export type Member = {
  role: UserQuizRole;
  user: User;
};
