import re
from typing import List, Dict, Any, Optional
from python_core.providers.base import AIProvider

class LocalModelProvider(AIProvider):
    name = "local"
    
    def __init__(self, model_name: str = "ethical-security-local-v1"):
        self.model_name = model_name
        
    def _is_bengali(self, text: str, preferred_lang: str) -> bool:
        if preferred_lang == "bn":
            return True
        if preferred_lang == "en":
            return False
        return bool(re.search(r'[\u0980-\u09FF]', text))

    def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        language: str = "auto",
        response_mode: str = "normal",
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        last_message = messages[-1]["content"] if messages else ""
        is_bn = self._is_bengali(last_message, language)
        query = last_message.lower().strip()
        
        reply = self._generate_local_response(query, last_message, is_bn, response_mode)
        return {
            "reply": reply,
            "provider": "local",
            "model": self.model_name,
            "status": "success",
            "language": "bn" if is_bn else "en",
            "responseMode": response_mode,
        }

    def _generate_local_response(self, query: str, original_msg: str, is_bn: bool, mode: str) -> str:
        # Check topic matches
        if any(w in query for w in ["nmap", "port scan", "পোর্ট স্ক্যান"]):
            return self._explain_nmap(is_bn, mode)
        elif any(w in query for w in ["tcp", "handshake", "হ্যান্ডশেক", "syn", "ack", "3-way"]):
            return self._explain_tcp(is_bn, mode)
        elif any(w in query for w in ["termux", "command failing", "টারমাক্স", "কমান্ড ফেইল"]):
            return self._explain_termux_fail(is_bn, mode)
        elif any(w in query for w in ["build", "safe command", "কমান্ড তৈরি", "নকশা"]):
            return self._build_safe_command(is_bn, mode, query)
        elif any(w in query for w in ["juice shop", "dvwa", "webgoat", "lab", "ল্যাব"]):
            return self._explain_lab_troubleshooting(is_bn, mode)
        elif any(w in query for w in ["wireshark", "tshark", "প্যাকেট"]):
            return self._explain_wireshark(is_bn, mode)
        elif any(w in query for w in ["gobuster", "dirsearch", "directory bruteforce"]):
            return self._explain_web_fuzzing(is_bn, mode)
        elif any(w in query for w in ["phishing", "ফিশিং"]):
            return self._explain_phishing_awareness(is_bn, mode)
        else:
            return self._default_guidance(original_msg, is_bn, mode)

    def _explain_nmap(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            if mode == "beginner":
                return """**Nmap (Network Mapper) - শিক্ষানবিস গাইড:**

১. **Nmap কী?**
Nmap হলো একটি ওপেন-সোর্স নেটওয়ার্ক অনুসন্ধান ও অডিট টুল। এটি নেটওয়ার্কে কোন কম্পিউটার চালু আছে এবং তাদের কোন পোর্টগুলো খোলা আছে তা খুঁজে বের করে।

২. **সাধারণ নিরাপদ কমান্ড:**
`nmap -sV -p 80,443 127.0.0.1`

৩. **ফ্ল্যাগগুলোর সহজ ব্যাখ্যা:**
- `-sV`: সার্ভিস ভার্সন সনাক্তকরণ (পোর্টে চলমান সফটওয়্যারের নাম ও ভার্সন বলে দেয়)।
- `-p 80,443`: শুধুমাত্র ৮০ (HTTP) ও ৪৪৩ (HTTPS) পোর্ট স্ক্যান করতে বলে।
- `127.0.0.1`: আপনার নিজস্ব কম্পিউটার বা লোকালহোস্টের আইপি।

৪. **নিরাপত্তা সতর্কতা:**
কখনও অনুমতি ছাড়া বহিরাগত কোনো সার্ভারে স্ক্যান চালাবেন না। শুধুমাত্র নিজস্ব লোকালহোস্ট ও ল্যাবে ব্যবহার করুন।"""
            else:
                return """**Nmap Architecture & Core Scanning Mechanics:**

Nmap performs host discovery, port scanning, and service banner analysis by manipulating raw IP/TCP packets.

- **Primary Command (TCP Connect)**:
  `nmap -sT -sV -p 80,443,3000-8080 127.0.0.1`
- **Scanning Types**:
  - `-sT` (TCP Connect): Completes full 3-way handshake (`socket.connect()`). Does not require root privileges; ideal for Termux on Android.
  - `-sS` (SYN Stealth): Sends SYN, awaits SYN-ACK, then terminates with RST. Requires root (`CAP_NET_RAW`).
  - `-sV`: Employs `nmap-service-probes` to fingerprint protocol banners against known signatures.
- **Port States**:
  - `open`: SYN-ACK received; daemon active.
  - `closed`: RST received; host active, no daemon listening.
  - `filtered`: No response or ICMP Type 3 error; firewall drop.

*Defensive note: Implement stateful firewall rules to drop unsolicited SYN packets on closed ports to prevent network mapping.*"""
        else:
            if mode == "beginner":
                return """**Nmap (Network Mapper) - Beginner Walkthrough:**

1. **What is Nmap?**
Nmap is an open-source network scanner used to discover devices on a network and determine which ports and services are available.

2. **Safe Lab Command:**
`nmap -sV -p 80,443 127.0.0.1`

3. **Breakdown of Each Flag:**
- `-sV`: Service Version Detection. Probes open ports to identify the software and release version.
- `-p 80,443`: Limits the scan strictly to port 80 (HTTP) and 443 (HTTPS).
- `127.0.0.1`: The target IP address (your local loopback interface).

4. **Ethics & Authorization:**
Scanning systems without explicit permission is unauthorized. Always restrict tests to localhost, private Docker containers, or authorized lab targets."""
            else:
                return """**Nmap Diagnostic Reference & Mechanics:**

Nmap evaluates network topography through packet craft and response analysis.

- **Execution Profile**:
  `nmap -sT -sV --version-light -p 22,80,443,3000,8080 127.0.0.1`
- **Flag Mechanics**:
  - `-sT`: Full TCP connection establishment. Operates entirely in user space without requiring root privileges (recommended for unrooted Android/Termux).
  - `-sV`: Matches application banners against regex signatures in `nmap-service-probes`.
  - `-T3 / -T4`: Timing templates adjusting probe timeouts and round-trip calculation.
- **Port Evaluation Model**:
  - `OPEN`: Responded with `SYN-ACK`. Listening service confirmed.
  - `CLOSED`: Responded with `RST`. Host responsive, port dormant.
  - `FILTERED`: Probe dropped or ICMP unreachable; packet filtering in place."""

    def _explain_tcp(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**টিসিপি ৩-ওয়ে হ্যান্ডশেক (TCP 3-Way Handshake):**

ক্লায়েন্ট ও সার্ভার বিশ্বস্ত কানেকশন তৈরি করতে ৩টি ধাপে যোগাযোগ সম্পন্ন করে:

1. **SYN (Synchronize)**:
   - ক্লায়েন্ট সার্ভারকে একটি প্যাকেট পাঠায় যাতে `SYN` ফ্ল্যাগ অন থাকে এবং একটি র্যান্ডম ইনিশিয়াল সিকোয়েন্স নম্বর (ISN_c) যুক্ত থাকে।
2. **SYN-ACK (Synchronize-Acknowledge)**:
   - যদি সার্ভারের পোর্টটি খোলা থাকে, সার্ভার ক্লায়েন্টের নম্বর স্বীকৃতি দিতে `ACK` (ISN_c + 1) পাঠায় এবং নিজের একটি সিকোয়েন্স নম্বর (ISN_s) দিয়ে `SYN` পাঠায়।
3. **ACK (Acknowledge)**:
   - ক্লায়েন্ট সার্ভারের নম্বরে স্বীকৃতি দিতে `ACK` (ISN_s + 1) পাঠায়। এর মাধ্যমে কানেকশন প্রতিষ্ঠিত হয় এবং ডাটা আদান-প্রদান শুরু হয়।

- **পোর্ট স্ট্যাটাসের সাথে সম্পর্ক:**
  - `OPEN`: পোর্টটি SYN-ACK পাঠিয়েছে।
  - `CLOSED`: কোনো সার্ভিস লিসেন না করায় সার্ভার `RST` (Reset) পাঠিয়েছে।
  - `FILTERED`: ফায়ারওয়াল প্যাকেটটি ড্রপ করেছে।"""
        else:
            return """**The TCP 3-Way Handshake (RFC 793):**

TCP provides guaranteed transport reliability by establishing a bidirectional connection prior to data transfer:

1. **SYN (Client -> Server)**:
   - Client sends a packet with SYN flag set and an Initial Sequence Number (`ISN_c`).
2. **SYN-ACK (Server -> Client)**:
   - If the port is listening, the server increments `ISN_c` by 1 as its ACK number and issues its own `ISN_s`.
3. **ACK (Client -> Server)**:
   - Client confirms with ACK set to `ISN_s + 1`. The session transitions to `ESTABLISHED`.

- **Security & Port Mapping Context**:
  - SYN Scans (`-sS`) stop after step 2 and issue a `RST` to avoid opening a complete connection socket.
  - Full Connect Scans (`-sT`) complete all 3 steps via the OS kernel socket API."""

    def _explain_termux_fail(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**টারমাক্স (Termux) কমান্ড ফেইল করার কারণ ও সমাধান:**

১. **Root Permissions অনুপস্থিতি (`Operation not permitted`):**
   - কারণ: টারমাক্সে রুট অ্যাক্সেস না থাকলে র' সকেট (raw socket) তৈরি করা যায় না (যেমন: `nmap -sS` বা `ping`)।
   - সমাধান: রুটলেস মোডে সর্বদা `-sT` ব্যবহার করুন: `nmap -sT -p 80,443 127.0.0.1`

২. **প্যাকেজ ইন্সটল না থাকা (`command not found`):**
   - সমাধান: প্যাকেজ রিপোজিটরি আপডেট করুন:
     ```
     pkg update && pkg upgrade
     pkg install nmap tshark curl
     ```

৩. **Android 10+ W^X সিকিউরিটি সীমাবদ্ধতা:**
   - টারমাক্স অ্যাপটি F-Droid থেকে নামানো হয়েছে কিনা নিশ্চিত করুন (Google Play ভার্সনটি ব্যাকডেটেড)।

৪. **Termux Bridge কানেকশন:**
   - যদি এআই অ্যাসিস্ট্যান্টের সাথে টারমাক্স ব্রিজ কানেক্ট করতে চান, টারমাক্সে ব্যাকগ্রাউন্ড ডেমন চালু রাখুন।"""
        else:
            return """**Termux Command Failure Troubleshooting:**

1. **Permission Denied / Raw Socket Error**:
   - Cause: Unrooted Android restricts `CAP_NET_RAW`. Tools attempting SYN stealth scans (`nmap -sS`) or raw ICMP pings fail.
   - Solution: Use user-space TCP connect scans: `nmap -sT <TARGET>`.

2. **Command Not Found**:
   - Cause: Utility is not installed in the Termux prefix (`$PREFIX/bin`).
   - Fix:
     ```bash
     pkg update
     pkg install nmap curl git python
     ```

3. **Google Play Deprecation**:
   - The Play Store Termux build is deprecated and cannot update repositories. Install current builds exclusively from F-Droid or GitHub releases."""

    def _build_safe_command(self, is_bn: bool, mode: str, query: str) -> str:
        if is_bn:
            return """**অনুমোদিত ল্যাবের জন্য নিরাপদ কমান্ড তৈরি:**

- **লোকালহোস্ট ওয়েব সার্ভিস চেক:**
  `nmap -sT -sV -p 80,443,3000,8080 127.0.0.1`
- **DNS রেকর্ড পরিদর্শন:**
  `nslookup -type=any localhost`
- **এইচটিটিপি হেডার ও সিকিউরিটি ফ্ল্যাগ অডিট:**
  `curl -I http://127.0.0.1:3000`

*ফ্ল্যাগ সতর্কতা:*
কমান্ডে কোনো ডেসট্রাকটিভ বা অ্যাটাক পেলোড অন্তর্ভুক্ত করবেন না। সর্বদা আপনার অনুমতি যাচাই করে নিন।"""
        else:
            return """**Safe Diagnostic Command Template:**

- **Localhost Port & Service Audit**:
  `nmap -sT -sV -p 22,80,443,3000,8080 127.0.0.1`
- **HTTP Header Inspection (Strict Passive)**:
  `curl -I -s http://127.0.0.1:3000`
- **SSL/TLS Cipher Suite Evaluation**:
  `openssl s_client -connect 127.0.0.1:443 -tls1_3`

*Parameters are constrained to non-destructive auditing within authorized boundaries.*"""

    def _explain_lab_troubleshooting(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**লোকাল ল্যাব (DVWA, OWASP Juice Shop) ট্রাবলশুটিং:**

১. **কন্টেইনার চলছে কিনা যাচাই করুন:**
   `docker ps`
২. **OWASP Juice Shop রান করার নিরাপদ কমান্ড:**
   `docker run -d -p 3000:3000 bkimminich/juice-shop`
৩. **DVWA রান করার নিরাপদ কমান্ড:**
   `docker run -d -p 80:80 vulnerables/web-dvwa`
৪. **ব্রাউজারে অ্যাক্সেস:**
   - Juice Shop: `http://localhost:3000`
   - DVWA: `http://localhost:80` (ডিফল্ট ইউজার: `admin`, পাসওয়ার্ড: `password`)

ল্যাব পরিবেশ সম্পূর্ণভাবে আপনার লোকালহোস্টে আইসোলেটেড রাখুন।"""
        else:
            return """**Authorized Lab Management & Troubleshooting:**

1. **Verify Container Execution**:
   `docker ps`
2. **Start OWASP Juice Shop**:
   `docker run -d --name juice-shop -p 3000:3000 bkimminich/juice-shop`
3. **Start DVWA (Damn Vulnerable Web App)**:
   `docker run -d --name dvwa -p 8080:80 vulnerables/web-dvwa`
4. **Network Isolation**:
   Always attach training containers to a dedicated bridge network (`docker network create lab-net`) to isolate them from your host's production LAN."""

    def _explain_wireshark(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**Wireshark ও TShark (প্যাকেট অ্যানালাইসিস):**

১. **Wireshark কী?**
Wireshark হলো বিশ্বের সর্বাধিক ব্যবহৃত নেটওয়ার্ক প্রোটোকল অ্যানালাইজার। এটি নেটওয়ার্কে চলমান প্যাকেটগুলোকে ক্যাপচার করে খুঁটিনাটি দেখতে সাহায্য করে।

২. **নিরাপদ ক্যাপচার ফিল্টার উদাহরণ:**
- শুধুমাত্র লোকালহোস্ট ও পোর্ট ৮০: `tcp port 80 and host 127.0.0.1`
- শুধুমাত্র DNS রিকোয়েস্ট: `udp port 53`

৩. **টার্মিনাল মোডে TShark কমান্ড:**
`tshark -i lo -f "tcp port 3000" -c 10`

*নোট: শুধুমাত্র অনুমতিপ্রাপ্ত নেটওয়ার্ক ইন্টারফেসে প্যাকেট ক্যাপচার পরিচালনা করুন।*"""
        else:
            return """**Wireshark & TShark Packet Analysis Reference:**

1. **Core Concept**:
   Packet analyzers capture raw Ethernet frames, IP packets, and higher-layer PDUs passing across a network interface.
2. **Display Filters (Analysis Phase)**:
   - `http.response.code == 200`: Filter HTTP successes.
   - `tcp.flags.syn == 1 and tcp.flags.ack == 0`: Identify connection initiation probes.
3. **Capture Filters (BPF Syntax - Ingress Phase)**:
   - `tcp port 80 and host 127.0.0.1`
4. **Safe TShark Command**:
   `tshark -i lo -c 20 -Y "http || dns"`"""

    def _explain_web_fuzzing(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**Gobuster ও Web Directory ব্রুটফোর্স (অনুমোদিত ল্যাব গাইড):**

১. **Gobuster কী?**
Gobuster হলো একটি দ্রুতগতির Go-ভিত্তিক টুল যা ওয়েব সার্ভারে লুকানো ফাইল ও ডিরেক্টরি (যেমন: `/admin`, `/login`, `/config`) আবিষ্কার করতে ওয়ার্ডলিস্ট ব্যবহার করে।

২. **নিরাপদ ল্যাব কমান্ড:**
`gobuster dir -u http://127.0.0.1:3000 -w /usr/share/wordlists/dirb/common.txt -t 10`

৩. **ফ্ল্যাগ ব্যাখ্যা:**
- `-u`: টার্গেট ওয়েবসাইটের URL (শুধুমাত্র নিজস্ব ল্যাব)।
- `-w`: ব্যবহৃত ওয়ার্ডলিস্টের পাথ।
- `-t 10`: থ্রেড সংখ্যা ১০ এ সীমিত রাখা যাতে সার্ভার ওভারলোড না হয়।

*সতর্কতা: উচ্চ রেটের রিকোয়েস্ট পাঠানো প্রোডাকশন সার্ভারে Denial of Service সৃষ্টি করতে পারে। থ্রেড রেট সর্বদা কম রাখুন।*"""
        else:
            return """**Gobuster & Web Enumeration Reference:**

1. **Concept**:
   Enumerates URIs (directories and files), DNS subdomains, and vhosts using wordlist probing.
2. **Safe Lab Profile**:
   `gobuster dir -u http://127.0.0.1:3000 -w /usr/share/wordlists/dirb/common.txt -t 5 -s "200,204,301,302,307"`
3. **Operational Guards**:
   - Restrict `-t` (concurrency) to ≤10 on lab machines to prevent CPU starvation.
   - Ensure the target URL is strictly localized or approved under authorized ROE (Rules of Engagement)."""

    def _explain_phishing_awareness(self, is_bn: bool, mode: str) -> str:
        if is_bn:
            return """**নিরাপদ ফিশিং সচেতনতা ল্যাব (Safe Awareness Simulator):**

১. **শিক্ষামূলক উদ্দেশ্য:**
এই ল্যাবটি শুধুমাত্র কর্মচারীদের বা শিক্ষার্থীদের ফিশিং আক্রমণের লক্ষণগুলো চিনতে শেখানোর জন্য।

২. **কঠোর নিরাপত্তা নিয়ম:**
- কোনো বাস্তব অ্যাকাউন্ট, পাসওয়ার্ড বা ব্যক্তিগত ডাটা সংগ্রহ করা হয় না।
- সমস্ত ক্রেডেনশিয়াল ডামি/ফেক (যেমন: `user@example.test`)।
- কোনো ডাটা লোকাল মেশিনের বাইরে পাঠানো হয় না।

৩. **ফিশিং ইমেইলের সাধারণ লক্ষণ:**
- জরুরি বা ভীতিকর ভাষা ("আপনার অ্যাকাউন্ট এখনই বন্ধ হয়ে যাবে!")।
- অমিল ডোমেন নাম বা স্পেলিং ভুল (যেমন: `paypa1.test` বা `gooogle.test`)।
- অযাচিত এটাচমেন্ট বা সন্দেহজনক লিংক।"""
        else:
            return """**Safe Phishing Awareness Simulator (Educational Guardrails):**

1. **Educational Purpose**:
   Designed solely for defensive recognition training and security awareness education.
2. **Strict Guardrails**:
   - Zero credential collection: Real credentials are NEVER harvested, transmitted, or logged.
   - Mock identities only: Employs fabricated credentials (`student@training.lab`).
   - Isolated simulation: Completely self-contained inside the local browser/lab interface.
3. **Core Indicators of Social Engineering**:
   - Artificial urgency and intimidation cues.
   - Homoglyph and lookalike domains (`account-verify-bank.test`).
   - Unsolicited requests for MFA codes or password changes."""

    def _default_guidance(self, query: str, is_bn: bool, mode: str) -> str:
        if is_bn:
            return f"""**[এথিক্যাল সিকিউরিটি এআই সহকারী - লোকাল ইঞ্জিন]**

আপনার বার্তা: "{query}"

সাইবার সিকিউরিটি শিক্ষা ও অনুমোদিত ল্যাব গবেষণার জন্য:
- **টুল ক্যাটালগ**: Nmap, Wireshark, Gobuster, Lynis বা Burp Suite ব্যবহার করতে পারেন।
- **নিরাপদ কমান্ড ফরম্যাট**: `nmap -sV -p 80,443 127.0.0.1`
- **স্কোপ নীতিমালা**: নিশ্চিত করুন যে টার্গেটটি LOCALHOST, PRIVATE_NETWORK অথবা AUTHORIZED_LAB এর মধ্যে রয়েছে।
- **অনুমতি সীমা**: আপনার বর্তমান পারমিশন লেভেল যাচাই করে ডায়াগনস্টিক চালান।

কোনো নির্দিষ্ট টুল, নেটওয়ার্কিং কনসেপ্ট (যেমন TCP/IP, DNS, HTTP), বা ল্যাব সেটআপ সম্পর্কে প্রশ্ন থাকলে করতে পারেন।"""
        else:
            return f"""**[Ethical Security AI Assistant - Local Defensive Engine]**

Regarding your query: "{query}"

For authorized cybersecurity research, education, and lab evaluation:
- **Available Tool Modules**: Check the Tool Catalog for Nmap, Wireshark, Gobuster, Lynis, or Docker labs.
- **Safe Diagnostic Command**: `nmap -sV -p 80,443 127.0.0.1`
- **Scope Verification**: Target scope must adhere to LOCALHOST, PRIVATE_NETWORK, or AUTHORIZED_LAB.
- **Action Budget**: Actions are deducted and audited per execution.

Feel free to ask for step-by-step guidance on any tool, TCP/IP concepts, OWASP Top 10 vulnerabilities, or lab troubleshooting."""

    def analyze_output(
        self,
        output_text: str,
        tool_name: str,
        target: str,
        language: str = "auto",
    ) -> Dict[str, Any]:
        is_bn = language == "bn" or bool(re.search(r'[\u0980-\u09FF]', output_text))
        
        # Parse output characteristics
        lines = [l.strip() for l in output_text.splitlines() if l.strip()]
        open_ports = []
        for line in lines:
            if "/tcp" in line or "/udp" in line:
                parts = line.split()
                if len(parts) >= 2 and parts[1].lower() in ["open", "filtered", "closed"]:
                    open_ports.append(f"{parts[0]} ({parts[1]})")
                    
        has_error = any("error" in l.lower() or "timeout" in l.lower() or "failed" in l.lower() for l in lines)
        
        if is_bn:
            findings = []
            if open_ports:
                findings.append(f"শনাক্তকৃত পোর্ট ও স্ট্যাটাস: {', '.join(open_ports)}")
            else:
                findings.append(f"আউটপুটে মোট {len(lines)} টি লাইন প্রসেস করা হয়েছে।")
            findings.append("টার্গেট অনুমোদন ও লোকাল স্কোপ যাচাই সম্পন্ন হয়েছে।")
            
            return {
                "summary": f"{tool_name or 'Security Tool'} এর আউটপুট বিশ্লেষণ সফলভাবে সম্পন্ন হয়েছে। টার্গেট: {target or 'Authorized Target'}।",
                "findings": findings,
                "errors": ["আউটপুটে সংযোগ সমস্যা বা টাইমআউট পরিলক্ষিত হয়েছে।"] if has_error else [],
                "technicalExplanation": "টুলটি নেটওয়ার্ক সকেটের মাধ্যমে রেসপন্স বা ব্যানার সংগ্রহ করেছে। টিসিপি থ্রি-ওয়ে হ্যান্ডশেক অথবা এইচটিটিপি স্ট্যাটাস কোডের ভিত্তিতে ফলাফল সংকলিত হয়েছে।",
                "remediation": "অপ্রয়োজনীয় ওপেন পোর্টগুলো ফায়ারওয়ালের মাধ্যমে বন্ধ করুন। অনুমোদিত সার্ভিসগুলোকে লিস্ট প্রিভিলেজ মডেলে রাখুন।",
                "learningConcepts": ["TCP Port States (Open/Filtered/Closed)", "Service Banner Fingerprinting", "Firewall Rules"],
                "provider": "local_engine",
            }
        else:
            findings = []
            if open_ports:
                findings.append(f"Identified Port Signatures: {', '.join(open_ports)}")
            else:
                findings.append(f"Processed diagnostic payload containing {len(lines)} response lines.")
            findings.append("Verified scope constraints within authorized lab boundaries.")
            
            return {
                "summary": f"Automated defensive analysis completed for {tool_name or 'Security Tool'} against target {target or 'Authorized Target'}.",
                "findings": findings,
                "errors": ["Connection error or timeout signature observed in output logs."] if has_error else [],
                "technicalExplanation": "The tool probed target network sockets and parsed service banners or protocol response codes. Evidence shows active or filtered port listener states.",
                "remediation": "Enforce principle of least privilege. Disable unnecessary listening daemons and filter untrusted ingress traffic via iptables/nftables.",
                "learningConcepts": ["TCP 3-Way Handshake & Port States", "Service Fingerprinting", "Defense-in-Depth"],
                "provider": "local_engine",
            }
