import client from '../client';

import type { Quiz, QuizQuestion } from '@v2/types/quiz';
import type { Member } from '@v2/types/user';

class QuizAPI {
  public static getQuiz = async (classCode: string): Promise<Quiz> => {
    const response = await client.get<Quiz>(`/api/quizzes/${classCode}`);

    return response.data;
  };

  public static getAllQuizzes = async (
    size: number,
    lastItemPosition: number = 0
  ): Promise<{ data: Quiz[]; count: number }> => {
    const response = await client.get<{ data: Quiz[]; count: number }>(
      `/api/quizzes/my?limit=${size}&skip=${lastItemPosition}&sort=desc`
    );

    return response.data;
  };

  public static changeQuizTitle = async (quizId: string, name: string): Promise<void> => {
    const formData = new FormData();
    formData.append('request_data', JSON.stringify({ name }));

    await client.patch(`/api/quizzes/${quizId}`, formData);
  };

  public static changeQuestions = async (quizId: string, questions: Record<string, QuizQuestion>): Promise<void> => {
    const formData = new FormData();
    formData.append('request_data', JSON.stringify({ questions }));

    await client.patch(`/api/quizzes/${quizId}`, formData);
  };

  public static deleteQuiz = async (quizId: string): Promise<void> => {
    await client.delete(`/api/quizzes/${quizId}`);
  };

  public static getQuizMembers = async (classCode: string): Promise<Member[]> => {
    const response = await client.get<Member[]>(`/api/quiz-members/${classCode}/get_members`);

    return response.data;
  };

  public static inviteMember = async (classCode: string, email: string): Promise<void> => {
    await client.post(`/api/quiz-members/${classCode}/add_member`, {
      email,
      role: 'editor',
    });
  };

  public static changeMemberRole = async (classCode: string, userId: number, newRole: string): Promise<void> => {
    await client.patch(`/api/quiz-members/${classCode}/change_member_role`, {
      user_id: userId,
      new_role: newRole,
    });
  };

  public static deleteMember = async (classCode: string, userId: number): Promise<void> => {
    await client.delete(`/api/quiz-members/${classCode}/${userId}/delete_member`);
  };
}

export default QuizAPI;
