from dataclasses import dataclass

from helpers.helpers import type_number_dict
from schemas.questions import QuestionTypes


class Prompts:
    matching_template = """
        Instruction: You are helpful assistant that helps to generate matching quizes about natural sciences.
        Matching quizes are quizes where you have to match 4 different options with 4 different answers.
        Generate quiz in json format. There are examples of quizes:
        {{"question": "choose the item in column 2 that best matches each item in column 1", "options": ["Antiseptics", "Disinfectants", "Pasteurization", "Sterilization"], answers: ["Removal of certain pathogens on living tissues", "Removal of all living organisms", "Removal of certain pathogens on living tissues", "Removal of certain pathogens on surfaces or objects"]}}
        {{"question": "Match the famous physicists with their contributions:", "options": ["Albert Einstein", "Isaac Newton", "Marie Curie", "Galileo Galilei"], answers: ["Developed the theory of relativity", "Formulated the laws of motion and universal gravitation", "Pioneered research on radioactivity", "Made significant advancements in the study of the heliocentric model of the solar system"]}}
        Do not include above examples in the output.
        Generate quizes using provided information: {input_text}
        Generated quiz:
    """

    open_question_template = """
        Instruction: You are helpful assistant that helps to generate open questions about natural sciences.
        Generate question in json format. There are examples of questions:
        {{"question": "What is the difference between antiseptics and disinfectants?", "answer": "Antiseptics are used on living tissues, while disinfectants are used on inanimate objects."}}
        Do not include above examples in the output.
        Generate question using provided information: {input_text}
        Generated question:
    """

    multiple_choice_question_template = """
        Instruction: You are helpful assistant that helps to generate multiple choice quiz about natural sciences.
        Multiple choice quiz are question where you have to choose one correct answer from 4 different options.
        Generate quiz using provided information: {input_text}
        Generate 1 question, 1 true answer and 3 false answers.
        Generate question in json format. There are examples of questions:
        {{"question": "What is the main greenhouse gas responsible for climate change?", "true_answer": "Carbon dioxide", "false_answers": ["Nitrogen", "Oxygen", "Hydrogen"]}}
        {{"question": "What is the Heisenberg Uncertainty Principle in quantum mechanics?", "true_answer": "It states that the speed and position of a particle cannot both be measured precisely at the same time.", "false_answers": ["It describes the behavior of waves in a vacuum.", "It defines the relationship between mass and energy in nuclear reactions.", "It explains the behavior of gases at extreme pressures and temperatures."]}}
        Do not include above examples in the output.
        Generated question:
    """

    multiple_choice_questions_valid_json_template = """
        Instruction: You are helpful assistant that helps to generate multiple choice quiz about natural sciences.
        Multiple choice quiz are question where you have to choose one correct answer from 4 different options.
        Generate 8 quizes using provided information: {input_text}
        For each question generate question text, 1 true answer and 3 false answers.
        Generate questions in valid json format, make it list of questions. There are examples of result:
        [{{"question": "What is the main greenhouse gas responsible for climate change?", "true_answer": "Carbon dioxide", "false_answers": ["Nitrogen", "Oxygen", "Hydrogen"]}},
        {{"question": "What is the Heisenberg Uncertainty Principle in quantum mechanics?", "true_answer": "It states that the speed and position of a particle cannot both be measured precisely at the same time.", "false_answers": ["It describes the behavior of waves in a vacuum.", "It defines the relationship between mass and energy in nuclear reactions.", "It explains the behavior of gases at extreme pressures and temperatures."]}}]
        Do not include above examples in the output.
        Generated question:
    """

    single_choice_questions_template = """
        Generate single-choice questions in JSON format based on the given text to assess students knowledge.
        Questions should be in the language of the material.
        The JSON object should include contains a a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, one true answer, and three false answers.
        The JSON obejct format is as follows:
        {{ "name": "Generated quiz name", "questions": [{{"type": "single", "question": "Question text", "true_answer": "Correct answer", "false_answers": ["Incorrect 1", "Incorrect 2", "Incorrect 3"]}}]}}
        Ensure that the question text is limited to 200 characters, and the correct answer should not stand out; it should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answer is longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers.
        Return a valid list of {number_of_questions} questions covering the learning material in {input_text}. Output type must be a valid json list.
    """

    multiple_choice_questions_template = """
        Generate multiple-choice questions in JSON format based on the given text to assess students knowledge.
        Each question should have a type, question text, true answers, and false answers. Total number of answers is 4. The number of correct answers can be from 2 to 3. The format is as follows:
        [{{"type": "multiple", "question": "Question text", "true_answers": ["Correct answer 1", "Correct answer 2"], "false_answers": ["Incorrect 1", "Incorrect 2"]}}]
        Ensure that the question text is limited to 200 characters, and the correct answer should not stand out; it should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answer is longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers.
        Return a valid list of {number_of_questions} questions covering the learning material in {input_text}. Output type must be a valid json list.
    """

    fill_in_questions_template = """
        Generate a JSON list of fill-in-the-blank quiz tasks. Each task should include a type, task text, a correct answer, and three incorrect answers. The task text is a sentence that contains "[...]" instead of answer, and the user must choose the correct answer to fill in.
        The format for each task in the JSON list should be as follows: [{{"type": "fill_in", "task": "Task text", "true_answer": "Correct answer", "false_answers": ["Incorrect 1", "Incorrect 2", "Incorrect 3"]}}]
        Examples:
        [{{"type": "fill_in", "task": "The capital of France is [...].", "true_answer": "Paris", "false_answers": ["London", "Berlin", "Rome"]}}, {{"type": "fill_in", "task": "Water boils at [...].", "true_answer": "100 degrees", "false_answers": ["0 degrees", "50 degrees", "200 degrees"]}}]
        Do not include the above examples in the output.
        Ensure that the task text is limited to 200 characters, and the correct answer should not stand out.
        Return a valid list of {number_of_questions} tasks covering the learning material in {input_text}.
    """

    three_types_questions_template = """
        Instruction: You are a helpful assistant who helps to generate quizzes.
        There are three types of questions: matching questions, open questions and multiple choice questions

        Multiple choice quiz is a question where you have to choose one correct answer from 4 different options.
        For each multiple choice question generate question text, 1 true answer, and 3 false answers.
        Generate multiple questions in json format. There are two examples of individual questions:
        {{"type": "multiple", "question": "What is the main greenhouse gas responsible for climate change?", "true_answer": "Carbon dioxide", "false_answers": ["Nitrogen", "Oxygen", "Hydrogen"]}}
        {{"type": "multiple", "question": "What is the Heisenberg Uncertainty Principle in quantum mechanics?", "true_answer": "It states that the speed and position of a particle cannot both be measured precisely at the same time.", "false_answers": ["It describes the behavior of waves in a vacuum.", "It defines the relationship between mass and energy in nuclear reactions.", "It explains the behavior of gases at extreme pressures and temperatures."]}}

        Open question is a type of question that cannot be answered with a simple "yes" or "no" response. Instead, it encourages the respondent to provide a more detailed and expansive answer.
        Generate open questions in json format. There is one example of an open question:
        {{"type": "open", "question": "What is the difference between antiseptics and disinfectants?", "answer": "Antiseptics are used on living tissues, while disinfectants are used on inanimate objects."}}

        Matching question is a question where you have to match 4 different options with 4 different answers.
        Generate matching questions in json format. There are two examples of matching questions:
        {{"type": "matching", "question": "choose the item in column 2 that best matches each item in column 1", "options": ["Antiseptics", "Disinfectants", "Pasteurization", "Sterilization"], answers: ["Removal of certain pathogens on living tissues", "Removal of all living organisms", "Removal of certain pathogens on living tissues", "Removal of certain pathogens on surfaces or objects"]}}
        {{"type": "matching", "question": "Match the famous physicists with their contributions:", "options": ["Albert Einstein", "Isaac Newton", "Marie Curie", "Galileo Galilei"], answers: ["Developed the theory of relativity", "Formulated the laws of motion and universal gravitation", "Pioneered research on radioactivity", "Made significant advancements in the study of the heliocentric model of the solar system"]}}

        As a result return valid list of questions in json format. Example:
        [{{"type": "multiple", "question": "What is the main greenhouse gas responsible for climate change?", "true_answer": "Carbon dioxide", "false_answers": ["Nitrogen", "Oxygen", "Hydrogen"]}},
        {{"type": "open", "question": "What is the difference between antiseptics and disinfectants?", "answer": "Antiseptics are used on living tissues, while disinfectants are used on inanimate objects."}},
        {{"type": "matching", "question": "choose the item in column 2 that best matches each item in column 1", "options": ["Antiseptics", "Disinfectants", "Pasteurization", "Sterilization"], answers: ["Removal of certain pathogens on living tissues", "Removal of all living organisms", "Removal of certain pathogens on living tissues", "Removal of certain pathogens on surfaces or objects"]}}]

        Do not include the above examples in the output.
        Generate {number_of_questions} questions of different types to check students' knowledge of learning material from this text: {input_text}
    """

    student_knowledge_profile_template = """
        You are teacher assistant and you have history of quiz anwers of a particular student.
        Please, formulate a list of answered questions and answers
        and indicate if they were answered correctly or not. Please, be very accurate and don't mismatch answers of student. Don't make up things.
        Then your job is to identify weak points in knowledge of this student and formulate 1-3 bullet points that describes them. You should also
        create 1-3 bullet points that shows field where the student performs good. Please, be a strict teacher and don't overestimate student's
        knowledge. Be a generalist, so suggest topics that student ahould relearn to finally pass the test next time.
        Also, give general characteristics of student's understanding of this particular lesson. If more than 20% of answers are wrong - we can
        conclude that student lacks some knowledge of topic. If 50+% of answers are wrong - we should conclude that the student lacks understanding
        of main concepts and should relearn this topic. All this should formulate student's profile.

        Generate profile in json format. There are examples of such profiles:
        {{"questions":[{{"question":"What group is Oxygen a member of?","student answer":"Oxygen group","correct answer":"Chalcogen group","status":"Incorrect"}},{{"question":"What percentage of the Earth's atmosphere is dioxygen?","student answer":"20.95%","correct answer":"20.95%","status":"Correct"}},{{"question":"What uses the energy of sunlight to produce oxygen from water and car…?","student answer":"Oxygen","correct answer":"Photosynthesis","status":"Incorrect"}}],"weak points":"The student incorrectly identified the group to which Oxygen belongs. They need to review their knowledge of chemical elements and their classifications. The student couldn't correctly identify the process that uses sunlight to produce oxygen from water and carbon dioxide, indicating a lack of understanding of photosynthesis.","strong points":"The student correctly identified the percentage of dioxygen in the Earth's atmosphere, demonstrating some knowledge in chemistry.","summary":"The student's overall understanding of the lesson appears to be weak, as only 1 out of 3 questions answered correctly. The student lacks a fundamental understanding of the chemical properties of Oxygen. It is crucial for the student to review these concepts and reinforce their knowledge before retaking the quiz or facing similar assessments."}}

        Do not include above examples in the output.

        Generate student profile using provided information:

        Here is the quiz and all answers of this student. The json contains information about quiz that student passed. Don't copy it to you answer:
        {input_text}

        Generated student profile:
    """

    general_student_profile_template = """
        You are teacher assistant and you have notes about of weaknesses, strength and summary for results of one student for each lesson during
        several weeks. Your job now is to conclude student progress during all classes and find patterns in knowledge of this student. You should
        only output general information about student perfomance and don't take into acount separate lessons.
        Please, advise methods for increasing perfomance and list top 3-7 topics, in which student is struggling.
        Please, be very accurate and don't mismatch characteristics of the student. Don't make up things.
        Also, give general characteristics of student's understanding of this subject. Put all insights into json.
        Don't copy and don't repeat information given below. Only aggragate information to overall characteristics.
        Use concrete facts and email specific fields of discipline in your verdict. Don't praise the student.
        Be very strict as a teacher and identify as more weaknesses as you can.


        Generate profile in json format. There are examples of such profiles:

        {{"Overall Characteristics":{{"Student Progress":"The student's performance has been consistently below average in multiple lessons, indicating a need for improvement in their understanding of the subject.","Strengths":["Demonstrated a fundamental grasp of quantum chemistry.","Correctly recognized the study of solid materials in solid-state chemistry.","Accurately identified the percentage of dioxygen in the Earth's atmosphere (20.95%).","Correctly identified the individual who isolated Oxygen before 1604 (Michael Sendivogius)."],"Weaknesses":["Struggled with multiple-choice questions and often selected incorrect answers.","Misunderstood the purpose of the periodic table in chemistry.","Provided incorrect answers in matching questions related to branches of natural sciences and their descriptions.","Lacks understanding of the chemical properties of Oxygen, including its group (Chalcogen group) and the process of photosynthesis.","Misattributed the coinage of the email 'oxygen' in 1777 to Michael Scheele instead of Antoine Lavoisier."],"General Understanding of the Subject":"The student exhibits a mixed level of understanding in the subject of chemistry. While they have strengths in certain areas such as quantum chemistry and solid-state chemistry, their weaknesses in fundamental concepts, periodic table comprehension, and knowledge of chemical elements hinder their overall grasp of the subject. Additionally, their confusion regarding Oxygen's properties and historical context shows gaps in their foundational knowledge. The student needs to work on strengthening their fundamental understanding of chemistry."}},"Recommendations for Improvement":["Focus on revising fundamental concepts in chemistry, particularly related to the periodic table and chemical elements.","Practice multiple-choice questions to improve accuracy in selecting correct answers.","Study the classification of chemical elements and their properties, paying special attention to Oxygen and its group.","Review the historical context of important figures in chemistry to avoid misattributions in the future.","Seek additional resources and guidance to fill knowledge gaps and build a solid foundation in chemistry."],"Top Struggling Topics":["Fundamental concepts in chemistry","Periodic table comprehension","Classification and properties of chemical elements","Understanding the chemical properties of Oxygen","Historical context of important figures in chemistry"]}}

        Do not include above examples in the output.

        Generate general student profile using provided information:

        {input_text}

        Do not generate anything in non-json format. Only json is allowed. Output have to be valid json.
    """

    personalized_homeworks_multiplechoice_template = """
        Generate quiz using provided information:

        You are teacher assistant and you have notes about of weaknesses, strength and summary of one of your students. Now generate questions that would help the student to check the knowledge after a period of time and understand whether the previous ungrasped concepts are learned or no. You should generate questions to cover each of topics that students struggled with before. Please, be very creative, but also don't make up things. Generate questions to make student revise all topics, just ask about whaever knowledge lies behind struggling topic of student. Don't mention student in your questions, don't mention information below, this is you secret knowledge to personalize education:

        {input_text}

        Multiple choice quiz are questions where you have to choose one correct answer from 4 different options.

        1 question, 1 true answer and 3 false answers. Here you can find few examples:
        {{"question": "What is the main greenhouse gas responsible for climate change?", "true_answer": "Carbon dioxide", "false_answers": ["Nitrogen", "Oxygen", "Hydrogen"]}}
        {{"question": "What is the Heisenberg Uncertainty Principle in quantum mechanics?", "true_answer": "It states that the speed and position of a particle cannot both be measured precisely at the same time.", "false_answers": ["It describes the behavior of waves in a vacuum.", "It defines the relationship between mass and energy in nuclear reactions.", "It explains the behavior of gases at extreme pressures and temperatures."]}}

        Do not include above examples in the output.

        Do not generate any text in non-json format. Only json is allowed.
    """

    personalized_homeworks_open_template = """
        Generate quiz using provided information:
        You are teacher assistant and you have notes about of weaknesses, strength and summary of one of your students. Now generate questions that would help the student to check the knowledge after a period of time and understand whether the previous ungrasped concepts are learned or no. You should generate questions to cover each of topics that students struggled with before. Please, be very creative, but also don't make up things. Generate questions to make student revise all topics, just ask about whatever knowledge lies behind struggling topic of student. Don't mention student in your questions, don't mention information below, this is you secret knowledge to personalize education:
        {input_text}
        This is an example of open questions:
        {{"question": "What is the difference between antiseptics and disinfectants?", "answer": "Antiseptics are used on living tissues, while disinfectants are used on inanimate objects."}}
        Do not include above examples in the output.
        Do not generate any text in non-json format. Only json is allowed.
    """


