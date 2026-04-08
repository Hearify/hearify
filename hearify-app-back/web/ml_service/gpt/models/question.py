from typing import List


# class Question:
#     def __init__(self, answerText:str, questionText: str = '', distractors: List[str] = []):
#         self.answerText = answerText
#         self.questionText = questionText

#     def __str__(self):
#         return f"Question: {self.questionText}\nAnswer: {self.answerText}\nDistractors: {self.distractors}\n"


class MultipleChoiceQuestion:
    def __init__(self, answerText: str, questionText: str = "", distractors: List[str] = []):
        self.answerText = answerText
        self.questionText = questionText
        self.distractors = distractors

    def __str__(self):
        return f"Question: {self.questionText}\nAnswer: {self.answerText}\nDistractors: {self.distractors}\n"


class OpenQuestion:
    def __init__(self, answerText: str, questionText: str = ""):
        self.answerText = answerText
        self.questionText = questionText

    def __str__(self):
        return f"Question: {self.questionText}\nAnswer: {self.answerText}\n"


class MatchingQuestion:
    def __init__(self, question: str, answersText: List[str] = [], optionsText: List[str] = [], distractor: str = ""):
        self.question = question
        self.answersText = answersText
        self.optionsText = optionsText
        self.distractor = distractor

    def __str__(self):
        return f"Qustion: {self.question}\n Options: {self.optionsText}\nAnswers: {self.answersText}\nDistractor: {self.distractor}\n"
