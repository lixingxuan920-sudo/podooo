from __future__ import annotations

import importlib.util
from pathlib import Path


api_path = Path(__file__).parent / "vedic-python-api" / "main.py"
spec = importlib.util.spec_from_file_location("vedic_python_api_main", api_path)
if spec is None or spec.loader is None:
    raise RuntimeError(f"Cannot load Vedic API from {api_path}")

module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

app = module.app