@dataclass
class QuestionTemplate:
    task: str

    quiz_example: str
    quiz_structure: str
    quiz_constraints: str

    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    another_lang: str = "Questions should be in {language}. "
    difficulty: str = """The difficulty of tasks is {difficulty}. """
    language: str = "Questions should be in the language of the material. "
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} questions covering the learning material: {text}."
    )

    @classmethod
    def build(
        cls,
        text: str,
        questions_num: int,
        language: str | None = None,
        difficulty: str | None = None,
        additional_prompt: str | None = None,
    ) -> str:
        """"""
        prompt = cls.task
        prompt += cls.another_lang.format(language=language) if language else cls.language

        prompt += cls.difficulty.format(difficulty=difficulty) if difficulty else ""
        prompt += cls.quiz_structure + cls.quiz_example + cls.quiz_constraints
        prompt += (
            cls.user_prompt.format(additional_prompt=additional_prompt) if additional_prompt else ""
        )
        prompt += cls.return_sentence.format(number_of_questions=questions_num, text=text)

        return prompt


@dataclass
class RoadmapTemplate:
    task: str

    quiz_example: str
    quiz_structure: str

    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    another_lang: str = "Roadmap should be in {language}. "
    language: str = "Roadmap should be built in the language of the material. "
    return_sentence: str = (
        "Return a valid JSON object covering the learning material: {text}."
    )

    @classmethod
    def build(
        cls,
        text: str,
        language: str | None = None,
    ) -> str:
        """"""
        prompt = cls.task

        prompt += cls.another_lang.format(language=language) if language else cls.language
        prompt += cls.quiz_structure + cls.quiz_example
        prompt += cls.return_sentence.format(text=text)

        return prompt


