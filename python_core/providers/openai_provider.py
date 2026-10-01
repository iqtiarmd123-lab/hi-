import json
import urllib.request
import os
from typing import List, Dict, Any, Optional
from python_core.providers.base import AIProvider

class OpenAICompatibleProvider(AIProvider):
    name = "openai_compatible"
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.base_url = (base_url or os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")).rstrip("/")
        self.model = model

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("API Key is missing for OpenAI Compatible Provider")
            
        sys_content = f"You are the Ethical Security AI Assistant. Help with defensive security, authorized labs, learning. Mode: {response_mode}."
        if system_prompt:
            sys_content += f"\n{system_prompt}"
            
        formatted_msgs = [{"role": "system", "content": sys_content}]
        formatted_msgs.extend([{"role": m.get("role", "user"), "content": m.get("content", "")} for m in messages])
        
        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": self.model,
            "messages": formatted_msgs,
            "temperature": temperature,
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}",
            }
        )
        
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                data = json.loads(response.read().decode("utf-8"))
                reply = data["choices"][0]["message"]["content"]
                return {
                    "reply": reply,
                    "provider": "openai_compatible",
                    "model": self.model,
                    "status": "success",
                }
        except Exception as e:
            raise RuntimeError(f"OpenAI compatible API call failed: {str(e)}")

    def analyze_output(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
    ) -> Dict[str, Any]:
        prompt = f"Analyze security output from {tool_name} against {target}:\n\n{output_text}\n\nProvide summary, findings, remediation."
        return self.generate_chat_response([{"role": "user", "content": prompt}], language=language)
