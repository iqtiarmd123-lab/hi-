import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from python_core.providers.base import AIProvider
from python_core.config import Config

class GeminiProvider(AIProvider):
    name = "gemini"
    
    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-3.8-flash"):
        self.api_key = api_key or Config.GEMINI_API_KEY
        self.model = model
        
    def _get_base_system_prompt(self, response_mode: str = "normal", custom_prompt: Optional[str] = None) -> str:
        prompt = f"""You are the AI Assistant for the "Ethical Security AI Assistant" cybersecurity platform.
Your primary role is cybersecurity education, defensive security, authorized lab management, command guidance, and security result analysis.

CRITICAL RULES:
1. Support both English and Bengali (বাংলা).
   - If the user writes in Bengali or requests Bengali, explain concepts in natural, clear, beginner-friendly Bengali (বাংলা).
   - ALWAYS keep all code snippets, tool names (e.g. Nmap, Wireshark, Gobuster), shell commands, flags, configuration options, IP addresses, and API payloads in ENGLISH.
   - Never write Bengali characters inside executable shell commands.
2. Safety and Authorization:
   - Only advise on authorized security research, local labs (DVWA, OWASP Juice Shop, Metasploitable), CTFs, and defensive security.
   - NEVER provide instructions for real malicious attacks, credential theft, real phishing credential harvesting, ransomware, malware deployment, or bypassing security controls without authorization.
   - For phishing education, refer only to the safe educational awareness simulator with fake credentials.
3. Truthfulness:
   - Clearly distinguish between simulation, documentation, generated commands, and real execution.
   - Never claim a command was executed or an IP was scanned unless actual execution output was passed in.
4. Response Mode: {response_mode.upper()}.
   - If BEGINNER: Explain step-by-step with 'What it is', 'Why it is used', and breakdown of each flag.
   - If ADVANCED/EXPERT: Provide concise, high-depth technical mechanics, protocol details, and defensive implications.
"""
        if custom_prompt:
            prompt += f"\nAdditional Context:\n{custom_prompt}\n"
        return prompt

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured for GeminiProvider")

        system_instruction = self._get_base_system_prompt(response_mode, system_prompt)
        
        # Build contents array
        contents = []
        for msg in messages:
            role = "model" if msg.get("role") == "assistant" else "user"
            contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })
            
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
            }
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "aistudio-build-python"}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                candidates = res_body.get("candidates", [])
                if candidates and "content" in candidates[0] and "parts" in candidates[0]["content"]:
                    parts = candidates[0]["content"]["parts"]
                    text = "".join(p.get("text", "") for p in parts)
                    return {
                        "reply": text,
                        "provider": "gemini",
                        "model": self.model,
                        "status": "success",
                    }
                return {
                    "reply": "No content generated.",
                    "provider": "gemini",
                    "model": self.model,
                    "status": "empty",
                }
        except Exception as e:
            raise RuntimeError(f"Gemini API call failed: {str(e)}")

    def analyze_output(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
    ) -> Dict[str, Any]:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured for GeminiProvider")

        lang_label = "Bengali (বাংলা)" if language == "bn" else "English"
        prompt = f"""Analyze the following security tool output from "{tool_name or 'Security Tool'}" executed against target "{target or 'Authorized Target'}".

Output text:
```
{output_text}
```

Language preference: {lang_label}.
(If Bengali, provide explanations in Bengali while keeping tool names, ports, CVEs, and technical indicators in English).

Provide a structured response:
1. SUMMARY: Executive summary of what was found.
2. IMPORTANT FINDINGS: Specific open ports, active services, headers, anomalies, or configuration weaknesses.
3. ERRORS / WARNINGS: Any connectivity errors, timeouts, or scan issues.
4. POSSIBLE CAUSES: Why these findings or errors occurred.
5. TECHNICAL EXPLANATION: Protocol level or architectural details.
6. RECOMMENDED SAFE NEXT STEPS: Defensive hardening steps or further safe lab investigation.
7. LEARNING CONCEPTS: Key cybersecurity concepts the student should study related to this result.

NEVER invent CVEs, credentials, or open ports not present in the output.
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}
        }
        
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json", "User-Agent": "aistudio-build-python"}
        )
        
        try:
            with urllib.request.urlopen(req, timeout=12) as response:
                res_body = json.loads(response.read().decode("utf-8"))
                candidates = res_body.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    raw_text = "".join(p.get("text", "") for p in candidates[0]["content"].get("parts", []))
                    return {
                        "rawAnalysis": raw_text,
                        "provider": "gemini",
                        "model": self.model,
                    }
                raise RuntimeError("Empty response from Gemini")
        except Exception as e:
            raise RuntimeError(f"Gemini Analyzer call failed: {str(e)}")
