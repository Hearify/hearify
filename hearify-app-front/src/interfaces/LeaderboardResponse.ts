import type { User } from '@src/interfaces/User';

export interface LeaderboardResponse {
  user: User;
  correct_answers: number;
  questions: number;
  process_id?: string;
}
