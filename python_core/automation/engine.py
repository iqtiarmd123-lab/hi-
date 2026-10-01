import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from python_core.tools.registry import ToolRegistry
from python_core.tools.validator import ToolValidator
from python_core.tools.executor import ApprovedToolExecutor
from python_core.security.permission_manager import PermissionManager
from python_core.security.action_budget import ActionBudgetManager
from python_core.security.policy_engine import SecurityPolicyEngine

@dataclass
class WorkflowStep:
    id: str
    tool_id: str
    name: str
    parameters: Dict[str, Any]
    action_cost: int = 1
    permission_required: int = 30
    stop_on_error: bool = True
    requires_confirmation: bool = False

class WorkflowEngine:
    """
    Executes controlled, authorized multi-step security diagnostics.
    Enforces scope, permission, action limits, and audit recording on each step.
    """
    
    def __init__(
        self,
        registry: ToolRegistry,
        policy_engine: SecurityPolicyEngine,
        budget_mgr: ActionBudgetManager,
        executor: ApprovedToolExecutor,
    ):
        self.registry = registry
        self.policy_engine = policy_engine
        self.budget_mgr = budget_mgr
        self.executor = executor

    def run_pipeline(
        self,
        workflow_id: str,
        name: str,
        target: str,
        scope: str,
        steps: List[WorkflowStep],
        is_target_authorized: bool = False,
    ) -> Dict[str, Any]:
        results = []
        status = "COMPLETED"
        error_msg = ""
        
        for idx, step in enumerate(steps):
            tool = self.registry.get(step.tool_id)
            if not tool:
                status = "FAILED"
                error_msg = f"Unknown tool in workflow: '{step.tool_id}'"
                results.append({
                    "stepId": step.id,
                    "status": "FAILED",
                    "error": error_msg,
                })
                break
                
            # Build command
            ok, cmd, err = ToolValidator.build_command(tool, target, step.parameters)
            if not ok:
                status = "FAILED"
                error_msg = f"Step '{step.name}' validation failed: {err}"
                results.append({
                    "stepId": step.id,
                    "status": "FAILED",
                    "error": error_msg,
                })
                if step.stop_on_error:
                    break
                continue
                
            # Security policy check
            eval_res = self.policy_engine.evaluate_request(
                tool_id=tool.id,
                command=cmd,
                target=target,
                scope=scope,
                min_permission=step.permission_required,
                requires_confirmation=step.requires_confirmation,
                is_target_authorized=is_target_authorized,
                has_confirmed=True,
                action_cost=step.action_cost,
            )
            
            if not eval_res["allowed"]:
                status = "BLOCKED"
                error_msg = f"Step '{step.name}' blocked by security policy: {eval_res['reason']}"
                results.append({
                    "stepId": step.id,
                    "status": "BLOCKED",
                    "reason": eval_res["reason"],
                })
                break
                
            # Deduct budget
            self.budget_mgr.deduct(step.action_cost)
            
            # Execute step
            exec_res = self.executor.execute(tool, cmd, target, scope)
            results.append({
                "stepId": step.id,
                "name": step.name,
                "status": "COMPLETED",
                "command": cmd,
                "actionCostDeducted": step.action_cost,
                "executionResult": exec_res,
            })
            
        return {
            "workflowId": workflow_id,
            "name": name,
            "target": target,
            "scope": scope,
            "status": status,
            "errorMessage": error_msg,
            "totalSteps": len(steps),
            "executedSteps": len(results),
            "stepResults": results,
            "actionsRemaining": self.budget_mgr.remaining,
        }
