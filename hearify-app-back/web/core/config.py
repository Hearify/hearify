import os
import json


# SMTP CONFIGS
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_PORT = os.getenv("SMTP_PORT", default=465)

# TWO_FA REDIS URL
TWO_FA_REDIS = os.getenv("TWO_FA_REDIS")
TWO_FA_ENABLED = os.getenv("TWO_FA_ENABLED") in {"t", "true", "1"}
TWO_FA_REPEAT_DAYS = int(os.getenv("TWO_FA_REPEAT_DAYS"))
TWO_FA_CODE_LIFETIME = int(os.getenv("TWO_FA_CODE_LIFETIME"))  # in minutes

# CELERY
CELERY_BACKEND_URL = os.getenv("CELERY_BACKEND_URL")
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")

# JWT CONFIGS
ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", default=30))
AUDIENCE = "authenticated"

# MONGODB CONFIGS
MONGODB_DATABASE = os.getenv("MONGO_INITDB_DATABASE", default="hearify_db")
MONGO_SELF_HOSTED = os.getenv("MONGO_SELF_HOSTED", default="false")
if MONGO_SELF_HOSTED.lower().strip() in {"true", "t", "1"}:
    MONGODB_USER = os.getenv("MONGO_INITDB_ROOT_USERNAME", default="hearify")
    MONGODB_PASSWORD = os.getenv(
        "MONGO_INITDB_ROOT_PASSWORD", default="password"
    )

    MONGODB_URL = f"mongodb://{MONGODB_USER}:{MONGODB_PASSWORD}@mongodb:27017"
else:
    MONGODB_URL = os.getenv("MONGODB_URL")

# OPENAI_API_KEY
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", default=None)

# GROQ
GROQ_API_KEY = os.getenv("GROQ_API_KEY", default=None)
USE_GROQ = os.getenv("USE_GROQ", "false").lower() in {"true", "1", "t"}
GROQ_BASE_URL = "https://api.groq.com/openai/v1"
GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

# OPENROUTER (fallback)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", default=None)
USE_DEEPSEEK = os.getenv("USE_DEEPSEEK", "false").lower() in {"true", "1", "t"}
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_FALLBACK_MODELS = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "openai/gpt-oss-20b:free",
]

# YOUTUBE — Webshare proxy (proxy.webshare.io → Proxy List → username/password)
WEBSHARE_PROXY_USERNAME = os.getenv("WEBSHARE_PROXY_USERNAME", default=None)
WEBSHARE_PROXY_PASSWORD = os.getenv("WEBSHARE_PROXY_PASSWORD", default=None)

# SUPABASE
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

FILES_STORAGE = os.getenv("FILES_STORAGE", "../files")

PADDLE_SELLER_ID = os.getenv("PADDLE_SELLER_ID")
PADDLE_API_KEY = os.getenv("PADDLE_API_KEY")
PADDLE_API_URL = os.getenv("PADDLE_API_URL")

FRONTEND_URL = os.getenv("FRONTEND_URL")

# GPT 3.5
USE_GPT_3_5 = os.getenv("USE_GPT_3_5") == "True"

# AZURE BLOB STORAGE
STORAGE_ACCOUNT_KEY = os.getenv("STORAGE_ACCOUNT_KEY")
CONNECTION_STRING = os.getenv("CONNECTION_STRING")

GOOGLE_FONTS_API_KEY = os.getenv("GOOGLE_FONTS_API_KEY")

IS_TEST_ENVIRONMENT = os.getenv("IS_TEST_ENVIRONMENT")

PROXY_LIST = json.loads(os.getenv("PROXY_LIST"))
VIDEO_WITH_SUBTITLES = os.getenv("VIDEO_WITH_SUBTITLES")
