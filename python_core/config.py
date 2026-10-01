import os
from typing import Dict, Any

class Config:
    """Central configuration for Python AI Core."""
    PORT = int(os.environ.get("PYTHON_CORE_PORT", 5055))
    HOST = os.environ.get("PYTHON_CORE_HOST", "127.0.0.1")
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
    DEFAULT_AI_PROVIDER = os.environ.get("DEFAULT_AI_PROVIDER", "gemini" if os.environ.get("GEMINI_API_KEY") else "local")
    DEFAULT_MODEL = "gemini-3.8-flash"
    
    # Permission Bounds
    MIN_PERMISSION = 0
    MAX_PERMISSION = 100
    DEFAULT_PERMISSION = 30
    
    # Action Budget Defaults
    DEFAULT_MAX_ACTIONS = 10
    
    # Termux bridge defaults
    TERMUX_BRIDGE_HOST = os.environ.get("TERMUX_BRIDGE_HOST", "127.0.0.1")
    TERMUX_BRIDGE_PORT = int(os.environ.get("TERMUX_BRIDGE_PORT", 8080))
    
    @classmethod
    def to_dict(cls) -> Dict[str, Any]:
        return {
            "port": cls.PORT,
            "host": cls.HOST,
            "has_gemini_key": bool(cls.GEMINI_API_KEY),
            "default_provider": cls.DEFAULT_AI_PROVIDER,
            "default_model": cls.DEFAULT_MODEL,
            "min_permission": cls.MIN_PERMISSION,
            "max_permission": cls.MAX_PERMISSION,
            "default_permission": cls.DEFAULT_PERMISSION,
            "default_max_actions": cls.DEFAULT_MAX_ACTIONS,
            "termux_bridge_host": cls.TERMUX_BRIDGE_HOST,
            "termux_bridge_port": cls.TERMUX_BRIDGE_PORT,
        }
