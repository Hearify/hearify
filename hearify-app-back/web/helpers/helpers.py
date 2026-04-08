import re

question_types_dict = {
    "SingleChoice": "single_choice",
    "MultipleChoice": "multiple_choice",
    "FillInChoice": "fill_in",
    "Matching": "matching",
    "Binary": "binary",
    "Open": "open",
    "FillIn": "fc_fill_in",
    "Translate": "fc_translate",
    "RecordAnswer": "fc_record_answer",
    "AnswerPicture": "fc_answer_picture",
    "EnterWhatHeard": "fc_enter_what_heard",
    "KeyConcept": "key_concept",
}

type_number_dict = {
    "SingleChoice": 1,
    "MultipleChoice": 2,
    "FillInChoice": 3,
    "Matching": 4,
    "Open": 5,
    "Binary": 6,
    "FillIn": 7,
    "Translate": 8,
    "RecordAnswer": 9,
    "AnswerPicture": 10,
    "EnterWhatHeard": 11,
    "KeyConcept": 12,
}

languages_dict = {
    "Shqip": "sq",
    "العربية": "ar",
    "Հայերեն": "hy",
    "अवधी": "awa",
    "Azərbaycanca": "az",
    "Башҡортса": "ba",
    "Euskara": "eu",
    "Беларуская": "be",
    "বাংলা": "bn",
    "भोजपुरी": "bho",
    "Bosanski": "bs",
    "Português Brasileiro": "pt",
    "Български": "bg",
    "粵語": "yue",
    "Català": "ca",
    "छत्तीसगढ़ी": "hne",
    "中文": "zh",
    "Hrvatski": "hr",
    "Čeština": "cs",
    "Dansk": "da",
    "डोगरी": "doi",
    "Nederlands": "nl",
    "English": "en",
    "Eesti": "et",
    "Føroyskt": "fo",
    "Suomi": "fi",
    "Français": "fr",
    "Galego": "gl",
    "ქართული": "ka",
    "Deutsch": "de",
    "Ελληνικά": "el",
    "ગુજરાતી": "gu",
    "हरियाणवी": "bgc",
    "हिन्दी": "hi",
    "Magyar": "hu",
    "Bahasa Indonesia": "id",
    "Gaeilge": "ga",
    "Italiano": "it",
    "日本語": "ja",
    "Basa Jawa": "jv",
    "ಕನ್ನಡ": "kn",
    "कॉशुर": "ks",
    "Қазақ": "kk",
    "कोंकणी": "gom",
    "한국어": "ko",
    "Кыргызча": "ky",
    "Latviešu": "lv",
    "Lietuvių": "lt",
    "Македонски": "mk",
    "मैथिली": "mai",
    "Bahasa Melayu": "ms",
    "Malti": "mt",
    "普通话": "cmn",
    "मराठी": "mr",
    "मारवाड़ी": "mwr",
    "闽南": "nan",
    "Moldovenească": "ro",
    "Монгол": "mn",
    "Црногорски": "cnr",
    "नेपाली": "ne",
    "Norsk": "no",
    "ଓଡ଼ିଆ": "or",
    "پښتو": "ps",
    "فارسی": "fa",
    "Polski": "pl",
    "Português": "pt",
    "ਪੰਜਾਬੀ": "pa",
    "राजस्थानी": "raj",
    "Română": "ro",
    "Русский": "ru",
    "संस्कृतम्": "sa",
    "ᱥᱟᱱᱛᱟᱲᱤ": "sat",
    "Српски": "sr",
    "سنڌي": "sd",
    "සිංහල": "si",
    "Slovenčina": "sk",
    "Slovenščina": "sl",
    "Slovenski": "sl",
    "Українська": "uk",
    "اردو": "ur",
    "O‘zbek": "uz",
    "Tiếng Việt": "vi",
    "Cymraeg": "cy",
    "吴语": "wuu",
}


def get_lang_code_name(language):
    if language:
        return languages_dict.get(language)
    else:
        return "en"  # Default language is English


def remove_extra_questions(quiz, question_types):

    quiz = remove_duplicates(quiz)

    for qt in question_types:
        qt_name = qt["name"]
        qt_requested_num = qt["number_of_questions"]
        qt_mapped_name = question_types_dict.get(qt_name)

        questions_of_type = [q for q in quiz["questions"] if q["type"] == qt_mapped_name]

        if len(questions_of_type) > qt_requested_num:
            quiz["questions"] = [
                q for q in quiz["questions"] if q["type"] != qt_mapped_name
            ] + questions_of_type[:qt_requested_num]

        if qt_mapped_name == "fill_in":
            valid_fill_in_questions = []
            blank_pattern = (
                r"(\[\.{3,}\]|\[\_{3,}\])|\.{3,}|\_{3,}"  # Pattern to match [...], [___], ..., ___
            )
            for question in questions_of_type:
                key_to_use = "question" if "question" in question else "task"
                number_of_blanks = len(re.findall(blank_pattern, question[key_to_use]))
                if number_of_blanks == 1:
                    valid_fill_in_questions.append(question)

            quiz["questions"] = [
                q for q in quiz["questions"] if q["type"] != qt_mapped_name
            ] + valid_fill_in_questions

    return quiz


