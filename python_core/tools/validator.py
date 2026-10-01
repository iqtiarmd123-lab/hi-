import re
from typing import Dict, Any, Tuple, Optional
from python_core.tools.registry import ToolRegistry, ToolDefinition

class ToolValidator:
    """Validates tool parameters against definitions and sanitizes against injection."""
    
    DANGEROUS_CHARS = re.compile(r'[;&|`$><\\!]', re.IGNORECASE)
    
    @classmethod
    def sanitize_param_value(cls, val: Any) -> str:
        s = str(val).strip()
        if cls.DANGEROUS_CHARS.search(s):
            raise ValueError(f"Parameter value contains prohibited shell metacharacters: {s}")
        return s

    @classmethod
    def build_command(
        cls,
        tool: ToolDefinition,
        target: str,
        params: Dict[str, Any],
    ) -> Tuple[bool, str, str]:
        """
        Builds the safe command string from template.
        Returns: (success, command_string, error_message)
        """
        clean_params = {"target": cls.sanitize_param_value(target)}
        
        for p in tool.parameters:
            raw_val = params.get(p.name, p.default_value)
            if p.required and raw_val is None:
                return False, "", f"Missing required parameter: '{p.name}'"
                
            if raw_val is not None:
                try:
                    if p.type == "number":
                        clean_params[p.name] = str(int(raw_val))
                    elif p.type == "boolean":
                        clean_params[p.name] = p.flag if bool(raw_val) else ""
                    elif p.type == "select":
                        val_str = cls.sanitize_param_value(raw_val)
                        if p.options and val_str not in p.options:
                            return False, "", f"Invalid option '{val_str}' for parameter '{p.name}'. Allowed: {p.options}"
                        clean_params[p.name] = val_str
                    else:
                        clean_params[p.name] = cls.sanitize_param_value(raw_val)
                except Exception as e:
                    return False, "", f"Parameter error on '{p.name}': {str(e)}"
            else:
                clean_params[p.name] = ""
                
        try:
            cmd = tool.command_template.format(**clean_params)
            # Normalize whitespace
            cmd = " ".join(cmd.split())
            return True, cmd, ""
        except KeyError as e:
            return False, "", f"Template missing parameter: {str(e)}"
