from typing import List
from random import shuffle

from schemas.questions import QuestionBase


async def make_public(questions: List[QuestionBase]) -> List[QuestionBase]:
    """"""

    for question in questions:
        if question.type in {'single_choice', 'multiple_choice', 'fill_in'}:
            for answer in question.answers:
                answer.correct = None
        elif question.type == 'opened':
            for answer in question.answers:
                answer.text = ''
                answer.correct = None
        else:
            options = [answer.text for answer in question.answers]
            answers = [answer.correct for answer in question.answers]
            shuffle(options)
            shuffle(answers)

            question.answers = answers
            question.options = options

    return questions
