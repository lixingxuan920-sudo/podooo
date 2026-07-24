from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


api_dir = Path(__file__).parent / "vedic-python-api"
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

api_path = api_dir / "main.py"
spec = importlib.util.spec_from_file_location("vedic_python_api_main", api_path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Cannot load Vedic API from {api_path}")

module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

app = module.app
