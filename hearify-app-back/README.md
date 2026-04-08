# QuizAPI

## Development
1) Run `cp .env.example dev.env`
2) Fill all needed env variables in `dev.env`
3) Run project: `docker-compose -f docker-compose-dev.yml up`
4) Go to `localhost:8001/docs`

## Production
1) Run `cp .env.example prod.env`
2) Fill all needed env variables in `prod.env`
3) Run project: `docker-compose -f docker-compose.yml up -d`
4) Go to `yourdomain.smth/docs`


## Downloading data (REDUNDANT)
#### Question-answer model

Download the [multitask-qg-ag model](https://drive.google.com/file/d/1-vqF9olcYOT1hk4HgNSYEdRORq-OD5CF/view?usp=sharing)
checkpoint and place it in the  `ml_service/app/ml_models/question_generation/models/` directory.

#### Distractor generation

Download
the [race-distractors model](https://drive.google.com/file/d/1jKdcbc_cPkOnjhDoX4jMjljMkboF-5Jv/view?usp=sharing)
checkpoint and place it in the  `ml_service/app/ml_models/distractor_generation/models/` directory.

Download [sense2vec](https://github.com/explosion/sense2vec/releases/download/v1.0.0/s2v_reddit_2015_md.tar.gz), extract
it and place the `s2v_old`  folder and place it in
the `ml_service/app/ml_models/sense2vec_distractor_generation/models/` directory.
