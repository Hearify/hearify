FROM python:3.11-slim-bullseye

WORKDIR /usr/src

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

COPY requirements.txt /tmp/requirements.txt

RUN apt-get update -y && apt-get install -y --no-install-recommends build-essential gcc libsndfile1 && apt-get install -y ffmpeg

RUN pip3 install --upgrade pip \
    && pip3 install "setuptools<70" wheel \
    && echo "setuptools<70" > /tmp/constraints.txt \
    && PIP_CONSTRAINT=/tmp/constraints.txt pip3 install --no-cache-dir -r /tmp/requirements.txt \
    && rm -rf /root/.cache/pip /tmp/constraints.txt /tmp/requirements.txt

COPY web/ /usr/src/

WORKDIR /usr/src

CMD ["uvicorn", "main:application_factory", "--workers", "2", "--host", "0.0.0.0", "--port", "8001"]
