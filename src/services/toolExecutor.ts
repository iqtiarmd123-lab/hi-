import { ToolDefinition, ToolResult, TargetScope, ExecutorType } from '../types';

export interface IToolExecutor {
  execute(
    tool: ToolDefinition,
    target: string,
    parameters: Record<string, any>,
    scope: TargetScope
  ): Promise<ToolResult>;
  checkAvailability(tool: ToolDefinition): Promise<boolean>;
}

// Generates the safe assembled command string
export function assembleCommand(
  tool: ToolDefinition,
  target: string,
  parameters: Record<string, any>
): string {
  if (tool.id === 'nmap') {
    const scanType = parameters.scanType || '-sT';
    const sV = parameters.versionDetection ? '-sV' : '';
    const p = parameters.ports ? `-p ${parameters.ports}` : '-p 80,443';
    const timing = parameters.timing || '-T3';
    return `nmap ${scanType} ${sV} ${p} ${timing} ${target}`.replace(/\s+/g, ' ').trim();
  }

  if (tool.id === 'ping') {
    const count = parameters.count || 4;
    return `ping -c ${count} ${target}`;
  }

  if (tool.id === 'traceroute') {
    const hops = parameters.maxHops || 15;
    return `traceroute -m ${hops} ${target}`;
  }

  if (tool.id === 'whatweb') {
    const agg = parameters.aggression || '1';
    return `whatweb -a ${agg} http://${target}`;
  }

  if (tool.id === 'nikto') {
    return `nikto -h http://${target} -Tuning ${parameters.tuning || 1}`;
  }

  if (tool.id === 'openssl') {
    const port = target.includes(':') ? target : `${target}:443`;
    return `openssl s_client -connect ${port} -showcerts`;
  }

  if (tool.id === 'gobuster') {
    const w = parameters.wordlist || '/wordlists/common.txt';
    return `gobuster dir -u http://${target} -w ${w} -t 10`;
  }

  if (tool.id === 'nuclei') {
    const tags = parameters.tags || 'config,exposure';
    return `nuclei -u http://${target} -tags ${tags}`;
  }

  if (tool.id === 'lynis') {
    return `lynis audit system -Q`;
  }

  if (tool.id === 'whois') {
    return `whois ${target}`;
  }

  if (tool.id === 'trufflehog') {
    return `trufflehog filesystem ${parameters.path || '.'}`;
  }

  if (tool.id === 'tshark') {
    return `tshark -i ${parameters.interface || 'lo'} -c ${parameters.packetCount || 10}`;
  }

  if (tool.id === 'ufw') {
    return `sudo ufw status verbose`;
  }

  // Generic fallback
  return `${tool.id} ${target}`;
}

