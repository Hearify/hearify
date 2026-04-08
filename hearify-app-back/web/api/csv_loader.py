import arrow
import csv
import os

from math import floor
from string import ascii_lowercase, ascii_uppercase
from xhtml2pdf import pisa

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import FileResponse
from reportlab.graphics.shapes import Drawing, Circle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Table, TableStyle

from schemas import user
from starlette.background import BackgroundTasks
from api.dependencies import (
    get_current_user,
    get_database,
    get_quiz_process_repository,
    QuizProcessRepository,
)

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

router = APIRouter()


@router.get("/{class_code}/csv")
async def load_quiz_statistic(
    bg_tasks: BackgroundTasks,
    class_code: str,
    database=Depends(get_database),
    quiz_process_repo: QuizProcessRepository = Depends(
        get_quiz_process_repository
    ),
    current_user: user.UserDB = Depends(get_current_user),
):
    csv_file_path = f"{class_code}.csv"

    quiz = await database["quizzes"].find_one({"class_code": class_code})
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    quiz_processes = (
        await quiz_process_repo.get_distinct_processes_by_class_code(class_code)
    )
    if not quiz_processes:
        raise HTTPException(
            status_code=status.HTTP_200_OK,
            detail="No student completed the quiz.",
        )

    correct_answers_counter = 0
    question_counter = 1
    current_user_index = 1

    csv_results = [
        [
            "Student name",
        ]
    ]
    while question_counter <= len(quiz["questions"]):
        csv_results[0].append(f"Q{question_counter}")
        csv_results[0].append(f"Question {question_counter} text")
        question_counter += 1
    next_headers = [
        "Number of questions",
        "Total score",
        "Total %",
        "Total time",
        "Date & time",
    ]
    csv_results[0][:] = [*csv_results[0], *next_headers]

    for process in quiz_processes:
        if process["is_submitted"]:
            all_answers = process["answers"]
            if "user_id" in process:
                current_user = await database["users"].find_one(
                    {"_id": ObjectId(process["user_id"])}
                )
                csv_results.append(
                    [f"{current_user['first_name']} {current_user['surname']}"]
                )
            else:
                csv_results.append([process["user_name"]])

            for answer in all_answers:
                if answer["is_correct"]:
                    is_correct = "1"
                    correct_answers_counter += 1
                else:
                    is_correct = "0"
                csv_results[current_user_index].append(f"{is_correct}")
                csv_results[current_user_index].append(
                    f"{answer['question_text']}"
                )

            total_score = floor(
                (correct_answers_counter / len(quiz["questions"])) * 100
            )
            total_time = arrow.get(process["submitted_at"]) - arrow.get(
                process["created_at"]
            )

            next_headers = [
                f"{len(quiz['questions'])}",
                f"{correct_answers_counter}",
                f"{total_score}%",
                f"{total_time}",
                f"{arrow.get(process['submitted_at']).format()}",
            ]
            csv_results[current_user_index][:] = [
                *csv_results[current_user_index],
                *next_headers,
            ]

            current_user_index += 1
            correct_answers_counter = 0
        else:
            print("Not submitted process")

    with open(csv_file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerows(csv_results)

    bg_tasks.add_task(os.remove, csv_file_path)

    return FileResponse(csv_file_path, background=bg_tasks)


@router.get("/{class_code}/csv/{process_id}")
async def load_user_quiz_statistic(
    bg_tasks: BackgroundTasks,
    class_code: str,
    process_id: str | None,
    database=Depends(get_database),
):
    csv_file_path = f"{class_code}-{process_id}.csv"

    quiz_process = await database["quiz_process"].find_one(
        {
            "_id": ObjectId(process_id),
            "class_code": class_code,
            "is_submitted": True,
        }
    )

    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such quiz process not found",
        )

    summary_table = [
        [
            "Student name",
            "Correct answers",
            "Incorrect answers",
            "Total number of questions",
            "Total %",
            "Total time",
            "Date & Time",
        ]
    ]

    if "user_id" in quiz_process:
        current_user = await database["users"].find_one(
            {"_id": ObjectId(quiz_process["user_id"])}
        )
        summary_table.append(
            [f"{current_user['first_name']} {current_user['surname']}"]
        )
    else:
        summary_table.append([quiz_process["user_name"]])

    correct_answers = quiz_process["correct_answers"]
    incorrect_answers = (
        quiz_process["questions"] - quiz_process["correct_answers"]
    )
    total_num_of_questions = quiz_process["questions"]
    total_percentage = floor((correct_answers / total_num_of_questions) * 100)
    total_time = arrow.get(quiz_process["submitted_at"]) - arrow.get(
        quiz_process["created_at"]
    )
    date_and_time = quiz_process["submitted_at"]

    summary_table_data = [
        correct_answers,
        incorrect_answers,
        total_num_of_questions,
        total_percentage,
        total_time,
        date_and_time,
    ]

    summary_table[1][:] = [*summary_table[1], *summary_table_data]

    summary_table.append(" ")

    answers_table = [
        "Question number",
        "Question text",
        "Student answer",
        "Points earned",
    ]
    question_counter = 1
    summary_table.append(answers_table)

    for answer in quiz_process["answers"]:
        answer_data = [
            question_counter,
            answer["question_text"],
            answer["answer"],
            1 if answer["is_correct"] else 0,
        ]
        summary_table.append(answer_data)
        question_counter += 1

    with open(csv_file_path, mode="w", newline="") as file:
        writer = csv.writer(file)
        writer.writerows(summary_table)

    bg_tasks.add_task(os.remove, csv_file_path)

    return FileResponse(csv_file_path, background=bg_tasks)


