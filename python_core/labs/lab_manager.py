from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class LabTask:
    id: str
    title: str
    description: str
    completed: bool = False
    verification_tool: Optional[str] = None

@dataclass
class LabEnvironment:
    id: str
    name: str
    type: str  # 'web_vuln' | 'network' | 'phishing_awareness' | 'ctf' | 'docker'
    description: str
    description_bn: str
    target_host: str
    target_port: int
    network: str
    difficulty: str
    docker_command: Optional[str] = None
    tasks: List[LabTask] = field(default_factory=list)
    status: str = "IDLE"  # 'IDLE' | 'RUNNING' | 'STOPPED'

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "descriptionBn": self.description_bn,
            "targetHost": self.target_host,
            "targetPort": self.target_port,
            "network": self.network,
            "difficulty": self.difficulty,
            "dockerCommand": self.docker_command,
            "status": self.status,
            "tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "description": t.description,
                    "completed": t.completed,
                    "verificationTool": t.verification_tool,
                }
                for t in self.tasks
            ]
        }

class LabManager:
    """Manages authorized training environments and educational simulators."""
    
    def __init__(self):
        self._labs: Dict[str, LabEnvironment] = {}
        self._load_labs()

    def list_all(self) -> List[LabEnvironment]:
        return list(self._labs.values())

    def get(self, lab_id: str) -> Optional[LabEnvironment]:
        return self._labs.get(lab_id)

    def _load_labs(self):
        # 1. OWASP Juice Shop
        self._labs["juice-shop"] = LabEnvironment(
            id="juice-shop",
            name="OWASP Juice Shop",
            type="web_vuln",
            description="Intentionally insecure modern JavaScript web app demonstrating the OWASP Top 10.",
            description_bn="ওওয়াস্প টপ ১০ শেখার জন্য বিশেষভাবে নির্মিত আধুনিক জাভাস্ক্রিপ্ট ওয়েব অ্যাপ্লিকেশন।",
            target_host="127.0.0.1",
            target_port=3000,
            network="lab-bridge (isolated)",
            difficulty="Easy to Hard",
            docker_command="docker run -d -p 3000:3000 --name juice-shop bkimminich/juice-shop",
            tasks=[
                LabTask("task-1", "Inspect HTTP response headers with curl", "Verify absence of Content-Security-Policy header", False, "curl"),
                LabTask("task-2", "Port Scan Localhost", "Detect open port 3000 using Nmap -sV", False, "nmap"),
            ]
        )

        # 2. DVWA
        self._labs["dvwa"] = LabEnvironment(
            id="dvwa",
            name="DVWA (Damn Vulnerable Web App)",
            type="web_vuln",
            description="PHP/MySQL web application vulnerable to SQL injection, XSS, and command execution.",
            description_bn="এসকিউএল ইনজেকশন, এক্সএসএস এবং কমান্ড ইনজেকশন শেখার জন্য ক্লাসিক পিএইচপি ল্যাব।",
            target_host="127.0.0.1",
            target_port=8080,
            network="lab-bridge (isolated)",
            difficulty="Easy to Medium",
            docker_command="docker run -d -p 8080:80 --name dvwa vulnerables/web-dvwa",
            tasks=[
                LabTask("task-1", "Test HTTP accessibility", "Perform GET request to DVWA login portal", False, "curl"),
                LabTask("task-2", "Directory Enumeration", "Discover /login.php and /vulnerabilities with Gobuster", False, "gobuster"),
            ]
        )

        # 3. Safe Phishing Awareness Simulator
        self._labs["phishing-sim"] = LabEnvironment(
            id="phishing-sim",
            name="Safe Phishing Awareness Simulator",
            type="phishing_awareness",
            description="Educational security awareness simulator using strictly synthetic dummy credentials that never leave the browser.",
            description_bn="নিরাপদ সচেতনতামূলক ফিশিং সিমুলেটর যা সম্পূর্ণ ফেক তথ্যে পরিচালিত হয় এবং কোনো পাসওয়ার্ড সংগ্রহ করে না।",
            target_host="127.0.0.1",
            target_port=8090,
            network="browser-memory-only",
            difficulty="Educational",
            docker_command=None,
            tasks=[
                LabTask("task-1", "Analyze Sender Domain", "Spot deceptive subdomain (e.g. account-update.phish.test)", False, "whois"),
                LabTask("task-2", "Inspect Link Target", "Verify that simulated anchor tags mismatch target URLs", False, "browser"),
                LabTask("task-3", "Review Defense Training", "Study safe reporting procedure for enterprise SOC", False, "doc"),
            ]
        )

        # 4. WebGoat
        self._labs["webgoat"] = LabEnvironment(
            id="webgoat",
            name="OWASP WebGoat",
            type="web_vuln",
            description="Deliberately insecure Java-based web application with interactive learning lessons.",
            description_bn="ইন্টারেক্টিভ পাঠ সম্বলিত ওওয়াস্প ওয়েবগোট জাভা প্রশিক্ষণ ল্যাব।",
            target_host="127.0.0.1",
            target_port=8081,
            network="lab-bridge (isolated)",
            difficulty="Medium",
            docker_command="docker run -d -p 8081:8080 --name webgoat webgoat/webgoat",
            tasks=[
                LabTask("task-1", "Local listener check", "Verify port 8081 listener using Nmap", False, "nmap")
            ]
        )