def remove_duplicates(quiz):
    seen_questions = set()
    unique_questions = []

    def hashable_answer(answer):
        if isinstance(answer, dict):
            return tuple((key, hashable_answer(value)) for key, value in sorted(answer.items()))
        return answer

    for question in quiz["questions"]:
        question_text = question.get("question", []) or question.get("task", [])
        if question_text is None:
            continue
        original_answers = question.get("answers", [])

        unique_answers = list({hashable_answer(answer) for answer in original_answers})

        question_tuple = (
            question_text,
            frozenset(map(hashable_answer, original_answers)),
        )

        if question_tuple not in seen_questions:
            seen_questions.add(question_tuple)
            question["answers"] = [
                dict(answer) if isinstance(answer, tuple) else answer for answer in unique_answers
            ]
            unique_questions.append(question)

    quiz["questions"] = unique_questions
    return quiz


# Temporary removed function

# def safe_json_decode(json_data):
#     try:
#         return json.loads(json_data)
#     except json.JSONDecodeError as e:
#         print(f"JSON decoding failed: {e}")  # Log the error for debugging
#         return None
#
# def generate_additional_questions(chatbot, prompt_template, question_type, deficit, text, language, difficulty,
#                                   additional_prompt, existing_quiz):
#     """
#     Generate additional questions for a specific question type to meet the required number.
#     """
#     from ml_service.gpt.prompts import multiple_format_fill_in_questions
#
#     # Generating a new prompt for the specific question type that needs more questions
#     new_prompt = prompt_template.build_one_type_part(
#         question_type=question_type,
#         number_of_questions=deficit,
#         type_number=type_number_dict[question_type]
#
#     )
#
#     # Adding the general prompt information
#     new_prompt = (f"Based on the following existing questions:\n"
#                   f"{existing_quiz}\n"
#                   f"Generate exactly {deficit} additional {question_type} questions based on the text.\nINSTRUCTIONS:{new_prompt}"
#                   "Return a valid JSON object for a quiz: { 'name': '{generated name}', 'questions': [{generated_questions}]}."
#                   "The quiz name is a short phrase (one to four words) describing the material. Identify the language of the TEXT and generate the name, questions' content and answers' content in this language."
#                   f"\nTEXT:{text}")
#
#     if language:
#         new_prompt += f"Questions should be in {language}. "
#     if difficulty:
#         new_prompt += f"The difficulty of tasks is {difficulty}. "
#     if additional_prompt:
#         new_prompt += f"Additional settings for generating: {additional_prompt}."
#
#     # Requesting the chatbot to generate additional questions
#     raw_response = chatbot.predict(new_prompt)
#     print(raw_response)
#     extracted_json = gpt_handler.extract_json_from_block(raw_response)
#     if extracted_json:
#         additional_questions_quiz = safe_json_decode(extracted_json)
#         if additional_questions_quiz:
#             additional_questions_quiz = multiple_format_fill_in_questions(additional_questions_quiz)
#             print(additional_questions_quiz)
#             return additional_questions_quiz.get("questions", [])
#     print("Failed to generate additional questions.")
#     return []


# def check_and_adjust_questions(chatbot, quiz, question_types, prompt_template, text, language, difficulty, additional_prompt):
#     """
#     Check if the generated quiz meets the specified number of questions for each type, augment if necessary.
#     """
#     adjusted_quiz = quiz.copy()
#     for qt in question_types:
#         qt_name = qt["name"]
#         qt_requested_num = qt["number_of_questions"]
#         qt_mapped_name = question_types_dict.get(qt_name)
#
#         # Filtering questions of the current type
#         questions_of_type = [q for q in adjusted_quiz["questions"] if q["type"] == qt_mapped_name]
#
#         if len(questions_of_type) < qt_requested_num:
#             # If deficit, generate additional questions
#             deficit = qt_requested_num - len(questions_of_type)
#             additional_questions = generate_additional_questions(
#                 chatbot, prompt_template, qt_name, deficit, text, language, difficulty, additional_prompt, existing_quiz=adjusted_quiz
#             )
#             adjusted_quiz["questions"].extend(additional_questions)
