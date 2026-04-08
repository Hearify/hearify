export const calculatePercentage = (correctAnswers: number, numberOfQuestions: number) => {
  return Math.round((correctAnswers / numberOfQuestions) * 100);
};