@dataclass
class NewSubtopicTemplate:
    task: str

    quiz_example: str
    quiz_structure: str

    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    language: str = "Subtopic should be built in the language of the material. "
    return_sentence: str = (
        "Return a valid JSON object covering the learning material: {text}."
    )

    @classmethod
    def build(
        cls,
        text: str,
        language: str | None = None,
    ) -> str:
        """"""
        prompt = cls.task

        prompt += cls.another_lang.format(language=language) if language else cls.language
        prompt += cls.quiz_structure + cls.quiz_example
        prompt += cls.return_sentence.format(text=text)

        return prompt


@dataclass
class RegeneratedSubtopicTemplate:
    task: str

    subtopic_example: str
    subtopic_structure: str

    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    language: str = "Subtopics should be built in the language of the material. "
    return_sentence: str = (
        "Return a valid JSON object covering the learning material: {text}."
    )

    @classmethod
    def build(
        cls,
        text: str,
        language: str | None = None,
    ) -> str:
        """"""
        prompt = cls.task

        prompt += cls.another_lang.format(language=language) if language else cls.language
        prompt += cls.subtopic_structure + cls.subtopic_example
        prompt += cls.return_sentence.format(text=text)

        return prompt


@dataclass
class TextRoadmapTemplate(RoadmapTemplate):
    task: str = (
        "Generate a start-to-end roadmap which consists of topics and subtopics in JSON format based on the given text to improve students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a list of topics, and list of subtopics for each topic. For each subtopic provide a list of 4 links to study materials related to it, and one of them must be a link to youtube video. Each subtopic must have a short 150 words description with basic information. Topics and subtopics have to follow each other based on the difficulty(complexity) level. The topic name and subtopic name is a short phrase (one to four words) describing the topic. Each topic should have a list of subtopics. When created, each topic must have key 'completed' be False. Do as many as you find to be required to get deep knowledge in the topic, but make sure that you generate at least 8 topics, and at least 5 subtopics for each topic."
    )
    quiz_example: str = (
        """The JSON object format is as follows: {"name":"Geography Roadmap","topics":[{"name":"Basic Terms", "completed":false,"subtopics":[{"name":"subtopic1", "description": "<str>", "study_materials":["<url>", "<url>", "<url>", "<url>"]},{"name":"subtopic2", "description": "<str>", "study_materials":["<url>", "<url>", "<url>", "<url>"]},{"name":"subtopic3", "description": "<str>", "study_materials":["<url>", "<url>", "<url>", "<url>"]}]}]}.  Provide a valid JSON object. Do not include the above examples in the output. """
    )


