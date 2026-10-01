from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class AIProvider(ABC):
    """Abstract base class for AI Providers in Ethical Security AI Assistant."""
    
    name: str = "base"
    
    @abstractmethod
    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """Generate conversational security assistance."""
        pass
        
    @abstractmethod
    def analyze_output(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
    ) -> Dict[str, Any]:
        """Analyze tool or scan output, extract structured findings, and recommend remediation."""
        pass
