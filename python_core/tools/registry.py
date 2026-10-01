from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class ToolParameter:
    name: str
    flag: str
    type: str  # 'string' | 'number' | 'boolean' | 'select'
    description: str
    description_bn: Optional[str] = None
    default_value: Any = None
    options: List[str] = field(default_factory=list)
    required: bool = False

@dataclass
class ToolDefinition:
    id: str
    name: str
    category: str
    description: str
    platform: str  # 'linux' | 'android' | 'multi' | 'docker'
    availability: str  # 'AVAILABLE' | 'NOT_INSTALLED' | 'DOCUMENTATION_ONLY'
    required_permissions: int  # 0-100
    risk_level: str  # 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    parameters: List[ToolParameter]
    command_template: str
    documentation: str
    executor: str  # 'safe_simulation' | 'termux_bridge' | 'docker_lab' | 'doc_only'
    supported_scopes: List[str]
    description_bn: Optional[str] = None
    installed: bool = False
    requires_confirmation: bool = False

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "descriptionBn": self.description_bn,
            "platform": self.platform,
            "availability": self.availability,
            "required_permissions": self.required_permissions,
            "risk_level": self.risk_level,
            "parameters": [
                {
                    "name": p.name,
                    "flag": p.flag,
                    "type": p.type,
                    "description": p.description,
                    "descriptionBn": p.description_bn,
                    "defaultValue": p.default_value,
                    "options": p.options,
                    "required": p.required,
                }
                for p in self.parameters
            ],
            "command_template": self.command_template,
            "documentation": self.documentation,
            "executor": self.executor,
            "supported_scopes": self.supported_scopes,
            "installed": self.installed,
            "requiresConfirmation": self.requires_confirmation,
        }

