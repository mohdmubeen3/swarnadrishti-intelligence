import sys
from pathlib import Path
from logging.config import fileConfig
from sqlalchemy import create_engine, pool
from alembic import context

# Ensure backend root is on sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from db.session import Base, DATABASE_URL
import db.models  # noqa: register models with metadata

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_target_url() -> str:
    url = config.get_main_option("sqlalchemy.url")
    if not url or "driver://" in url:
        return DATABASE_URL
    return url


def run_migrations_offline() -> None:
    url = get_target_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    url = get_target_url()
    engine_args = {"poolclass": pool.NullPool}
    if "sqlite" in url:
        engine_args["connect_args"] = {"check_same_thread": False}

    connectable = create_engine(url, **engine_args)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
