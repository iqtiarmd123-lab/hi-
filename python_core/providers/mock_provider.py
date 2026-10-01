from typing import List, Dict, Any, Optional
from python_core.providers.base import AIProvider

class MockProvider(AIProvider):
    name = "mock"
    
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        last_msg = messages[-1]["content"] if messages else ""
        return {
            "reply": f"[MOCK AI RESPONSE] Verified request: '{last_msg}'. Recommended defensive action: Run non-destructive reconnaissance within authorized scope.",
            "provider": "mock",
            "model": "mock-security-evaluator",
            "status": "success",
        }
        
    def analyze_output(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
    ) -> Dict[str, Any]:
        return {
            "summary": f"Mock analysis of {tool_name} for {target}. Output verified.",
            "findings": ["Port 80/tcp OPEN (HTTP)", "Port 443/tcp OPEN (HTTPS)"],
            "errors": [],
            "technicalExplanation": "Synthetic evaluation completed under test harness.",
            "remediation": "Apply defense-in-depth and enforce firewall rules.",
            "learningConcepts": ["Port Security", "Lab Isolation"],
            "provider": "mock",
        }
