import os
from datetime import timedelta

class Config:
    # ─── Secret Keys ─────────────────────────────────────────────────
    SECRET_KEY = os.environ.get("SECRET_KEY", "your-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)

    # ─── PostgreSQL Database (GCP Cloud SQL) ─────────────────────────
    # Format: postgresql://username:password@host:port/database_name
    DB_USER     = os.environ.get("DB_USER",     "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "yourpassword")
    DB_HOST     = os.environ.get("DB_HOST",     "localhost")       # GCP Cloud SQL Private IP
    DB_PORT     = os.environ.get("DB_PORT",     "5432")
    DB_NAME     = os.environ.get("DB_NAME",     "college_diary")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─── For GCP Cloud SQL (SSL) ──────────────────────────────────────
    # Uncomment below if connecting via SSL
    # SQLALCHEMY_ENGINE_OPTIONS = {
    #     "connect_args": {
    #         "sslmode": "require",
    #         "sslrootcert": "/path/to/server-ca.pem",
    #         "sslcert":     "/path/to/client-cert.pem",
    #         "sslkey":      "/path/to/client-key.pem",
    #     }
    # }
