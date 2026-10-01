import sys
import json
import logging
from typing import Any
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from python_core.ai_core import PythonAICore
from python_core.config import Config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [PythonCore] %(message)s")

# Instantiate singleton AI Core
ai_core = PythonAICore()

class PythonCoreHandler(BaseHTTPRequestHandler):
    
    def _send_json(self, status_code: int, data: Any):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == "/health":
            self._send_json(200, {"status": "ok", "service": "Python AI Core", "version": "1.0.0"})
        elif path == "/status":
            self._send_json(200, ai_core.get_status())
        elif path == "/tools":
            tools = [t.to_dict() for t in ai_core.registry.list_all()]
            self._send_json(200, {"tools": tools, "total": len(tools)})
        elif path == "/labs":
            labs = [l.to_dict() for l in ai_core.lab_mgr.list_all()]
            self._send_json(200, {"labs": labs, "total": len(labs)})
        elif path == "/audit":
            events = ai_core.audit_logger.list_events()
            self._send_json(200, {"events": events, "total": len(events)})
        elif path == "/termux/status":
            self._send_json(200, ai_core.executor.check_termux_bridge())
        else:
            self._send_json(404, {"error": "Endpoint not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        try:
            data = json.loads(body) if body else {}
        except Exception:
            self._send_json(400, {"error": "Invalid JSON body"})
            return

        try:
            if path == "/chat":
                messages = data.get("messages", [])
                lang = data.get("language", "auto")
                mode = data.get("responseMode", "normal")
                sys_prompt = data.get("systemPromptCustom")
                override = data.get("provider")
                res = ai_core.chat(messages, language=lang, response_mode=mode, system_prompt=sys_prompt, provider_override=override)
                self._send_json(200, res)

            elif path == "/analyze":
                output = data.get("output", "")
                tool_name = data.get("toolName", "Security Tool")
                target = data.get("target", "Authorized Target")
                lang = data.get("language", "auto")
                use_llm = data.get("useLLM", False)
                res = ai_core.analyze(output, tool_name, target, language=lang, use_llm=use_llm)
                self._send_json(200, res)

            elif path == "/validate":
                tool_id = data.get("toolId", "")
                target = data.get("target", "")
                params = data.get("parameters", {})
                scope = data.get("scope", "LOCALHOST")
                auth = data.get("isTargetAuthorized", False)
                conf = data.get("hasConfirmed", False)
                res = ai_core.validate_tool_request(tool_id, target, params, scope=scope, is_target_authorized=auth, has_confirmed=conf)
                self._send_json(200, res)

            elif path == "/execute":
                tool_id = data.get("toolId", "")
                target = data.get("target", "")
                params = data.get("parameters", {})
                scope = data.get("scope", "LOCALHOST")
                auth = data.get("isTargetAuthorized", False)
                conf = data.get("hasConfirmed", False)
                user_req = data.get("userRequest", "")
                res = ai_core.execute_tool(tool_id, target, params, scope=scope, is_target_authorized=auth, has_confirmed=conf, user_request_text=user_req)
                self._send_json(200, res)

            elif path == "/settings/permission":
                lvl = data.get("level", 30)
                ai_core.permission_mgr.set_level(lvl)
                self._send_json(200, {"success": True, "permission": ai_core.permission_mgr.get_tier_info()})

            elif path == "/settings/budget":
                max_acts = data.get("maxActions")
                reset = data.get("reset", False)
                if reset:
                    ai_core.budget_mgr.reset(max_acts)
                elif max_acts is not None:
                    ai_core.budget_mgr.max_actions = int(max_acts)
                self._send_json(200, {"success": True, "budget": ai_core.budget_mgr.to_dict()})

            elif path == "/audit/clear":
                ai_core.audit_logger.clear()
                self._send_json(200, {"success": True, "message": "Audit history cleared."})

            else:
                self._send_json(404, {"error": "Endpoint not found"})
        except Exception as e:
            logging.error(f"Error handling {path}: {str(e)}", exc_info=True)
            self._send_json(500, {"error": "Internal server error", "details": str(e)})

    def log_message(self, format, *args):
        # Suppress noisy standard request logs
        pass

def run_server(port: int = None, host: str = None):
    port = port or Config.PORT
    host = host or Config.HOST
    server_address = (host, port)
    httpd = ThreadingHTTPServer(server_address, PythonCoreHandler)
    logging.info(f"Python AI Core Daemon running on http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Shutting down Python AI Core Daemon...")
        httpd.server_close()

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else Config.PORT
    run_server(port=port_arg)