@router.get("/{class_code}/pdf")
async def generate_quiz_pdf(
    bg_tasks: BackgroundTasks,
    class_code: str,
    database=Depends(get_database),
):
    pdf_file_path = f"{class_code}.pdf"
    quiz = await database["quizzes"].find_one({"class_code": class_code})
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz with such class_code has not been found or you are not the owner of it.",
        )

    def generate_html(quiz_name: str, data: str):
        html_content = f"""
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta charset="UTF-8">
            <style>
                @font-face {{
                    font-family: ArialUnicode;
                    src: url('fonts/Arial Unicode MS.ttf') format('truetype');
                }}
                body {{
                    font-family: ArialUnicode;
                    margin: 0;
                    padding: 0;
                }}

                .container {{
                    width: 100%;
                    padding: 16px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                    padding-left: 30px;
                }}

                .quiz_title {{
                    text-align: center;
                    font-size: 32px;
                    font-weight: 700;
                    line-height: 150%;
                    margin-top: 16px;
                    margin-bottom: 32px;
                }}

                .symbol {{
                    font-size: 26px;
                }}

                .question_text {{
                    font-size: 26px;
                }}

                .question_answer {{
                }}

                .question_answer p{{
                    font-size: 26px;
                }}

                .answers_title {{
                    text-align: center;
                    font-size: 28px;
                    font-weight: 700;
                    line-height: 150%;
                    margin-top: 16px;
                    margin-bottom: 32px;
                }}

                .answers {{
                    font-size: 14px;
                }}

                .new_page {{
                    page-break-before: always;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <p class="quiz_title">{quiz_name}</p>
                {data}
            </div>
        </body>
        </html>
        """
        return html_content

    answers = []
    cycle_count = 1
    question_number = 1
    data = ""
    for question_id in quiz["questions"]:
        answer_counter = 0
        question = await database["questions"].find_one(
            {"_id": ObjectId(question_id)}
        )
        if question:
            if (
                question["type"] == "single_choice"
                or question["type"] == "binary"
            ):
                data += f"""
                <div class="question">
                    <div class="question_text">
                        <b>{question_number}) {question['question']}</b>
                    </div>
                    <div class="question_answer">
                """
                for answer in question["answers"]:
                    data += f"""
                        <p><span class="symbol">○</span> {answer['text']}</p>
                    """
                    if answer["correct"]:
                        answers.append(
                            f"Question {question_number}||||| {answer['text']}"
                        )
            elif question["type"] == "multiple_choice":
                data += f"""
                <div class="question">
                    <div class="question_text">
                        <p>{question_number}) {question['question']}</p>
                    </div>
                    <div class="question_answer">
                """
                for answer in question["answers"]:
                    data += f"""
                        <p><span class="symbol">▢</span> {answer['text']}</p>
                    """
                    if answer["correct"]:
                        answers.append(
                            f"<br>Question {question_number}||||| {answer['text']}<br>"
                        )

            elif question["type"] == "matching":
                data += f"""
                <div class="question">
                    <div class="question_text">
                        <p>{question_number}) {question['question']}</p>
                    </div>
                    <div class="question_answer">
                """
                q_texts = []
                q_answers = []
                for answer in question["answers"]:
                    answers.append(
                        f"<br>Question {question_number}||||| {answer['text']} - {answer['correct']}<br>"
                    )
                    q_texts.append(answer["text"])
                    q_answers.append(answer["correct"])
                text_counter = 1
                for text in q_texts:
                    data += f"""
                            <p>{answer_counter+1}) {text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{ascii_lowercase[answer_counter]}) {q_answers[text_counter*(-1)]}</p>
                        """
                    answer_counter += 1
                    text_counter += 1
            elif question["type"] == "fill_in":
                data += f"""
                <div class="question">
                    <div class="question_text">
                        <p>{question_number}) {question['question']}</p>
                    </div>
                    <div class="question_answer">
                """
                for answer in question["answers"]:
                    data += f"""
                                <p><span class="symbol">○</span> {answer['text']}</p>
                    """
                    if answer["correct"]:
                        answers.append(
                            f"Question {question_number}||||| {answer['text']}"
                        )
            elif question["type"] == "opened":
                data += f"""
                <div class="question">
                    <div class="question_text">
                        <p>{question_number}) {question['question']}</p>
                        <br>
                        <br>
                        <br>
                        <br>
                    </div>
                    <div class="question_answer">
                """
                answers.append(
                    f"Question {question_number}||||| {question['answers'][0]['text']}"
                )
            data += f"""
                </div>
            </div>
            """
            question_number += 1

    data += f"""
    <div class="new_page">
        <div class="answers_container">
            <div class="answers_title">Answers</div>
            <div class="answers">
    """

    question_number = 0
    finalized_answers = []
    for answer in answers:
        finalized_answers.append([f"Question {question_number + 1}"])
        question_num = (
            answer.split("Question ")[1].split(" ")[0].replace("|||||", "")
        )
        finalized_answers[int(question_num) - 1].append(answer)
        question_number += 1

    question_number = 1
    for final_answer in finalized_answers:
        result = f"Q{question_number}: "
        answer_count = 1
        for item in final_answer:
            small = item.replace(f"Question {question_number}", "").replace(
                "|||||", ""
            )
            if small == "":
                continue
            result += f"{small}"
            result += " "
            answer_count += 1
        if (
            len(result.replace(f"Q{question_number}: ", "").replace(" ", ""))
            == 0
        ):
            result = ""

        data += f"""
            <p>{result}</p>
            <br>
        """
        question_number += 1
    data += f"""
            </div>
        </div>
    </div>
    """

    html_content = generate_html(quiz_name=quiz["name"], data=data)
    with open(pdf_file_path, "w+b") as f:
        pisa.CreatePDF(html_content, dest=f, encoding="UTF-8")

    bg_tasks.add_task(os.remove, pdf_file_path)

    headers = {
        "Content-Disposition": f"attachment; filename=quiz-{class_code}.pdf"
    }
    return FileResponse(
        pdf_file_path,
        media_type="application/pdf",
        headers=headers,
        background=bg_tasks,
    )


