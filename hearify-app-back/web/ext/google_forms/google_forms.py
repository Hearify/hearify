import os

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from core import config

SCOPES = ["https://www.googleapis.com/auth/forms.body"]
DISCOVERY_DOC = "https://forms.googleapis.com/$discovery/rest?version=v1"

def get_authentication_url():
    CLIENT_SECRETS_PATH = os.path.join(os.path.dirname(__file__), "client_secrets.json")

    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_PATH, scopes=SCOPES)
    flow.redirect_uri = f'{config.FRONTEND_URL}/google_forms/oauth/callback'
    auth_url = flow.authorization_url(prompt='consent')

    return auth_url

def get_credentials(state: str, code: str):
    CLIENT_SECRETS_PATH = os.path.join(os.path.dirname(__file__), "client_secrets.json")

    flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS_PATH, scopes=SCOPES, state=state)
    flow.redirect_uri = f'{config.FRONTEND_URL}/google_forms/oauth/callback'
    flow.fetch_token(code=code)

    return flow.credentials

def save_form_on_client(creds: Credentials, form_data: dict):
    service = build('forms', 'v1', credentials=creds, discoveryServiceUrl=DISCOVERY_DOC, static_discovery=False)

    NEW_FORM = form_data["new_form"]
    result = service.forms().create(body=NEW_FORM).execute()

    FORM_SETTINGS = form_data["settings"]
    service.forms().batchUpdate(formId=result["formId"], body=FORM_SETTINGS).execute()

    for NEW_QUESTION in form_data["questions"]:
        service.forms().batchUpdate(formId=result["formId"], body=NEW_QUESTION).execute()

    get_result = service.forms().get(formId=result["formId"]).execute()
    return {"ok": True, "formUrl": get_result.get('responderUri', '')}


def create_google_form(quiz) -> dict:
    form_data = {"questions": []}

    NEW_FORM = {
        "info": {
            "title": quiz['name'],
            "documentTitle": quiz['name']
        }
    }
    form_data["new_form"] = NEW_FORM

    FORM_SETTINGS = {
        "requests": [
            {
                "updateSettings": {
                    "settings": {
                        "quizSettings": {
                            "isQuiz": True
                        }
                    },
                    "updateMask": "quizSettings"
                }
            }
        ]
    }
    form_data["settings"] = FORM_SETTINGS

    for index, question in enumerate(quiz['questions']):
        if question['type'] == 'matching':

            for ans in question['answers']:
                NEW_QUESTION = {
                    "requests": [
                        {
                            "createItem": {
                                "item": {
                                    "title": question['question'] + ": " + ans["text"],
                                    "questionItem": {
                                        "question": {
                                            "required": True,
                                        }
                                    },
                                },
                                "location": {"index": index},
                            }
                        }
                    ]
                }

                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['choiceQuestion'] = {
                    "type": "RADIO",
                    "options": [{"value": answer["correct"]} for answer in question['answers']],
                    "shuffle": True
                }
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['grading'] = {
                    "pointValue": 1,
                    "correctAnswers": {
                        "answers": [{"value": ans['correct']} for answer in question['answers'] if answer["text"] == ans["text"]]
                    },
                }
                form_data["questions"].append(NEW_QUESTION)
        else:
            NEW_QUESTION = {
                "requests": [
                    {
                        "createItem": {
                            "item": {
                                "title": question['question'],
                                "questionItem": {
                                    "question": {
                                        "required": True,
                                    }
                                },
                            },
                            "location": {"index": index},
                        }
                    }
                ]
            }
            if question['type'] == 'single_choice':
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['choiceQuestion'] = {
                    "type": "RADIO",
                    "options": [{"value": ans['text']} for ans in question['answers']],
                    "shuffle": True
                }
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['grading'] = {
                    "pointValue": 1,
                    "correctAnswers": {
                        "answers": [{"value": ans['text']} for ans in question['answers'] if ans["correct"]]
                    },
                }
            elif question['type'] == 'multiple_choice':
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['choiceQuestion'] = {
                    "type": "CHECKBOX",
                    "options": [{"value": ans['text']} for ans in question['answers']],
                    "shuffle": True
                }
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['grading'] = {
                    "pointValue": 1,
                    "correctAnswers": {
                        "answers": [{"value": ans['text']} for ans in question['answers'] if ans["correct"]]
                    },
                }
            elif question['type'] == 'fill_in':
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['choiceQuestion'] = {
                    "type": "DROP_DOWN",
                    "options": [{"value": ans['text']} for ans in question['answers']],
                    "shuffle": True
                }
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['grading'] = {
                    "pointValue": 1,
                    "correctAnswers": {
                        "answers": [{"value": ans['text']} for ans in question['answers'] if ans["correct"]]
                    },
                }
            elif question['type'] == 'opened':
                NEW_QUESTION['requests'][0]['createItem']['item']['questionItem']['question']['textQuestion'] = {
                    "paragraph": True
                }
            form_data["questions"].append(NEW_QUESTION)

    return form_data