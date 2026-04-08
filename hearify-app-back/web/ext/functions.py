import random
import smtplib
from email.mime.text import MIMEText

from core.config import SMTP_SERVER, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD


def send_email(recipients: list[str], subject: str, body: str):
    msg = MIMEText(body)
    msg['From'] = SMTP_EMAIL
    msg['Subject'] = subject
    msg['To'] = ', '.join(recipients)
    with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, recipients, msg.as_string())


def generate_code(length: int) -> str:
    """"""
    alphabet, generated = '0123456789', ''

    for i in range(length):
        generated += random.choice(alphabet)

    return generated
