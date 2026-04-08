from functools import partial

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import (
    auth,
    files,
    generate_questions,
    quiz,
    quiz_process,
    translations,
    users,
    waitlist,
    questions,
    subscriptions,
    public_quiz,
    brand_kit,
    csv_loader,
    google_forms,
    roadmap,
    quiz_members,
    group_management,
)
from utils import lifespan


def application_factory(openapi_url: str = "/openapi.json") -> FastAPI:
    """"""

    app = FastAPI(lifespan=lifespan, openapi_url=openapi_url)

    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(quiz.router, prefix="/api/quizzes", tags=["quizzes"])
    app.include_router(roadmap.router, prefix="/api/roadmaps", tags=["roadmaps"])
    app.include_router(
        questions.router, prefix="/api/questions", tags=["questions"]
    )
    app.include_router(
        quiz_process.router, prefix="/api/quiz-process", tags=["quiz-processes"]
    )
    app.include_router(files.router, prefix="/api/files", tags=["files"])
    app.include_router(
        translations.router, prefix="/api/translations", tags=["translations"]
    )
    app.include_router(
        waitlist.router, prefix="/api/wait_list", tags=["wait-list"]
    )
    app.include_router(
        subscriptions.router, prefix="/api/subscription", tags=["subscriptions"]
    )
    app.include_router(
        public_quiz.router, prefix="/api/public", tags=["public"]
    )
    app.include_router(
        brand_kit.router, prefix="/api/brand-kit", tags=["brand-kit"]
    )
    app.include_router(
        csv_loader.router, prefix="/api/generator", tags=["generator"]
    )
    app.include_router(
        csv_loader.router, prefix="/api/csv-loader", tags=["csv-loader"]
    )
    app.include_router(
        google_forms.router, prefix="/api/google-forms", tags=["google-forms"]
    )
    app.include_router(
        quiz_members.router, prefix="/api/quiz-members", tags=["quiz-members"]
    )
    app.include_router(
        generate_questions.router, prefix="/api/generate", tags=["generate"]
    )
    app.include_router(
        group_management.router,
        prefix="/api/group-management",
        tags=["group-management"],
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=True,
    )

    return app


test_application_factory = partial(
    application_factory, openapi_url="/api/openapi.json"
)