@dataclass
class NewSubtopicRoadmapTemplate(NewSubtopicTemplate):
    task: str = (
        "Generate one subtopic in JSON format based on the given text to improve students' knowledge. Make sure that a new subtopic is not included in the list of existing subtopics. "
    )
    quiz_structure: str = (
        "The JSON object should contain one subtopic based on the topic. For each subtopic provide a list of 4 links to study materials related to it, and one of them must be a link to youtube video. The subtopic name is a short phrase (one to four words) describing the topic. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: {"name":"subtopic1", "completed": false, "study_materials":["<url>", "<url>", "<url>", "<url>"]}. Do not include the above examples in the output. """
    )


@dataclass
class RegeneratedSubtopicsRoadmapTemplate(RegeneratedSubtopicTemplate):
    task: str = (
        "Generate a list of subtopics in JSON format based on the topic given in the text to improve students' knowledge. "
    )
    subtopic_structure: str = (
        "The JSON object should contain a list of subtopics for the topic. Subtopics have to follow each other based on the difficulty(complexity) level. For each subtopic provide a list of 4 links to study materials related to it, and one of them must be a link to youtube video. Subtopic name is a short phrase (one to four words) describing the topic. Do as many as you find to be required to get deep knowledge in the topic, but make sure that you generate at least 5 subtopics for the topic."
    )
    subtopic_example: str = (
        """The JSON object format is as follows: {"subtopics":[{"name":"subtopic1","study_materials":["<url>", "<url>", "<url>", "<url>"]}, {"name":"subtopic2","study_materials":["<url>", "<url>", "<url>", "<url>"]}}.  Do not include the above examples in the output. """
    )

@dataclass
class SingleChoiceQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate single-choice questions in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a list of answers. Each answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer and three incorrect. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "single_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text":  "Carbon dioxide", "is_correct": true}, {"text":  "Oxygen", "is_correct": false}, {"text":  "Nitrogen", "is_correct": false}, {"text":  "Hydrogen", "is_correct": false}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out; it should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answer is longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )


@dataclass
class FCFillInQuestionTemplate(QuestionTemplate):
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    task: str = (
        "Generate fill-in-the-blank tasks in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains "[...]" instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_fill_in","question": "The capital of France is [...].","answers": [{"text":  "Paris", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class FCRecordAnswerQuestionTemplate(QuestionTemplate):
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    task: str = (
        "Generate repeat a word tasks in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence which asks student to repeat certain word from the context. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_record_answer","question": "Repeat the word 'flower'.","answers": [{"text":  "Flower", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class FCTranslateQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate 'translate a word' tasks in JSON format based on the given text to assess students' knowledge. "
    )
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains "Translate word [word you choose from data]" instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_translate","question": "Translate word [word you choose from data].","answers": [{"text":  "Translation", "is_correct": true}]}]}. Do not include the above examples in the output."""
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class FCEnterWhatHeardQuestionTemplate(QuestionTemplate):
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    task: str = (
        "Generate 'short-phrase/word to listen and repeat' tasks in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The question text is always: 'Enter what you hear.', and the correct answer is a short-phrase/word based on the text. User will listen to it and enter what he heard as an answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_enter_what_heard","question": "Enter what you hear.","answers": [{"text":  "Small fish", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class FCAnswerPictureQuestionTemplate(QuestionTemplate):
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    task: str = (
        "Generate 'short-phrase/word as an answer to describe a picture' tasks in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The question consists of Picture and text. The question text must always ask user a question related to the picture and must be based on the data provided. The correct answer is a short-phrase/word based on the data. The picture is based on data, and the user will look at the picture, read the question related to the picture and enter the answer to fill in. The quesstion text must be interact with the picture. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_picture_answer","question": "Name the artist.","answers": [{"text":  "Johannes Vermeer", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class FCKeyConceptQuestionTemplate(QuestionTemplate):
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    task: str = (
        "Generate key_concept tasks in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains few words question which asks question about the text instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_ke_concept","question": "Explain concept Photosynthesis","answers": [{"text":  "Process by which plants convert sunlight into energy", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleChoiceQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate multiple-choice questions in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a list of answers. Each answer includes text of the answer and a boolean field 'is_correct.'. There are two or three correct answers and three or two incorrect ones. The total number of answers is four. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "multiple_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text":  "Carbon dioxide", "is_correct": true},{"text":  "Oxygen", "is_correct": true},{"text":  "Nitrogen", "is_correct": false},{"text":  "Hydrogen", "is_correct": false}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answers should not stand out; they should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answers are longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )


@dataclass
class FillInChoiceQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate fill-in-the-blank tasks in JSON format based on the given text to assess students' knowledge. "
    )
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a list of answers. Each answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer and three incorrect. The total number of answers is four. The task text is a sentence that contains "[...]" instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "tasks": [{"type": "fill_in","task": "The capital of France is [...].","answers": [{"text":  "Paris", "is_correct": true},{"text":  "London", "is_correct": false},{"text":  "Berlin", "is_correct": false},{"text":  "Rome", "is_correct": false}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MatchingQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate matching questions in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a list of answers. Each answer includes the text of the term and its corresponding matching answer. There are four answers in total. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "matching","question": "choose the item in column 2 that best matches each item in column 1","answers": [{"text": "Removal of certain pathogens on living tissues", "answer": "Antiseptics"},{"text": "Removal of all living organisms", "answer": "Disinfectants"},{"text": "Removal of certain pathogens on living tissues", "answer": "Pasteurization"},{"text": "Removal of certain pathogens on surfaces or objects", "answer": "Sterilization"}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out. Additionally, all answer texts should not exceed 75 characters.  "
    )


@dataclass
class BinaryQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate binary(true/false) statement in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a quiz name and an assumption statement. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a assumption statement(true/false). There is one answer assumption statement in total. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "binary","question": "Is it true that chicken can't fly","answers": [{"text": "True", "is_correct": "False"},{"text": "False", "is_correct": "True"}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out. Additionally, all answer texts should not exceed 75 characters.  "
    )


@dataclass
class OpenQuestionTemplate(QuestionTemplate):
    task: str = (
        "Generate opened questions in JSON format based on the given text to assess students' knowledge. "
    )
    quiz_structure: str = (
        "The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a list of one answer. The answer includes the text of the answer and 'is_correct' field that is always true. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "opened","question": "What is the difference between antiseptics and disinfectants?","answers": [{"text": "The main difference is bla bla bla", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = "Ensure that the question text is limited to 200 characters. "


def format_fill_in_questions(questions):
    if questions.get("tasks"):
        questions["questions"] = questions.pop("tasks")
        for question in questions["questions"]:
            if question["type"] == "fill_in":
                question["question"] = question.pop("task")

    return questions


def multiple_format_fill_in_questions(questions):
    if questions.get("questions"):
        for question in questions["questions"]:
            if question["type"] == "fill_in" and "task" in question:
                question["question"] = question.pop("task")
    return questions


def type_prompt_mapper(question_type: str):
    prompt_types = {
        QuestionTypes.SingleChoice: SingleChoiceQuestionTemplate,
        QuestionTypes.MultipleChoice: MultipleChoiceQuestionTemplate,
        QuestionTypes.FillInChoice: FillInChoiceQuestionTemplate,
        QuestionTypes.Matching: MatchingQuestionTemplate,
        QuestionTypes.Binary: BinaryQuestionTemplate,
        QuestionTypes.Open: OpenQuestionTemplate,
        QuestionTypes.FCFillIn: FCFillInQuestionTemplate,
        QuestionTypes.FCKeyConcept: FCKeyConceptQuestionTemplate,
        QuestionTypes.FCTranslate: FCTranslateQuestionTemplate,
        QuestionTypes.FCRecordAnswer: FCRecordAnswerQuestionTemplate,
        QuestionTypes.FCAnswerPicture: FCAnswerPictureQuestionTemplate,
        QuestionTypes.FCEnterWhatHeard: FCEnterWhatHeardQuestionTemplate,
    }
    return prompt_types.get(question_type, SingleChoiceQuestionTemplate)


def roadmap_type_prompt_mapper():
    return TextRoadmapTemplate


def new_subtopic_prompt_mapper():
    return NewSubtopicRoadmapTemplate


def regenerated_subtopics_prompt_mapper():
    return RegeneratedSubtopicsRoadmapTemplate

@dataclass
class MultipleTypesQuestionTemplate:
    task: str = ""
    multiple_task: str = (
        "INSTRUCTIONS: Generate a quiz with different question types in JSON format based on the given text to assess students' knowledge. These types are: \n"
    )
    quiz_example: str = ""
    quiz_structure: str = ""
    quiz_constraints: str = ""
    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    another_lang: str = "Generate the name, questions' content and answers' content in {language}. "
    difficulty: str = "The difficulty of tasks is {difficulty}. "
    language: str = (
        " Identify the language of the learning material and generate the name, questions' content and answers' content in this language. "
    )
    question_number_sentence: str = "Generate exactly {number_of_questions} questions of this type."
    return_questions: str = (
        "Generate a total of {total_questions} questions, ensuring a mix of question types as specified. Each question must be unique."
    )
    return_sentence: str = (
        """Do not generate all question of one type in a row. Return a valid JSON object for a quiz: { "name": "{generated name}", "questions": [{generated_questions}]} with the exact number of questions of all types. The quiz name is a short phrase (one to four words) describing the material. Cover the LEARNING MATERIAL: """
    )
    total_questions: int = 0

    def build(
        self,
        question_types: list[dict],
        text: str,
        language: str | None = None,
        difficulty: str | None = None,
        additional_prompt: str | None = None,
    ) -> str:
        self.total_questions = sum(question["number_of_questions"] for question in question_types)

        prompt = self.multiple_task

        for question in question_types:
            question_type = question["name"]
            number_of_questions = question["number_of_questions"]
            if number_of_questions > 0:
                prompt += (
                    self.build_one_type_part(
                        question_type,
                        number_of_questions,
                        type_number_dict[question_type],
                    )
                    + "\n"
                )

        recap_statement = f"To recap, the quiz must include "
        recap_parts = []
        for question in question_types:
            question_type = question["name"].replace("_", "").capitalize()
            number_of_questions = question["number_of_questions"]
            if number_of_questions > 0:
                recap_parts.append(f"{number_of_questions} {question_type.lower()} questions")
        self.total_questions = int(self.total_questions / 2)
        recap_statement += ", ".join(recap_parts[:-1]) + ", and " + recap_parts[-1] + ".\n"
        prompt += recap_statement

        prompt += (
            self.language if language == "Auto" else self.another_lang.format(language=language)
        )
        prompt += self.difficulty.format(difficulty=difficulty) if difficulty else ""
        prompt += (
            self.user_prompt.format(additional_prompt=additional_prompt)
            if additional_prompt
            else ""
        )
        prompt += self.return_questions.format(total_questions=self.total_questions)
        prompt += self.return_sentence
        prompt += text

        return prompt

    def build_one_type_part(self, question_type: str, number_of_questions: int, type_number: int):
        generation_type = multiple_type_prompt_mapper(question_type)
        question_number_sentence = generation_type.question_number_sentence.format(
            number_of_questions=number_of_questions
        )

        self.total_questions += number_of_questions

        return f"{generation_type.task.format(type_number=type_number)} {generation_type.quiz_structure} {generation_type.quiz_example} {generation_type.quiz_constraints} {question_number_sentence}"


@dataclass
class MultipleTypesSingleChoiceQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: single-choice question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct'. There is one correct answer and three incorrect answers. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "single_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text":  "Carbon dioxide", "is_correct": true}, {"text":  "Oxygen", "is_correct": false}, {"text":  "Nitrogen", "is_correct": false}, {"text":  "Hydrogen", "is_correct": false}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out; it should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answer is longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )
    question_number_sentence: str = (
        "Generate exactly {number_of_questions} single-choice questions."
    )


@dataclass
class MultipleTypesMultipleChoiceQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: multiple-choice question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct.'. There are two or three correct answers and three or two incorrect ones. The total number of answers is four. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "multiple_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text": "Carbon dioxide", "is_correct": true},{"text": "Oxygen", "is_correct": true},{"text": "Nitrogen", "is_correct": false},{"text": "Hydrogen", "is_correct": false}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answers should not stand out; they should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answers are longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )
    question_number_sentence: str = (
        "Generate exactly {number_of_questions} multiple-choice questions."
    )


@dataclass
class MultipleTypesFillInChoiceQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: fill-in-the-blank task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct.'. There is one correct answer and three incorrect. The total number of answers is four. The task text is a sentence that contains "[...]" instead of an answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "fill_in","task": "The capital of France is [...].","answers": [{"text": "Paris", "is_correct": true},{"text": "London", "is_correct": false},{"text": "Berlin", "is_correct": false},{"text": "Rome", "is_correct": false}]}. There must be only one [...] blank space and one correct answer in the output. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    question_number_sentence: str = (
        "Generate exactly {number_of_questions} fill-in-the-blank tasks."
    )


@dataclass
class MultipleTypesMatchingQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: matching question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the term and its corresponding matching answer. There are four answers in total. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "matching","question": "choose the item in column 2 that best matches each item in column 1","answers": [{"text": "Removal of certain pathogens on living tissues", "answer": "Antiseptics"},{"text": "Removal of all living organisms", "answer": "Disinfectants"},{"text": "Removal of certain pathogens on living tissues", "answer": "Pasteurization"},{"text": "Removal of certain pathogens on surfaces or objects", "answer": "Sterilization"}]}. NOTE: Do not include any of the previous examples in the generated output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out. Additionally, all answer texts should not exceed 75 characters.  "
    )
    question_number_sentence: str = "Generate exactly {number_of_questions} matching questions."


@dataclass
class MultipleTypesBinaryQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: binary(true/false) question."
    quiz_structure: str = (
        "The JSON object should contain a quiz name and an assumption statement. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and a assumption statement(true/false). There is one answer assumption statement in total. "
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "binary","question": "Is it true that chicken can't fly","answers": [{"text": "True", "is_correct": "False"},{"text": "False", "is_correct": "True"}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out. Additionally, all answer texts should not exceed 75 characters.  "
    )
    question_number_sentence: str = (
        "Generate exactly {number_of_questions} binary(true/false) questions."
    )


@dataclass
class MultipleTypesOpenQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: opened question. "
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of one answer. The answer includes the context from the learning material to asses the question later and an 'is_correct' field that is always true. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "opened","question": "What is the difference between antiseptics and disinfectants?","answers": [{"text": "The main difference is ...", "is_correct": true}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = "Ensure that the question text is limited to 200 characters. "
    question_number_sentence: str = "Generate exactly {number_of_questions} opened questions."


@dataclass
class MultipleFCFillInQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: fill-in-the-blank task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains "[...]" instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_fill_in","question": "The capital of France is [...].","answers": [{"text":  "Paris", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleFCTranslateQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: translate a word task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains "Translate word [word you choose from data]" instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_translate","question": "Translate word [word you choose from data].","answers": [{"text":  "Translation", "is_correct": true}]}]}. Do not include the above examples in the output."""
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleFCRecordAnswerQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: repeat a word task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence which asks student to repeat certain word from the context. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_record_answer","question": "Repeat the word 'flower'.","answers": [{"text":  "Flower", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleFCAnswerPictureQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: describe a picture task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The question consists of Picture and text. The question text must always ask user a question related to the picture and must be based on the data provided. The correct answer is a short-phrase/word based on the data. The picture is based on data, and the user will look at the picture, read the question related to the picture and enter the answer to fill in. The quesstion text must be interact with the picture. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_picture_answer","question": "Name the artist.","answers": [{"text":  "Johannes Vermeer", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleFCEnterWhatHeardQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: short-phrase/word to listen and repeat task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The question text is always: 'Enter what you hear.', and the correct answer is a short-phrase/word based on the text. User will listen to it and enter what he heard as an answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_enter_what_heard","question": "Enter what you hear.","answers": [{"text":  "Small fish", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


@dataclass
class MultipleFCKeyConceptQuestionTemplate(MultipleTypesQuestionTemplate):
    task: str = "Type number {type_number}: key concept task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON object should contain a quiz name and a list of questions. The quiz name is a short phrase (one to four words) describing the material. Each question should have a type, question text, and one correct answer. Correct answer includes text of the answer and a boolean field 'is_correct.'. There is one correct answer. The total number of answers is one. The task text is a sentence that contains few words question which asks question about the text instead of answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON object format is as follows: { "name": "Generated quiz name", "questions": [{"type": "fc_ke_concept","question": "Explain concept Photosynthesis","answers": [{"text":  "Process by which plants convert sunlight into energy", "is_correct": true}]}]}. Do not include the above examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    return_sentence: str = (
        "Return a valid JSON object with {number_of_questions} tasks covering the learning material: {text}."
    )


def multiple_type_prompt_mapper(question_type: str):
    prompt_types = {
        QuestionTypes.SingleChoice: MultipleTypesSingleChoiceQuestionTemplate,
        QuestionTypes.MultipleChoice: MultipleTypesMultipleChoiceQuestionTemplate,
        QuestionTypes.FillInChoice: MultipleTypesFillInChoiceQuestionTemplate,
        QuestionTypes.Matching: MultipleTypesMatchingQuestionTemplate,
        QuestionTypes.Binary: MultipleTypesBinaryQuestionTemplate,
        QuestionTypes.Open: MultipleTypesOpenQuestionTemplate,
        QuestionTypes.FCFillIn: MultipleFCFillInQuestionTemplate,
        QuestionTypes.FCTranslate: MultipleFCTranslateQuestionTemplate,
        QuestionTypes.FCRecordAnswer: MultipleFCRecordAnswerQuestionTemplate,
        QuestionTypes.FCAnswerPicture: MultipleFCAnswerPictureQuestionTemplate,
        QuestionTypes.FCEnterWhatHeard: MultipleFCEnterWhatHeardQuestionTemplate,
        QuestionTypes.FCKeyConcept: MultipleFCKeyConceptQuestionTemplate,
    }

    return prompt_types.get(question_type, MultipleTypesSingleChoiceQuestionTemplate)


@dataclass
class DynamicTypesQuestionTemplate:
    task: str = (
        "First, you will be given instructions, then - the source material. INSTRUCTIONS: Generate a quiz in JSON format to assess students' knowledge based on the source material. The quiz should cover the source material thoroughly. Use different question types for the best result. The types are: \n"
    )
    quiz_example: str = ""
    quiz_structure: str = ""
    quiz_constraints: str = ""
    user_prompt: str = "Additional settings for generating: {additional_prompt}. "
    another_lang: str = (
        "Generate the name, questions' content, and answers' content in {language}. "
    )
    difficulty: str = "The difficulty of tasks is {difficulty}. "
    language: str = (
        " Identify the language of the source material and generate the name, questions' content, and answers' content in this language. "
    )
    question_number_sentence: str = "Generate a suitable number of questions of each type."
    return_questions: str = (
        "Generate at least 10 questions to comprehensively cover the source material. Ensure that the questions cover various sections of the source material."
    )
    return_sentence: str = (
        """Return a valid JSON object for a quiz: { "name": "{generated name}", "questions": [{generated_questions}]}. The quiz name is a short phrase (one to four words) describing the material. Cover the SOURCE MATERIAL: """
    )

    def build_dynamic_types(
        self,
        question_types: list[dict],
        text: str,
        language: str | None = None,
        difficulty: str | None = None,
        additional_prompt: str | None = None,
    ) -> str:
        prompt = self.task

        for question in question_types:
            question_type = question["name"]
            type_number = type_number_dict[question_type]
            prompt += self.build_one_dynamic_type_part(question_type, type_number) + "\n"

        prompt += (
            self.language if language == "Auto" else self.another_lang.format(language=language)
        )
        prompt += self.difficulty.format(difficulty=difficulty) if difficulty else ""
        prompt += (
            self.user_prompt.format(additional_prompt=additional_prompt)
            if additional_prompt
            else ""
        )
        prompt += self.return_questions + "\n"
        prompt += self.return_sentence + "\n"
        prompt += text

        return prompt

    def build_one_dynamic_type_part(self, question_type: str, type_number: int):
        generation_type = dynamic_type_prompt_mapper(question_type)
        question_number_sentence = generation_type.question_number_sentence

        return f"{generation_type.task.format(type_number=type_number)} {generation_type.quiz_structure} {generation_type.quiz_example} {generation_type.quiz_constraints} {question_number_sentence}"


@dataclass
class DynamicTypesSingleChoiceQuestionTemplate(DynamicTypesQuestionTemplate):
    task: str = "Type number {type_number}: single-choice question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct'. There is one correct answer and three incorrect answers. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "single_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text":  "Carbon dioxide", "is_correct": true}, {"text":  "Oxygen", "is_correct": false}, {"text":  "Nitrogen", "is_correct": false}, {"text":  "Hydrogen", "is_correct": false}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out; it should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answer is longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )
    question_number_sentence: str = "Generate 3 or more single-choice questions."


@dataclass
class DynamicTypesMultipleChoiceQuestionTemplate(DynamicTypesQuestionTemplate):
    task: str = "Type number {type_number}: multiple-choice question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct.'. There are two or three correct answers and three or two incorrect ones. The total number of answers is four. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "multiple_choice", "question": "What is the main greenhouse gas responsible for climate change?", "answers": [{"text": "Carbon dioxide", "is_correct": true},{"text": "Oxygen", "is_correct": true},{"text": "Nitrogen", "is_correct": false},{"text": "Hydrogen", "is_correct": false}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answers should not stand out; they should neither be shorter nor longer than the incorrect answers. Additionally, all answers should not exceed 75 characters. If the correct answers are longer than the other options, consider either shortening the correct answer or lengthening the incorrect answers. "
    )
    question_number_sentence: str = "Generate 3 or more multiple-choice questions."


@dataclass
class DynamicTypesFillInChoiceQuestionTemplate(DynamicTypesQuestionTemplate):
    task: str = "Type number {type_number}: fill-in-the-blank task."
    language: str = "Tasks should be in the language of the material. "
    another_language: str = "Tasks should be in {language_name}. "
    difficulty: str = """The difficulty of tasks is {difficulty_level}. """
    quiz_structure: str = (
        """The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the answer and a boolean field 'is_correct.'. There is one correct answer and three incorrect. The total number of answers is four. The task text is a sentence that contains "[...]" instead of an answer, and the user must choose the correct answer to fill in. """
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "fill_in","task": "The capital of France is [...].","answers": [{"text": "Paris", "is_correct": true},{"text": "London", "is_correct": false},{"text": "Berlin", "is_correct": false},{"text": "Rome", "is_correct": false}]}. There must be only one [...] blank space and one correct answer in the output. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = (
        "Ensure that the task text is limited to 200 characters, and the correct answer should not stand out. "
    )
    question_number_sentence: str = "Generate 2 or more fill-in-the-blank tasks."


@dataclass
class DynamicTypesMatchingQuestionTemplate(DynamicTypesQuestionTemplate):
    task: str = "Type number {type_number}: matching question."
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of answers. Each answer includes the text of the term and its corresponding matching answer. There are four answers in total. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "matching","question": "choose the item in column 2 that best matches each item in column 1","answers": [{"text": "Removal of certain pathogens on living tissues", "answer": "Antiseptics"},{"text": "Removal of all living organisms", "answer": "Disinfectants"},{"text": "Removal of certain pathogens on living tissues", "answer": "Pasteurization"},{"text": "Removal of certain pathogens on surfaces or objects", "answer": "Sterilization"}]}. NOTE: Do not include any of the previous examples in the generated output. """
    )
    quiz_constraints: str = (
        "Ensure that the question text is limited to 200 characters, and the correct answer should not stand out. Additionally, all answer texts should not exceed 75 characters.  "
    )
    question_number_sentence: str = "Generate 2 or more matching questions."


@dataclass
class DynamicTypesOpenQuestionTemplate(DynamicTypesQuestionTemplate):
    task: str = "Type number {type_number}: opened question. "
    quiz_structure: str = (
        "The JSON question object should contain a quiz name and a list of questions. Each question should have a type, question text, and a list of one answer. The answer includes the text of the answer and an 'is_correct' field that is always true. "
    )
    quiz_example: str = (
        """The JSON question object format is as follows: {"type": "opened","question": "What is the difference between antiseptics and disinfectants?","answers": [{"text": "The main difference is ...", "is_correct": true}]}. NOTE: Do not include any of the previous examples in the output. """
    )
    quiz_constraints: str = "Ensure that the question text is limited to 200 characters. "
    question_number_sentence: str = "Generate 2 or more opened questions."


def dynamic_type_prompt_mapper(question_type: str):
    prompt_types = {
        QuestionTypes.SingleChoice: DynamicTypesSingleChoiceQuestionTemplate,
        QuestionTypes.MultipleChoice: DynamicTypesMultipleChoiceQuestionTemplate,
        QuestionTypes.FillInChoice: DynamicTypesFillInChoiceQuestionTemplate,
        QuestionTypes.Matching: DynamicTypesMatchingQuestionTemplate,
        QuestionTypes.Open: DynamicTypesOpenQuestionTemplate,
    }

    return prompt_types.get(question_type, DynamicTypesSingleChoiceQuestionTemplate)


@dataclass
class CheckOpenQuestion:
    task: str = (
        "Given a question rate the answer 0 (wrong) or 1 (correct). "
        "Use your knowledge and the context provided to assess the answer's accuracy, completeness, and relevance to the question. Rate an incomplete answer as 0 (wrong)."
        "Additionally, if the user's answer is the same as the question itself, rate it as 0 (wrong)."
    )
    return_sentence: str = "Return only 0 or 1."

    question: str = ""
    correct_answer: str = ""
    user_answer: str = ""

    def build_open_question_check(
        self,
        question: str,
        correct_answer: str,
        user_answer: str | None = None,
    ) -> str:
        prompt = f"{self.task}\nQuestion: {question}\nContext: {correct_answer}\nUser Answer: {user_answer}\n{self.return_sentence}"
        return prompt


def get_prompt(
    dynamic_types_request,
    language,
    difficulty,
    additional_prompt,
    text,
    question_types,
):
    multiple_types_request = False
    if dynamic_types_request:
        prompt = DynamicTypesQuestionTemplate().build_dynamic_types(
            question_types,
            text=text,
            language=language,
            difficulty=difficulty,
            additional_prompt=additional_prompt,
        )
    else:
        if len(question_types) == 1:
            prompt = type_prompt_mapper(question_types[0]["name"]).build(
                text=text,
                questions_num=question_types[0]["number_of_questions"],
                language=language,
                difficulty=difficulty,
                additional_prompt=additional_prompt,
            )
        else:
            multiple_types_request = True
            prompt = MultipleTypesQuestionTemplate().build(
                question_types,
                text=text,
                language=language,
                difficulty=difficulty,
                additional_prompt=additional_prompt,
            )
    return prompt, multiple_types_request