// Realistic Authentic Lab Simulation Generator
export function generateSimulatedOutput(
  tool: ToolDefinition,
  target: string,
  parameters: Record<string, any>,
  scope: TargetScope
): { stdout: string; stderr: string; exitCode: number; executionTimeMs: number; parsedData?: any } {
  const timestamp = new Date().toUTCString();

  if (tool.id === 'nmap') {
    const ports = parameters.ports || '80,443';
    const isLocal = target === 'localhost' || target === '127.0.0.1';

    let openServices = '';
    if (isLocal) {
      openServices = `
PORT     STATE SERVICE VERSION
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
443/tcp  open  ssl/http nginx 1.18.0 (Ubuntu)
3000/tcp open  http    Node.js (Express framework)
8080/tcp open  http    Apache Tomcat/9.0.41`;
    } else if (target.includes('dvwa')) {
      openServices = `
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu
80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
3306/tcp open  mysql   MySQL 8.0.28`;
    } else {
      openServices = `
PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache/2.4.52 (Debian)
443/tcp  open  https   OpenSSL/1.1.1n`;
    }

    const stdout = `Starting Nmap 7.94 ( https://nmap.org ) at ${timestamp}
Nmap scan report for ${target}
Host is up (0.00042s latency).
Not shown: 996 closed tcp ports (conn-refused)
${openServices}

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 1.48 seconds`;

    return {
      stdout: stdout.trim(),
      stderr: '',
      exitCode: 0,
      executionTimeMs: 1480,
      parsedData: {
        target,
        hostStatus: 'UP',
        latencyMs: 0.42,
        openPorts: [
          { port: 80, proto: 'tcp', service: 'http' },
          { port: 443, proto: 'tcp', service: 'https' },
          { port: 3000, proto: 'tcp', service: 'http' },
        ],
      },
    };
  }

  if (tool.id === 'ping') {
    const count = parameters.count || 4;
    const stdout = `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.045 ms
64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.038 ms
64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.041 ms
64 bytes from ${target}: icmp_seq=4 ttl=64 time=0.039 ms

--- ${target} ping statistics ---
${count} packets transmitted, ${count} received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 0.038/0.040/0.045/0.005 ms`;

    return {
      stdout,
      stderr: '',
      exitCode: 0,
      executionTimeMs: 3004,
      parsedData: { transmitted: count, received: count, lossPercent: 0, avgRttMs: 0.04 },
    };
  }

  if (tool.id === 'traceroute') {
    const stdout = `traceroute to ${target} (${target}), 15 hops max, 60 byte packets
 1  _gateway (192.168.1.1)  0.945 ms  0.812 ms  0.780 ms
 2  10.240.0.1 (10.240.0.1)  2.124 ms  2.080 ms  1.980 ms
 3  ${target} (${target})  3.412 ms  3.210 ms  3.180 ms`;

    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 420 };
  }

  if (tool.id === 'whatweb') {
    const stdout = `http://${target} [200 OK] Apache[2.4.41], Cookies[PHPSESSID], HTML5, HTTPS-redirect[false], HTTPServer[Ubuntu Linux][Apache/2.4.41], IP[127.0.0.1], JQuery[3.5.1], Script, Title[Authorized Lab Portal]`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 350 };
  }

  if (tool.id === 'nikto') {
    const stdout = `- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          ${target}
+ Target Port:        80
+ Start Time:         ${timestamp}
---------------------------------------------------------------------------
+ Server: Apache/2.4.41 (Ubuntu)
+ Retrieved x-powered-by header: PHP/7.4.3
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-Content-Type-Options header is not set. This could allow the user agent to render the content of the site in a different fashion to the MIME type.
+ Root directory indexing is disabled.
+ 7890 requests: 0 error(s) and 2 item(s) reported on remote host
+ End Time:           ${timestamp} (4 seconds)`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 4100 };
  }

  if (tool.id === 'openssl') {
    const stdout = `CONNECTED(00000003)
depth=1 CN = Lab Local Authority CA
verify return:1
depth=0 CN = ${target}
verify return:1
---
Certificate chain
 0 s:CN = ${target}
   i:CN = Lab Local Authority CA
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIClTCCAX2gAwIBAgIUeN7hD12k3Y5l9gM8j... [SIMULATED X.509 CERTIFICATE]
-----END CERTIFICATE-----
subject=CN = ${target}
issuer=CN = Lab Local Authority CA
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 256 bit
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
---`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 620 };
  }

  if (tool.id === 'gobuster') {
    const stdout = `===============================================================
Gobuster v3.6.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://${target}
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /wordlists/common.txt
[+] Status codes:            200,204,301,302,307,401,403
===============================================================
/login                (Status: 200) [Size: 1420]
/assets               (Status: 301) [Size: 310] [--> http://${target}/assets/]
/api                  (Status: 200) [Size: 45]
/robots.txt           (Status: 200) [Size: 72]
/admin                (Status: 403) [Size: 284]
===============================================================
Finished`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 2800 };
  }

  if (tool.id === 'nuclei') {
    const stdout = `[INF] Current nuclei version: v3.1.8
[INF] Running templates against: http://${target}
[info] [missing-strict-transport-security] [http] http://${target}
[info] [missing-content-security-policy] [http] http://${target}
[info] [tech-detect:apache] [http] http://${target}
[low] [x-powered-by-header] [http] http://${target} [PHP/7.4.3]
[INF] Scan completed. Total findings: 4`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 3100 };
  }

  if (tool.id === 'lynis') {
    const stdout = `[+] Initializing Lynis audit system...
[+] Running tests in quick automated mode...
================================================================================
  Scan Results:
================================================================================
  - Hardening index : 76 [####################    ]
  - Tests performed : 252
  - Plugins enabled : 0
  - Firewall        : [ENABLED] (UFW active)
  - SSH Port        : [22]
  - Password Aging  : [DISABLED] (Warning)
  - Core Dumps      : [RESTRICTED]

  Suggestions (2):
  * Set password expiration policy in /etc/login.defs [AUTH-9288]
  * Restrict compiler permissions for unprivileged users [BANN-7126]
================================================================================`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 2900 };
  }

  if (tool.id === 'trufflehog') {
    const stdout = `🐷  TruffleHog v3.63.1
Loaded detector rules: 750
Scanning filesystem path: ${parameters.path || '.'}
Verified credentials: 0
Unverified credentials: 0
No secrets detected in scanned files. Working tree clean.`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 1200 };
  }

  if (tool.id === 'tshark') {
    const count = parameters.packetCount || 5;
    const stdout = `Capturing on 'lo'
  1 0.000000 127.0.0.1 → 127.0.0.1 TCP 74 41234 → 3000 [SYN] Seq=0 Win=65495 Len=0
  2 0.000028 127.0.0.1 → 127.0.0.1 TCP 74 3000 → 41234 [SYN, ACK] Seq=0 Ack=1 Win=65483 Len=0
  3 0.000052 127.0.0.1 → 127.0.0.1 TCP 66 41234 → 3000 [ACK] Seq=1 Ack=1 Win=65495 Len=0
  4 0.000120 127.0.0.1 → 127.0.0.1 HTTP 180 GET /api/health HTTP/1.1
  5 0.000450 127.0.0.1 → 127.0.0.1 HTTP 210 HTTP/1.1 200 OK (application/json)
${count} packets captured`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 1500 };
  }

  if (tool.id === 'ufw') {
    const stdout = `Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
3000/tcp                   ALLOW IN    127.0.0.1
8080/tcp                   ALLOW IN    192.168.1.0/24
22/tcp (v6)                ALLOW IN    Anywhere (v6)`;
    return { stdout, stderr: '', exitCode: 0, executionTimeMs: 400 };
  }

  // Fallback simulation
  return {
    stdout: `[Safe Simulation Engine] Diagnostic execution for ${tool.name} against target '${target}'.\nScope: ${scope}\nParameters: ${JSON.stringify(parameters, null, 2)}\nExecution status: Simulated successfully. Output format validated.`,
    stderr: '',
    exitCode: 0,
    executionTimeMs: 500,
  };
}

// Master Execution Dispatcher
export async function executeTool(
  tool: ToolDefinition,
  target: string,
  parameters: Record<string, any>,
  scope: TargetScope
): Promise<ToolResult> {
  const command = assembleCommand(tool, target, parameters);

  // Attempt execution via Python AI Core backend
  try {
    const res = await fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolId: tool.id,
        target,
        parameters,
        scope,
        hasConfirmed: true,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.allowed && data.result) {
        return data.result;
      }
    }
  } catch (err) {
    console.warn('Backend Python execution error, using local fallback:', err);
  }

  // Fallback to local authentic simulation
  const sim = generateSimulatedOutput(tool, target, parameters, scope);

  return {
    id: 'res_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    requestId: 'req_' + Date.now(),
    toolId: tool.id,
    toolName: tool.name,
    command,
    target,
    scope,
    timestamp: new Date().toISOString(),
    executionTimeMs: sim.executionTimeMs,
    stdout: sim.stdout,
    stderr: sim.stderr,
    exitCode: sim.exitCode,
    isSimulation: true,
    executor: 'safe_simulation',
    parsedData: sim.parsedData,
  };
}