class ToolRegistry:
    """Modular Tool Registry containing all authorized security tool definitions."""
    
    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}
        self._load_default_catalog()

    def register(self, tool: ToolDefinition) -> None:
        self._tools[tool.id] = tool

    def get(self, tool_id: str) -> Optional[ToolDefinition]:
        return self._tools.get(tool_id)

    def list_all(self) -> List[ToolDefinition]:
        return list(self._tools.values())

    def filter_by_category(self, category: str) -> List[ToolDefinition]:
        return [t for t in self._tools.values() if t.category.lower() == category.lower()]

    def _load_default_catalog(self):
        # 1. Nmap
        self.register(ToolDefinition(
            id="nmap",
            name="Nmap",
            category="Port Scanning & Discovery",
            description="Premier network exploration, port scanner, and service fingerprinting engine.",
            description_bn="নেটওয়ার্ক অনুসন্ধান, পোর্ট স্ক্যান এবং সার্ভিস ভার্সন সনাক্তকরণের প্রধান ওপেন-সোর্স টুল।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=35,
            risk_level="LOW",
            parameters=[
                ToolParameter("scanType", "-sT", "select", "Scan protocol type", "স্ক্যানের ধরন", "-sT", ["-sT", "-sV", "-sC", "-sn"]),
                ToolParameter("ports", "-p", "string", "Target ports or range (e.g., 80,443)", "টার্গেট পোর্ট বা রেঞ্জ", "80,443"),
                ToolParameter("timing", "-T3", "select", "Timing template", "টাইমিং প্রোফাইল", "-T3", ["-T2", "-T3", "-T4"]),
            ],
            command_template="nmap {scanType} -p {ports} {timing} {target}",
            documentation="https://nmap.org/book/man.html",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB", "USER_AUTHORIZED_TARGET"],
            installed=True,
            requires_confirmation=False,
        ))

        # 2. RustScan
        self.register(ToolDefinition(
            id="rustscan",
            name="RustScan",
            category="Port Scanning & Discovery",
            description="Ultra-fast modern port scanner written in Rust that pipes directly into Nmap.",
            description_bn="রাস্টে লিখিত অত্যন্ত দ্রুতগতির আধুনিক পোর্ট স্ক্যানার।",
            platform="linux",
            availability="AVAILABLE",
            required_permissions=40,
            risk_level="LOW",
            parameters=[
                ToolParameter("batchSize", "-b", "number", "Batch size for concurrent packet dispatch", "একযোগে প্রেরিত প্যাকেটের ব্যাচ সাইজ", 1000),
            ],
            command_template="rustscan -a {target} -b {batchSize}",
            documentation="https://github.com/RustScan/RustScan",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB"],
            installed=True,
        ))

        # 3. Wireshark / TShark
        self.register(ToolDefinition(
            id="tshark",
            name="TShark / Wireshark",
            category="Packet Analysis",
            description="Terminal-based packet analyzer and protocol decoder from the Wireshark project.",
            description_bn="ওয়াইয়ারশার্ক প্রকল্পের টার্মিনালভিত্তিক প্যাকেট বিশ্লেষক।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=30,
            risk_level="SAFE",
            parameters=[
                ToolParameter("interface", "-i", "string", "Network interface", "নেটওয়ার্ক ইন্টারফেস", "lo"),
                ToolParameter("count", "-c", "number", "Packet capture limit", "সর্বোচ্চ প্যাকেট সংখ্যা", 10),
                ToolParameter("filter", "-f", "string", "BPF capture filter", "ক্যাপচার ফিল্টার", "tcp port 80"),
            ],
            command_template="tshark -i {interface} -c {count} -f \"{filter}\"",
            documentation="https://www.wireshark.org/docs/man-pages/tshark.html",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB"],
            installed=True,
        ))

        # 4. Gobuster
        self.register(ToolDefinition(
            id="gobuster",
            name="Gobuster",
            category="Web Security",
            description="High-speed directory, file, and DNS subdomain enumeration tool written in Go.",
            description_bn="ওয়েব সার্ভারে গোপন ফাইল ও ডিরেক্টরি দ্রুতগতিতে উন্মোচনের টুল।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=45,
            risk_level="MEDIUM",
            parameters=[
                ToolParameter("mode", "dir", "select", "Enumeration mode", "এনুমারেশন মোড", "dir", ["dir", "dns", "vhost"]),
                ToolParameter("threads", "-t", "number", "Concurrent threads limit", "সর্বোচ্চ সমান্তরাল থ্রেড", 5),
            ],
            command_template="gobuster {mode} -u http://{target} -t {threads} -w /usr/share/wordlists/dirb/common.txt",
            documentation="https://github.com/OJ/gobuster",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB"],
            installed=True,
            requires_confirmation=False,
        ))

        # 5. Nikto
        self.register(ToolDefinition(
            id="nikto",
            name="Nikto",
            category="Web Security",
            description="Open-source web server scanner that tests for dangerous files and outdated versions.",
            description_bn="ওয়েব সার্ভারের কনফিগারেশন ত্রুটি ও ঝুঁকিপূর্ণ ফাইল পরীক্ষক।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=50,
            risk_level="MEDIUM",
            parameters=[
                ToolParameter("tuning", "-Tuning", "string", "Test tuning categories", "টিউনিং ক্যাটাগরি", "1,2,3"),
            ],
            command_template="nikto -h {target} -Tuning {tuning}",
            documentation="https://cirt.net/Nikto2",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB"],
            installed=True,
        ))

        # 6. Nuclei
        self.register(ToolDefinition(
            id="nuclei",
            name="Nuclei",
            category="Vulnerability Assessment",
            description="Fast and customizable vulnerability scanner powered by community YAML templates.",
            description_bn="কমিউনিটি টেমপ্লেট ভিত্তিক আধুনিক দ্রুতগতির দুর্বলতা পরীক্ষক।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=65,
            risk_level="MEDIUM",
            parameters=[
                ToolParameter("tags", "-tags", "string", "Template tags to filter", "ফিল্টার ট্যাগ", "cve,exposure"),
            ],
            command_template="nuclei -u http://{target} -tags {tags} -severity low,medium",
            documentation="https://nuclei.projectdiscovery.io/",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "AUTHORIZED_LAB"],
            installed=True,
            requires_confirmation=True,
        ))

        # 7. Lynis
        self.register(ToolDefinition(
            id="lynis",
            name="Lynis",
            category="Defensive Security",
            description="Battle-tested security auditing and compliance tool for Unix-based systems.",
            description_bn="ইউনিক্স ও লিনাক্স সিস্টেমের নিরাপত্তা অডিট ও ডিফেন্সিভ হার্ডেনিং টুল।",
            platform="linux",
            availability="AVAILABLE",
            required_permissions=25,
            risk_level="SAFE",
            parameters=[
                ToolParameter("quick", "-Q", "boolean", "Quick automated mode", "স্বয়ংক্রিয় দ্রুত মোড", True),
            ],
            command_template="lynis audit system -Q",
            documentation="https://cisofy.com/lynis/",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST"],
            installed=True,
        ))

        # 8. OpenSSL
        self.register(ToolDefinition(
            id="openssl",
            name="OpenSSL Diagnostics",
            category="Cryptography",
            description="Cryptography toolkit for inspecting SSL/TLS certificates and cipher suites.",
            description_bn="এসএসএল/টিএলএস সার্টিফিকেট ও এনক্রিপশন সাইফার অডিট টুল।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=20,
            risk_level="SAFE",
            parameters=[
                ToolParameter("port", "", "string", "Port to inspect", "টার্গেট পোর্ট", "443"),
            ],
            command_template="openssl s_client -connect {target}:{port} -brief",
            documentation="https://www.openssl.org/docs/",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST", "PRIVATE_NETWORK", "AUTHORIZED_LAB", "USER_AUTHORIZED_TARGET"],
            installed=True,
        ))

        # 9. Semgrep
        self.register(ToolDefinition(
            id="semgrep",
            name="Semgrep",
            category="Source Code Security",
            description="Fast, open-source static analysis engine for finding bugs and enforcing code standards.",
            description_bn="সোর্স কোডের নিরাপত্তা দুর্বলতা সনাক্তকরণ স্ট্যাটিক অ্যানালাইসিস টুল।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=20,
            risk_level="SAFE",
            parameters=[
                ToolParameter("config", "--config", "string", "Ruleset configuration", "নিয়মাবলী কনফিগারেশন", "auto"),
            ],
            command_template="semgrep scan --config {config}",
            documentation="https://semgrep.dev/",
            executor="safe_simulation",
            supported_scopes=["LOCALHOST"],
            installed=True,
        ))

        # 10. Ghidra
        self.register(ToolDefinition(
            id="ghidra",
            name="Ghidra",
            category="Reverse Engineering",
            description="Software reverse engineering framework developed by the NSA.",
            description_bn="সফটওয়্যার রিভার্স ইঞ্জিনিয়ারিং ও বাইনারি বিশ্লেষণ ফ্রেমওয়ার্ক।",
            platform="multi",
            availability="AVAILABLE",
            required_permissions=40,
            risk_level="LOW",
            parameters=[],
            command_template="ghidra-headless /tmp/project MyProject -import {target}",
            documentation="https://ghidra-sre.org/",
            executor="doc_only",
            supported_scopes=["LOCALHOST", "AUTHORIZED_LAB"],
            installed=False,
        ))
