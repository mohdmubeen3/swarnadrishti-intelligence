import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DB_PATH = BASE_DIR / "data" / "swarnadrishti.db"
DEFAULT_DB_PATH.parent.mkdir(parents=True, exist_ok=True)

raw_url = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")
# Ensure compatibility with modern SQLAlchemy URL convention for PostgreSQL
if raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = raw_url

engine_args = {}
if DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_info() -> dict:
    """Return database dialect, driver, and safe connection info."""
    return {
        "dialect": engine.dialect.name,
        "driver": engine.dialect.driver,
        "isSqlite": engine.dialect.name == "sqlite",
        "isPostgres": "postgres" in engine.dialect.name,
        "urlTarget": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else (
            f"sqlite:{DEFAULT_DB_PATH.name}" if "sqlite" in DATABASE_URL else "configured"
        ),
    }


def check_db_connection() -> tuple[bool, str, dict]:
    """Test actual connectivity to the configured database engine."""
    info = get_db_info()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected", info
    except Exception as exc:
        return False, str(exc), info


def init_db():
    """Create all registered tables if they do not already exist."""
    from .models import Base  # noqa
    Base.metadata.create_all(bind=engine)
