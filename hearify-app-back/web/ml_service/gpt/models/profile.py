from typing import List


class ProcessedQuestion:
    def __init__(self, question: str, student_answer: str, correct_answer: str, status: str):
        self.question = question
        self.student_answer = student_answer
        self.correct_answer = correct_answer
        self.status = status

    def __str__(self):
        return f"Question: {self.question}\nStudent answer: {self.student_answer}\nCorrect answer: {self.correct_answer}\nStatus: {self.status}\n"


class StudentProfile:
    def __init__(self, questions: List[ProcessedQuestion], weak_points: str = "", strong_points: str = "",
                 summary: str = ""):
        self.questions = questions
        self.weak_points = weak_points
        self.strong_points = strong_points
        self.summary = summary

    def __str__(self):
        return (
            f"Questions: {self.questions}\nWeak points: {self.weak_points}\nStrong points: {self.strong_points}\nSummary: {self.summary}\n"
        )
