from datetime import datetime


def single_multiple_fill_in(type_: str):
    return {
        "question": "",
        "type": type_,
        "answers": [
            {"text": "", "correct": False},
            {"text": "", "correct": False},
            {"text": "", "correct": False},
            {"text": "", "correct": False},
        ],
        "options": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def matching(type_: str):
    return {
        "question": "",
        "type": type_,
        "answers": [
            {"text": "", "correct": ""},
            {"text": "", "correct": ""},
            {"text": "", "correct": ""},
            {"text": "", "correct": ""},
        ],
        "options": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def open(type_: str):
    return {
        "question": "",
        "type": type_,
        "answers": [{"correct": ""}],
        "options": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }


def binary(type_: str):
    return {
        "question": "",
        "type": type_,
        "answers": [{"text": "", "correct": ""}, {"text": "", "correct": ""}],
        "options": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
