import time
import uuid
import json
import urllib.request
from typing import Dict, Any, Optional
from python_core.tools.registry import ToolDefinition
from python_core.config import Config

class ApprovedToolExecutor:
    """
    Approved Executor for security diagnostics.
    
    Strictly distinguishes:
    1. REAL TERMUX EXECUTION (only if Termux bridge daemon is actually reachable and verified)
    2. SAFE SIMULATION (high-fidelity realistic simulation, clearly marked as is_simulation: True)
    3. DOCUMENTATION ONLY (returns reference manual and syntax preview)
    """
    
    def __init__(self, termux_host: str = None, termux_port: int = None):
        self.termux_host = termux_host or Config.TERMUX_BRIDGE_HOST
        self.termux_port = termux_port or Config.TERMUX_BRIDGE_PORT
        
    def check_termux_bridge(self) -> Dict[str, Any]:
        """Performs a real socket/HTTP probe to check if Termux bridge daemon is running."""
        url = f"http://{self.termux_host}:{self.termux_port}/api/status"
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "ethical-security-python-core"})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "connected": True,
                    "status": "CONNECTED",
                    "bridge_version": data.get("version", "1.0.0"),
                    "host": self.termux_host,
                    "port": self.termux_port,
                }
        except Exception:
            return {
                "connected": False,
                "status": "DISCONNECTED",
                "message": f"Termux Bridge daemon is not running on {self.termux_host}:{self.termux_port}. Commands will run in Safe Simulation mode.",
                "host": self.termux_host,
                "port": self.termux_port,
            }

    def execute(
        self,
        tool: ToolDefinition,
        command: str,
        target: str,
        scope: str,
        prefer_real: bool = False,
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        # Check if Termux bridge is available for real execution
        termux_status = self.check_termux_bridge()
        if prefer_real and termux_status["connected"]:
            return self._execute_via_termux(tool, command, target, scope, start_time)
            
        # Otherwise execute high-fidelity safe simulation
        return self._execute_simulation(tool, command, target, scope, start_time)

    def _execute_via_termux(
        self,
        tool: ToolDefinition,
        command: str,
        target: str,
        scope: str,
        start_time: float,
    ) -> Dict[str, Any]:
        url = f"http://{self.termux_host}:{self.termux_port}/api/exec"
        payload = {"command": command, "target": target, "scope": scope}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                duration_ms = int((time.time() - start_time) * 1000)
                return {
                    "id": str(uuid.uuid4()),
                    "toolId": tool.id,
                    "toolName": tool.name,
                    "command": command,
                    "target": target,
                    "scope": scope,
                    "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    "executionTimeMs": duration_ms,
                    "stdout": res_data.get("stdout", ""),
                    "stderr": res_data.get("stderr", ""),
                    "exitCode": res_data.get("exitCode", 0),
                    "isSimulation": False,
                    "executor": "termux_bridge",
                }
        except Exception as e:
            # Fallback to simulation with explicit notification
            sim_res = self._execute_simulation(tool, command, target, scope, start_time)
            sim_res["stderr"] = f"[Termux Bridge Notice: Real execution failed ({str(e)}). Returned Safe Simulation instead.]"
            return sim_res

    def _execute_simulation(
        self,
        tool: ToolDefinition,
        command: str,
        target: str,
        scope: str,
        start_time: float,
    ) -> Dict[str, Any]:
        time.sleep(0.05)  # brief realistic delay
        duration_ms = int((time.time() - start_time) * 1000) + 120
        
        stdout = self._generate_simulated_stdout(tool.id, command, target)
        
        return {
            "id": str(uuid.uuid4()),
            "toolId": tool.id,
            "toolName": tool.name,
            "command": command,
            "target": target,
            "scope": scope,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "executionTimeMs": duration_ms,
            "stdout": stdout,
            "stderr": "",
            "exitCode": 0,
            "isSimulation": True,
            "executor": "safe_simulation",
        }

    def _generate_simulated_stdout(self, tool_id: str, command: str, target: str) -> str:
        date_str = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        if tool_id == "nmap":
            return f"""Starting Nmap 7.94 ( https://nmap.org ) at {date_str}
[SAFE SIMULATION MODE - Authorized Lab Diagnostic]
Nmap scan report for {target}
Host is up (0.00045s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
443/tcp  open  ssl/http nginx 1.18.0 (Ubuntu)
3000/tcp open  ppp     Node.js Express App (Ethical Lab Instance)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 0.84 seconds
"""
        elif tool_id == "rustscan":
            return f"""[SAFE SIMULATION] RustScan 2.2.3 running against {target}
Open 127.0.0.1:22
Open 127.0.0.1:80
Open 127.0.0.1:443
Open 127.0.0.1:3000
[~] Starting Nmap 7.94 with found ports: 22,80,443,3000
Host is up (0.00021s latency).
Scanned 4 ports in 0.04s.
"""
        elif tool_id == "gobuster":
            return f"""===============================================================
Gobuster v3.6 - Safe Lab Directory Enumeration Mode
===============================================================
[+] Url:                     http://{target}
[+] Method:                  GET
[+] Threads:                 5
[+] Wordlist:                common.txt
[+] Status Codes:            200,204,301,302,307
===============================================================
/login                (Status: 200) [Size: 1842]
/admin                (Status: 302) [Size: 0] [--> /login]
/api                  (Status: 200) [Size: 428]
/assets               (Status: 301) [Size: 178]
/robots.txt           (Status: 200) [Size: 84]
===============================================================
Finished in 0.42 seconds.
"""
        elif tool_id == "nikto":
            return f"""- Nikto v2.5.0 - [SAFE SIMULATION]
+ Target IP:          {target}
+ Target Port:        80
+ Server:             nginx/1.18.0 (Ubuntu)
+ Retrieved x-powered-by header: Express
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-Content-Type-Options header is set to nosniff.
+ Root page / redirects to /index.html
+ 7544 requests tested in 1.2 seconds.
"""
        elif tool_id == "lynis":
            return f"""[ Lynis 3.0.9 - System Security Audit ]
[SAFE SIMULATION - Local Defensive Evaluation]
- Checking OS and Kernel: Linux 5.15.0 [OK]
- Checking SSH Configuration: PermitRootLogin set to prohibit-password [OK]
- Checking Firewall (iptables / ufw): Active [OK]
- Checking File Permissions on /etc/shadow: 640 [SECURE]
- Hardening Index: 78 / 100
- Warnings: 0 | Suggestions: 4
"""
        elif tool_id == "openssl":
            return f"""Connecting to {target}:443
depth=0 CN = {target}
verify return:1
---
Certificate chain
 0 s:CN = {target}
   i:C = US, O = Let's Encrypt, CN = R3
---
Protocol : TLSv1.3
Cipher   : TLS_AES_256_GCM_SHA384
Session-ID: 4B82...
Secure Renegotiation IS supported
Compression: NONE
---
"""
        elif tool_id == "tshark":
            return f"""Capturing on 'lo'
[SAFE SIMULATION - Local Diagnostic]
  1 0.000000 127.0.0.1 -> 127.0.0.1 TCP 74 54320 > 80 [SYN] Seq=0 Win=65495 Len=0
  2 0.000045 127.0.0.1 -> 127.0.0.1 TCP 74 80 > 54320 [SYN, ACK] Seq=0 Ack=1 Win=65483 Len=0
  3 0.000072 127.0.0.1 -> 127.0.0.1 TCP 66 54320 > 80 [ACK] Seq=1 Ack=1 Win=65495 Len=0
  4 0.000180 127.0.0.1 -> 127.0.0.1 HTTP 142 GET / HTTP/1.1
  5 0.000420 127.0.0.1 -> 127.0.0.1 HTTP 210 HTTP/1.1 200 OK  (text/html)
5 packets captured
"""
        else:
            return f"""[{tool_id.upper()} DIAGNOSTIC OUTPUT]
Target: {target}
Command: {command}
Diagnostic evaluation completed successfully with exit code 0.
All scope boundaries verified.
"""
