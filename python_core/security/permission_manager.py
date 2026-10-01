from typing import Dict, Any, Tuple

class PermissionManager:
    """
    Manages and validates security permission levels from 0 to 100.
    
    Levels:
    0-20: Learning, documentation, safe simulations, basic defensive analysis
    21-40: Low-risk authorized diagnostics
    41-60: Authorized lab scanning and analysis
    61-80: Advanced authorized security testing
    81-100: High-risk authorized lab operations requiring explicit confirmation
    """
    
    MIN_LEVEL = 0
    MAX_LEVEL = 100
    
    def __init__(self, current_level: int = 30):
        self._level = self._sanitize_level(current_level)
        
    def _sanitize_level(self, level: int) -> int:
        if not isinstance(level, (int, float)):
            raise ValueError(f"Invalid permission level type: {type(level)}")
        level_int = int(level)
        if level_int < self.MIN_LEVEL or level_int > self.MAX_LEVEL:
            raise ValueError(f"Permission level {level_int} is out of bounds (must be between {self.MIN_LEVEL} and {self.MAX_LEVEL})")
        return level_int

    @property
    def level(self) -> int:
        return self._level

    def set_level(self, new_level: int) -> int:
        self._level = self._sanitize_level(new_level)
        return self._level

    def get_tier_info(self) -> Dict[str, Any]:
        lvl = self._level
        if lvl <= 20:
            tier_name = "LEARNING"
            desc = "Learning, documentation, safe simulations, basic defensive analysis"
            allowed_ops = ["DOCUMENTATION", "SAFE_SIMULATION", "LEARNING_ACADEMY", "PASSIVE_ANALYSIS"]
        elif lvl <= 40:
            tier_name = "LOW_RISK_DIAGNOSTICS"
            desc = "Low-risk authorized diagnostics (ping, whois, local port verification)"
            allowed_ops = ["DOCUMENTATION", "SAFE_SIMULATION", "PASSIVE_RECON", "LOCAL_CONNECT_SCAN"]
        elif lvl <= 60:
            tier_name = "AUTHORIZED_LAB_SCANNING"
            desc = "Authorized lab scanning and active service inspection (Nmap -sV, Gobuster, Nikto)"
            allowed_ops = ["ACTIVE_PORT_SCAN", "SERVICE_DETECTION", "WEB_ENUMERATION", "DOCKER_LABS"]
        elif lvl <= 80:
            tier_name = "ADVANCED_SECURITY_TESTING"
            desc = "Advanced authorized security testing and multi-step automation"
            allowed_ops = ["MULTI_STEP_AUTOMATION", "ADVANCED_PROBING", "VULN_SCAN_SCRIPTS"]
        else:
            tier_name = "HIGH_RISK_LAB_OPERATIONS"
            desc = "High-risk authorized lab operations requiring explicit confirmation"
            allowed_ops = ["EXPLOIT_VALIDATION_LAB", "DESTRUCTIVE_SIMULATION", "HIGH_RATE_FUZZING"]
            
        return {
            "level": lvl,
            "tier": tier_name,
            "description": desc,
            "allowed_operations": allowed_ops,
            "requires_explicit_confirmation": lvl > 80,
        }

    def validate_action_permission(self, required_min_level: int) -> Tuple[bool, str]:
        if self._level < required_min_level:
            return (
                False,
                f"Insufficient permission level ({self._level}/100). Tool requires at least {required_min_level}/100. Adjust your permission level in Settings if authorized."
            )
        return True, "Permission level satisfied."
