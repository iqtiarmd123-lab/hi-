from typing import List, Dict, Any, Optional
from python_core.config import Config
from python_core.providers.base import AIProvider
from python_core.providers.gemini_provider import GeminiProvider
from python_core.providers.local_provider import LocalModelProvider
from python_core.providers.openai_provider import OpenAICompatibleProvider
from python_core.providers.mock_provider import MockProvider

from python_core.security.permission_manager import PermissionManager
from python_core.security.action_budget import ActionBudgetManager
from python_core.security.policy_engine import SecurityPolicyEngine
from python_core.security.scope_validator import ScopeValidator

from python_core.tools.registry import ToolRegistry
from python_core.tools.validator import ToolValidator
from python_core.tools.executor import ApprovedToolExecutor

from python_core.analysis.result_analyzer import ResultAnalyzer
from python_core.automation.engine import WorkflowEngine, WorkflowStep
from python_core.labs.lab_manager import LabManager
from python_core.audit.audit_logger import AuditLogger

class PythonAICore:
    """
    Central Python AI Core.
    Orchestrates the entire Ethical Security AI Assistant workflow:
    User -> AI Understanding -> Structured Tool Request -> Tool Registry -> Validation ->
    Permission Check -> Action Budget -> Scope Check -> Confirmation -> Approved Executor ->
    Result Analyzer -> AI Response.
    """
    
    def __init__(self):
        # Configuration
        self.config = Config
        
        # Security managers
        self.permission_mgr = PermissionManager(Config.DEFAULT_PERMISSION)
        self.budget_mgr = ActionBudgetManager(Config.DEFAULT_MAX_ACTIONS, 0)
        self.policy_engine = SecurityPolicyEngine(self.permission_mgr, self.budget_mgr)
        
        # Tools & Executors
        self.registry = ToolRegistry()
        self.executor = ApprovedToolExecutor(Config.TERMUX_BRIDGE_HOST, Config.TERMUX_BRIDGE_PORT)
        
        # Labs & Automation & Audit
        self.lab_mgr = LabManager()
        self.audit_logger = AuditLogger()
        self.workflow_engine = WorkflowEngine(self.registry, self.policy_engine, self.budget_mgr, self.executor)
        
        # AI Providers
        self.providers: Dict[str, AIProvider] = {
            "gemini": GeminiProvider(Config.GEMINI_API_KEY),
            "local": LocalModelProvider(),
            "openai_compatible": OpenAICompatibleProvider(),
            "mock": MockProvider(),
        }
        self.active_provider_name = Config.DEFAULT_AI_PROVIDER

    @property
    def active_provider(self) -> AIProvider:
        prov = self.providers.get(self.active_provider_name)
        if not prov:
            return self.providers["local"]
        return prov

    def set_provider(self, name: str) -> bool:
        if name in self.providers:
            self.active_provider_name = name
            return True
        return False

    def chat(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        provider_override: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Runs conversational security assistance using selected AI provider with resilient local fallback."""
        prov_name = provider_override or self.active_provider_name
        prov = self.providers.get(prov_name, self.providers["local"])
        
        try:
            return prov.generate_chat_response(
                messages=messages,
                language=language,
                response_mode=response_mode,
                system_prompt=system_prompt,
            )
        except Exception as e:
            # Fallback to local cybersecurity engine if cloud API fails
            local_prov = self.providers["local"]
            res = local_prov.generate_chat_response(
                messages=messages,
                language=language,
                response_mode=response_mode,
                system_prompt=system_prompt,
            )
            res["notice"] = f"Cloud provider '{prov_name}' unavailable ({str(e)}). Answered using local Python security engine."
            return res

    def analyze(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
        use_llm: bool = False,
    ) -> Dict[str, Any]:
        """Analyzes tool output and parses findings safely."""
        if use_llm and self.active_provider_name == "gemini" and Config.GEMINI_API_KEY:
            try:
                return self.providers["gemini"].analyze_output(output_text, tool_name, target, language)
            except Exception:
                pass
                
        # Deterministic evidence-based parsing
        return ResultAnalyzer.analyze(output_text, tool_name, target, language)

    def validate_tool_request(
        self,
        tool_id: str,
        target: str,
        parameters: Dict[str, Any],
        scope: str = "LOCALHOST",
        is_target_authorized: bool = False,
        has_confirmed: bool = False,
    ) -> Dict[str, Any]:
        """Full pipeline pre-execution validation."""
        tool = self.registry.get(tool_id)
        if not tool:
            return {"allowed": False, "status": "BLOCKED", "reason": f"Tool '{tool_id}' not found in registry."}

        # Validate parameters and construct command
        ok, cmd, err = ToolValidator.build_command(tool, target, parameters)
        if not ok:
            return {"allowed": False, "status": "BLOCKED", "reason": f"Parameter validation failed: {err}"}

        # Policy & scope & permission & action check
        eval_result = self.policy_engine.evaluate_request(
            tool_id=tool.id,
            command=cmd,
            target=target,
            scope=scope,
            min_permission=tool.required_permissions,
            requires_confirmation=tool.requires_confirmation,
            is_target_authorized=is_target_authorized,
            has_confirmed=has_confirmed,
            action_cost=1,
        )

        eval_result["command"] = cmd
        eval_result["tool"] = tool.to_dict()
        return eval_result

    def execute_tool(
        self,
        tool_id: str,
        target: str,
        parameters: Dict[str, Any],
        scope: str = "LOCALHOST",
        is_target_authorized: bool = False,
        has_confirmed: bool = False,
        user_request_text: str = "",
    ) -> Dict[str, Any]:
        """Validates and executes an approved tool with budget deduction and audit logging."""
        val = self.validate_tool_request(
            tool_id=tool_id,
            target=target,
            parameters=parameters,
            scope=scope,
            is_target_authorized=is_target_authorized,
            has_confirmed=has_confirmed,
        )

        if not val["allowed"]:
            # Record audit of blocked attempt
            self.audit_logger.record_event(
                user_request=user_request_text or f"Execute {tool_id}",
                tool_id=tool_id,
                tool_name=tool_id,
                target=target,
                scope=scope,
                parameters=parameters,
                permission_level=self.permission_mgr.level,
                confirmation_status="CONFIRMED" if has_confirmed else "NOT_CONFIRMED",
                execution_status=val["status"],
                result_summary="Execution blocked by security policy engine",
                errors=val["reason"],
            )
            return val

        tool = self.registry.get(tool_id)
        cmd = val["command"]

        # Deduct budget
        self.budget_mgr.deduct(1)

        # Execute
        exec_result = self.executor.execute(tool, cmd, target, scope)

        # Record audit log
        self.audit_logger.record_event(
            user_request=user_request_text or f"Execute {tool_id} on {target}",
            tool_id=tool.id,
            tool_name=tool.name,
            target=target,
            scope=scope,
            parameters=parameters,
            permission_level=self.permission_mgr.level,
            confirmation_status="CONFIRMED" if has_confirmed else "NOT_REQUIRED",
            execution_status="SIMULATED" if exec_result["isSimulation"] else "SUCCESS",
            result_summary=f"Executed with exit code {exec_result['exitCode']}",
            errors=exec_result.get("stderr"),
        )

        exec_result["actionsRemaining"] = self.budget_mgr.remaining
        return {"allowed": True, "status": "COMPLETED", "result": exec_result}

    def get_status(self) -> Dict[str, Any]:
        """Provides full real status of Python AI Core."""
        termux_info = self.executor.check_termux_bridge()
        return {
            "status": "ONLINE",
            "runtime": "Python 3.10.12",
            "activeProvider": self.active_provider_name,
            "availableProviders": list(self.providers.keys()),
            "permission": self.permission_mgr.get_tier_info(),
            "actionBudget": self.budget_mgr.to_dict(),
            "termuxBridge": termux_info,
            "toolsCount": len(self.registry.list_all()),
            "labsCount": len(self.lab_mgr.list_all()),
        }
