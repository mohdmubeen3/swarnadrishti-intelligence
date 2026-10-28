import sys
import subprocess
from pathlib import Path

if __name__ == "__main__":
    backend_script = Path(__file__).resolve().parent / "backend" / "test_migrations.py"
    res = subprocess.run([sys.executable, str(backend_script)])
    sys.exit(res.returncode)
