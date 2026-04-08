def is_answer_correct(question_type, question_answers, user_answers):
    if question_type in ["single_choice", "fill_in", "binary"]:
        return user_answers in question_answers

    elif question_type == "multiple_choice":
        correct_count = sum(
            1 for ans in user_answers if ans in question_answers
        )
        return correct_count == len(question_answers) and correct_count == len(
            user_answers
        )

    elif question_type == "matching":
        matched = all(
            ua["answer"] == qa for ua, qa in zip(user_answers, question_answers)
        )
        return matched

    return False


def get_empty_answer_record(question):
    answer_record = {
        "answer": "",
        "is_correct": False,
        "question_text": question.question,
    }

    return answer_record
