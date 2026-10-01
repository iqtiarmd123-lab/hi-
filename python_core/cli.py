import sys
import json
from python_core.ai_core import PythonAICore

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command specified. Usage: python3 -m python_core.cli <command> [json_payload]"}))
        sys.exit(1)
        
    cmd = sys.argv[1]
    payload = {}
    if len(sys.argv) > 2:
        try:
            payload = json.loads(sys.argv[2])
        except Exception as e:
            print(json.dumps({"error": f"Invalid JSON payload: {str(e)}"}))
            sys.exit(1)
            
    core = PythonAICore()
    
    if cmd == "status":
        print(json.dumps(core.get_status()))
    elif cmd == "chat":
        res = core.chat(
            messages=payload.get("messages", []),
            language=payload.get("language", "auto"),
            response_mode=payload.get("responseMode", "normal"),
            system_prompt=payload.get("systemPromptCustom"),
        )
        print(json.dumps(res))
    elif cmd == "analyze":
        res = core.analyze(
            output_text=payload.get("output", ""),
            tool_name=payload.get("toolName", "Security Tool"),
            target=payload.get("target", "127.0.0.1"),
            language=payload.get("language", "auto"),
        )
        print(json.dumps(res))
    elif cmd == "validate":
        res = core.validate_tool_request(
            tool_id=payload.get("toolId", ""),
            target=payload.get("target", "127.0.0.1"),
            parameters=payload.get("parameters", {}),
            scope=payload.get("scope", "LOCALHOST"),
            is_target_authorized=payload.get("isTargetAuthorized", False),
            has_confirmed=payload.get("hasConfirmed", False),
        )
        print(json.dumps(res))
    elif cmd == "execute":
        res = core.execute_tool(
            tool_id=payload.get("toolId", ""),
            target=payload.get("target", "127.0.0.1"),
            parameters=payload.get("parameters", {}),
            scope=payload.get("scope", "LOCALHOST"),
            is_target_authorized=payload.get("isTargetAuthorized", False),
            has_confirmed=payload.get("hasConfirmed", False),
        )
        print(json.dumps(res))
    else:
        print(json.dumps({"error": f"Unknown CLI command: '{cmd}'"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