@router.get("/{class_code}/pdf/{process_id}")
async def load_user_quiz_statistic_pdf(
    bg_tasks: BackgroundTasks,
    class_code: str,
    process_id: str | None,
    database=Depends(get_database),
):
    def format_timedelta(td):
        # Extract days, hours, minutes
        days = td.days
        hours, remainder = divmod(td.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        # Generate the formatted string
        parts = []
        if days > 0:
            parts.append(f"{days} days")
        if hours > 0:
            parts.append(f"{hours} hours")
        if minutes > 0:
            parts.append(f"{minutes} minutes")
        if seconds > 0:
            parts.append(f"{seconds} seconds")

        # Join the parts with a comma and space
        return ", ".join(parts)

    def generate_html(
        quiz_name: str,
        user_name: str,
        correct_answers: str,
        general_score: str,
        total_time: str,
        rows: str,
    ):
        html_content = f"""
        <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta charset="UTF-8">
            <style>
                @font-face {{
                    font-family: ArialUnicode;
                    src: url('fonts/Arial Unicode MS.ttf') format('truetype');
                }}

                body {{
                    font-family: ArialUnicode;
                    margin: 0;
                    padding: 0;
                }}

                .container {{
                    width: 100%;
                    padding: 16px;
                    box-sizing: border-box;
                    display: flex;
                    align-items: center;
                }}

                .quiz_name {{
                  text-align: center;
                  font-size: 28px;
                  font-weight: 700;
                  line-height: 150%;
                  margin-top: 16px;
                }}

                .user_name {{
                    text-align: center;
                    font-size: 20px;
                    font-weight: 700;
                }}

                p {{
                  margin-top: 12px;
                  font-size: 14px;
                  font-weight: 400;
                  line-height: 20px;
                  color: #15343a;
                }}

                .general_info {{
                                      box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    width: 100%;
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 16px;
                    box-sizing: border-box;
                }}

                .general_info table {{
                      box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    width: 100%;
                    border-collapse: collapse;
                    border-radius: 12px;
                }}

                .general_info td {{
                    padding: 8px;
                    text-align: center;
                }}

                .general_info td:last-child {{
                    border-right: none;
                }}

                .table {{
                    box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    border-radius: 25px;
                    width: 100%;
                    margin-bottom: 16px;
                    box-sizing: border-box;
                }}

                .header_row {{
                    box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    border: 1px solid #ddd;
                    border-radius: 12px;
                    padding: 4px;
                }}

                .header_row td {{
                    box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    border: 1px solid #ddd;
                    text-align: center;
                }}

                .question_row td {{
                    box-shadow:
                              1.313px 1.969px 0px 0px rgba(255, 255, 255, 0.6) inset,
                              -12.177px 36.69px 44.901px 0px rgba(81, 78, 120, 0.18);
                    background-color: #FAF9FF;
                    padding: 8px;
                    border: 1px solid #ddd;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="quiz_name">{quiz_name}</h1>
                <h3 class="user_name">{user_name} results</h3>
                <div class="general_info">
                    <table>
                        <tr>
                            <td class="general_score"><p>General score: {general_score}%</p></td>
                            <td class="info_line"><p>✓ Correct answers: {correct_answers}</p></td>
                            <td class="info_line"><p>★ Total time: {total_time}</p></td>
                        </tr>
                    </table>
                </div>
                <div class="table">
                    <table>
                        <tr class="header_row">
                            <td style="width: 5%;"><p>#</p></td>
                            <td style="width: 45%;"><p>Question</p></td>
                            <td style="width: 10%;"><p>Correct</p></td>
                            <td style="width: 40%;"><p>Answer</p></td>
                        </tr>
                        {rows}
                    </table>
                </div>
            </div>
        </body>
        </html>
        """
        return html_content

    pdf_file_path = f"{class_code}-{process_id}.pdf"

    quiz_process = await database["quiz_process"].find_one(
        {
            "_id": ObjectId(process_id),
            "class_code": class_code,
            "is_submitted": True,
        }
    )
    quiz = await database["quizzes"].find_one({"class_code": class_code})
    if not quiz_process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Such quiz process not found",
        )

    correct_answers = quiz_process["correct_answers"]
    total_num_of_questions = quiz_process["questions"]
    total_percentage = floor((correct_answers / total_num_of_questions) * 100)
    total_time = arrow.get(quiz_process["submitted_at"]) - arrow.get(
        quiz_process["created_at"]
    )
    formatted_total_time = format_timedelta(total_time)

    if "user_id" in quiz_process:
        try:
            db_user = await database["users"].find_one(
                {"_id": ObjectId(quiz_process["user_id"])}
            )
            current_user = f"{db_user['first_name']} {db_user['surname']}"
        except TypeError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Current user does not exist.",
            )
    else:
        current_user = quiz_process["user_name"]

    question_counter = 1
    answers_data = []
    for answer in quiz_process["answers"]:
        res = []
        if isinstance(answer["answer"], list):
            answers = ""
            for ans in answer["answer"]:
                try:
                    answers += f"{ans['text']} - {ans['answer']}<br>\n"
                    res = [
                        question_counter,
                        answer["question_text"],
                        "✓" if answer["is_correct"] else "✗",
                        answers,
                    ]
                except TypeError:
                    answers += f"{ans}<br>"
                    res = [
                        question_counter,
                        answer["question_text"],
                        "✓" if answer["is_correct"] else "✗",
                        answers,
                    ]
        else:
            res = [
                question_counter,
                answer["question_text"],
                "✓" if answer["is_correct"] else "✗",
                answer["answer"],
            ]
        question_counter += 1
        answers_data.append(res)

    rows = ""
    for result in answers_data:
        row = f"""
        <tr class="question_row">
            <td style="width: 5%;"><p>{result[0]}</p></td>
            <td style="width: 45%;"><p>{result[1]}</p></td>
            <td style="width: 10%;"><p>{result[2]}</p></td>
            <td style="width: 40%;"><p>{result[3]}</p></td>
        </tr>
        """
        rows += row

    # Save HTML to a temporary file
    html_content = generate_html(
        quiz_name=quiz["name"],
        user_name=current_user,
        correct_answers=f"{correct_answers}/{total_num_of_questions}",
        general_score=total_percentage,
        total_time=formatted_total_time,
        rows=rows,
    )
    with open(pdf_file_path, "w+b") as f:
        pisa.CreatePDF(html_content, dest=f, encoding="UTF-8")

    bg_tasks.add_task(os.remove, pdf_file_path)

    headers = {
        "Content-Disposition": f"attachment; filename=quiz-{class_code}-results.pdf"
    }
    return FileResponse(
        pdf_file_path,
        media_type="application/pdf",
        headers=headers,
        background=bg_tasks,
    )
