
def check_owner_access(quiz, current_user_id):

    return current_user_id == quiz.user_id or current_user_id in quiz.members.owners


def check_owner_editor_access(quiz, current_user_id):

    return current_user_id == quiz.user_id or current_user_id in quiz.members.owners or current_user_id in quiz.members.editors


def check_any_access_quiz_public(quiz, current_user_id):

    return current_user_id == quiz.user_id or current_user_id in quiz.members.owners or current_user_id in quiz.members.editors or current_user_id in quiz.members.viewers


def check_any_access_quiz_db(quiz, current_user_id):

    return current_user_id == quiz["user_id"] or current_user_id in quiz["members"]["owners"] or current_user_id in quiz["members"]["editors"] or current_user_id in quiz["members"]["viewers"]