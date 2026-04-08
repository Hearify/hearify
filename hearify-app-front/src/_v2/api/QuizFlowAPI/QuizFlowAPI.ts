import client from '../client';

class QuizFlowAPI {
  public static startQuiz = async (classCode: string, username?: string): Promise<string> => {
    const url: string = username
      ? `/api/public/quiz-process/${classCode}/${username}`
      : `/api/quiz-process/${classCode}`;

    const response = await client.post<{ process_id: string }>(url);
    return response.data.process_id;
  };

  public static submitAnswer = async (
    questionId: string,
    processId: string,
    answerIndex: number,
    answer: string | string[] | { text: string; answer: string }[]
  ): Promise<boolean> => {
    const response = await client.patch<{ is_correct: boolean }>(`/api/quiz-process/${processId}`, {
      answer,
      question_id: questionId,
      answer_index: answerIndex,
    });

    return response.data.is_correct;
  };

  public static submitQuiz = async (processId: string, authorized: boolean): Promise<void> => {
    const url = authorized
      ? `/api/quiz-process/${processId}/submit` //
      : `/api/public/quiz-process/${processId}/submit`;

    await client.put(url);
  };
}

export default QuizFlowAPI;
