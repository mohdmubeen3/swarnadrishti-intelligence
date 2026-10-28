import os
import sys
from pathlib import Path
from alembic.config import Config
from alembic import command
from db.session import Base
from sqlalchemy import create_engine

def verify_clean_migration():
    backend_dir = Path(__file__).resolve().parent
    temp_db_path = backend_dir / "data" / "temp_migration_test.db"
    
    if temp_db_path.exists():
        temp_db_path.unlink()

    temp_db_url = f"sqlite:///{temp_db_path.as_posix()}"
    os.environ["DATABASE_URL"] = temp_db_url

    alembic_ini = backend_dir / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))
    alembic_cfg.set_main_option("sqlalchemy.url", temp_db_url)

    print(f"Applying 'alembic upgrade head' on fresh database: {temp_db_path.name}...")
    command.upgrade(alembic_cfg, "head")

    print("Running 'alembic check' to verify zero schema drift...")
    command.check(alembic_cfg)

    # Clean up
    if temp_db_path.exists():
        temp_db_path.unlink()

    print("PASS: Clean database migration and schema check succeeded with zero drift.")

if __name__ == "__main__":
    verify_clean_migration()
