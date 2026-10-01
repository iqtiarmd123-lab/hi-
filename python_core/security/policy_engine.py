import re
from typing import Dict, Any, Tuple, Optional
from python_core.security.permission_manager import PermissionManager
from python_core.security.action_budget import ActionBudgetManager
from python_core.security.scope_validator import ScopeValidator

class SecurityPolicyEngine:
    """
    Evaluates every structured tool request through the comprehensive policy checklist:
    1. Dangerous payload pattern inspection (anti-malware, anti-credential theft)
    2. Target scope verification
    3. Permission level evaluation
    4. Action limit & budget check
    5. Confirmation requirement checks
    """
    
    # Prohibited patterns that violate ethical guidelines
    PROHIBITED_PATTERNS = [
        (r'\b(ransomware|encrypt.*extort)\b', "Ransomware mechanisms are strictly prohibited."),
        (r'\b(credential.*harvest|steal.*passwords?|dump.*lsass)\b', "Credential harvesting or theft is strictly prohibited."),
        (r'\b(botnet|ddos.*flood|synflood)\b', "Volumetric denial-of-service / botnet workflows are prohibited."),
        (r'\b(trojan|keylogger|rootkit|meterpreter.*persistence)\b', "Malware deployment and covert persistence tools are prohibited."),
        (r'(\brm\s+-rf\s+\/|\bdd\s+if=.*of=\/dev\/[sh]d)', "Destructive disk commands are prohibited."),
    ]
    
    def __init__(self, permission_mgr: PermissionManager, budget_mgr: ActionBudgetManager):
        self.permission_mgr = permission_mgr
        self.budget_mgr = budget_mgr

    def evaluate_request(
        self,
        tool_id: str,
        command: str,
        target: str,
        scope: str,
        min_permission: int,
        requires_confirmation: bool = False,
        is_target_authorized: bool = False,
        has_confirmed: bool = False,
        action_cost: int = 1,
    ) -> Dict[str, Any]:
        """
        Runs the full security validation pipeline.
        Returns a dict with:
        {
            "allowed": bool,
            "status": "APPROVED" | "BLOCKED" | "REQUIRES_CONFIRMATION",
            "reason": str,
            "checks": { "policy": bool, "scope": bool, "permission": bool, "budget": bool, "confirmation": bool }
        }
        """
        # 1. Prohibited pattern inspection
        combined_text = f"{command} {target}".lower()
        for pattern, explanation in self.PROHIBITED_PATTERNS:
            if re.search(pattern, combined_text, re.IGNORECASE):
                return {
                    "allowed": False,
                    "status": "BLOCKED",
                    "reason": f"Security Policy Violation: {explanation}",
                    "checks": {"policy": False, "scope": False, "permission": False, "budget": False, "confirmation": False}
                }
                
        # 2. Scope verification
        scope_ok, scope_msg = ScopeValidator.validate_target(target, scope, is_target_authorized)
        if not scope_ok:
            return {
                "allowed": False,
                "status": "BLOCKED",
                "reason": f"Scope Violation: {scope_msg}",
                "checks": {"policy": True, "scope": False, "permission": False, "budget": False, "confirmation": False}
            }
            
        # 3. Permission verification
        perm_ok, perm_msg = self.permission_mgr.validate_action_permission(min_permission)
        if not perm_ok:
            return {
                "allowed": False,
                "status": "BLOCKED",
                "reason": f"Permission Denied: {perm_msg}",
                "checks": {"policy": True, "scope": True, "permission": False, "budget": False, "confirmation": False}
            }
            
        # 4. Action Budget verification
        budget_ok, budget_msg = self.budget_mgr.can_execute(action_cost)
        if not budget_ok:
            return {
                "allowed": False,
                "status": "BLOCKED",
                "reason": f"Action Limit Reached: {budget_msg}",
                "checks": {"policy": True, "scope": True, "permission": True, "budget": False, "confirmation": False}
            }
            
        # 5. Confirmation check
        must_confirm = requires_confirmation or (self.permission_mgr.level > 80)
        if must_confirm and not has_confirmed:
            return {
                "allowed": False,
                "status": "REQUIRES_CONFIRMATION",
                "reason": "This action involves elevated diagnostics or high risk and requires explicit user confirmation.",
                "checks": {"policy": True, "scope": True, "permission": True, "budget": True, "confirmation": False}
            }
            
        # All checks passed!
        return {
            "allowed": True,
            "status": "APPROVED",
            "reason": "All safety, scope, permission, and budget validations passed.",
            "checks": {"policy": True, "scope": True, "permission": True, "budget": True, "confirmation": True}
        }
