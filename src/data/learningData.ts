import { LearningCourse } from '../types';

export const LEARNING_COURSES: LearningCourse[] = [
  {
    id: 'linux-fundamentals',
    title: 'Linux Fundamentals for Security',
    titleBn: 'সিকিউরিটির জন্য লিনাক্স ফান্ডামেন্টালস',
    category: 'System Basics',
    icon: 'Terminal',
    level: 'beginner',
    completedLessonIds: [],
    description: 'Master core terminal commands, user permissions, process analysis, and directory structures.',
    descriptionBn: 'টার্মিনাল কমান্ড, ফাইল পারমিশন, প্রসেস অ্যানালাইসিস এবং ডিরেক্টরি স্ট্রাকচার আয়ত্ত করুন।',
    lessons: [
      {
        id: 'linux-permissions',
        courseId: 'linux-fundamentals',
        title: 'Linux Permissions & Least Privilege',
        titleBn: 'লিনাক্স পারমিশন এবং লিস্ট প্রিভিলেজ নীতি',
        level: 'beginner',
        readTimeMin: 6,
        summary: 'Understand Read (r), Write (w), Execute (x) permissions and chmod numeric notations.',
        summaryBn: 'রিড, রাইট, এক্সিকিউট পারমিশন এবং chmod এর নিউমেরিক নোটেশন শিখুন।',
        content: `In Linux, every file and directory has ownership assigned to a User, a Group, and Others.
Each entity can have:
- Read (r = 4): View file contents or list directory files.
- Write (w = 2): Modify or delete file contents.
- Execute (x = 1): Run the file as a program or navigate into a directory.

Common permission masks:
- 755 (rwxr-xr-x): Owner can do anything; others can only read and execute (standard for binaries/scripts).
- 644 (rw-r--r--): Owner can read/write; others can only read (standard for config files).
- 600 (rw-------): Only owner can read/write (standard for private SSH keys like id_rsa).

Defensive Principle: Never give 777 (rwxrwxrwx) to web root files or database sockets. Always practice the Principle of Least Privilege.`,
        contentBn: `লিনাক্সে প্রতিটি ফাইল বা ডিরেক্টরিতে ৩ স্তরের মালিকানা থাকে: ইউজার (User), গ্রুপ (Group) এবং অন্যান্য (Others)।
প্রতিটি স্তরে ৩ ধরণের ক্ষমতা থাকে:
- Read (r = 4): ফাইল পড়া বা ডিরেক্টরির তালিকা দেখা।
- Write (w = 2): ফাইল পরিবর্তন বা মোছা।
- Execute (x = 1): স্ক্রিপ্ট চালানো বা ফোল্ডারে প্রবেশ করা।

নিরাপত্তা নীতি: ওয়েব সার্ভার বা সিক্রেট ফাইলে কখনোই 777 পারমিশন দিবেন না। প্রাইভেট কী (id_rsa) এর জন্য সর্বদা 600 পারমিশন বজায় রাখুন।`,
        commandExamples: [
          {
            command: 'ls -la /var/log',
            description: 'Lists detailed file permissions in the system log directory.',
            descriptionBn: 'সিস্টেম লগ ডিরেক্টরির ফাইল পারমিশন তালিকা দেখুন।',
          },
          {
            command: 'chmod 600 ~/.ssh/id_rsa',
            description: 'Enforces strict owner-only read/write on private SSH key.',
            descriptionBn: 'প্রাইভেট SSH কী শুধুমাত্র ওনার পড়ার পারমিশনে লক করুন।',
          },
        ],
        quiz: [
          {
            question: 'What numeric permission should be assigned to an SSH private key (~/.ssh/id_rsa)?',
            questionBn: 'SSH প্রাইভেট কী এর জন্য কোন পারমিশন সঠিক?',
            options: ['777', '600', '644', '755'],
            correctIndex: 1,
            explanation: '600 gives read/write to the owner only and blocks all access from group and others, satisfying SSH security requirements.',
            explanationBn: '600 পারমিশন দিলে শুধুমাত্র ফাইলের মালিক পড়তে পারবে এবং অন্যদের অ্যাক্সেস বন্ধ থাকবে।',
          },
        ],
        safeExercise: {
          objective: 'Inspect permission mask on a test file and secure it.',
          objectiveBn: 'একটি টেস্ট ফাইলের পারমিশন দেখে তা শুধুমাত্র ওনার রিড-রাইটে সীমাবদ্ধ করুন।',
          hint: 'Use touch test.txt, ls -l test.txt, and chmod 600 test.txt',
          solution: 'touch test.txt && chmod 600 test.txt && ls -l test.txt',
        },
        glossary: [
          { term: 'Principle of Least Privilege', definition: 'The practice of limiting access rights for users to the bare minimum permissions they need to perform their work.' },
          { term: 'chmod', definition: 'Linux command used to change access permissions of file system objects.' },
        ],
      },
    ],
  },
  {
    id: 'networking-tcp-ip',
    title: 'Networking & TCP/IP Architecture',
    titleBn: 'নেটওয়ার্কিং এবং টিসিপি/আইপি আর্কিটেকচার',
    category: 'Network Basics',
    icon: 'Network',
    level: 'beginner',
    completedLessonIds: [],
    description: 'Understand the three-way handshake, port anatomy, IP routing, and packet structures.',
    descriptionBn: 'থ্রি-ওয়ে হ্যান্ডশেক, পোর্ট নম্বর, আইপি রাউটিং এবং প্যাকেট বিশ্লেষণ শিখুন।',
    lessons: [
      {
        id: 'tcp-three-way-handshake',
        courseId: 'networking-tcp-ip',
        title: 'The TCP Three-Way Handshake (SYN, SYN-ACK, ACK)',
        titleBn: 'টিসিপি থ্রি-ওয়ে হ্যান্ডশেক (SYN, SYN-ACK, ACK)',
        level: 'beginner',
        readTimeMin: 7,
        summary: 'How reliable TCP connections are established before transmitting application data.',
        summaryBn: 'ডাটা পাঠানোর আগে কীভাবে বিশ্বস্ত টিসিপি কানেকশন তৈরি হয়।',
        content: `Transmission Control Protocol (TCP) is a connection-oriented, reliable transport protocol.
Before any HTTP or TLS request begins, client and server must perform a 3-way handshake:
1. SYN (Synchronize): Client sends a TCP packet with the SYN flag set and an initial sequence number (ISN_c).
2. SYN-ACK: If the port is open and listening, the server replies with SYN and ACK flags set, acknowledging ISN_c + 1 and providing its own ISN_s.
3. ACK (Acknowledge): Client replies with ACK set, acknowledging ISN_s + 1.

Port States in Security Scanning:
- OPEN: The port responded with SYN-ACK. An application is actively listening.
- CLOSED: The host responded with RST (Reset). The host is alive, but no service is listening on that port.
- FILTERED: No response or ICMP unreachable error was received. A firewall or packet filter dropped the probe.`,
        contentBn: `টিসিপি (TCP) হলো একটি কানেকশন-ওরিয়েন্টেড নির্ভরযোগ্য প্রটোকল। ডাটা আদান-প্রদানের পূর্বে ৩টি ধাপে কানেকশন গঠিত হয়:
১. SYN: ক্লায়েন্ট সার্ভারকে সংযোগ শুরুর সংকেত পাঠায়।
২. SYN-ACK: পোর্ট ওপেন থাকলে সার্ভার সম্মতি জানায়।
৩. ACK: ক্লায়েন্ট চূড়ান্ত স্বীকৃতি দিয়ে সংযোগ স্থাপন সম্পন্ন করে।

পোর্ট স্ক্যানিংয়ের অবস্থা:
- OPEN: সার্ভিস সক্রিয় ও শুনছে।
- CLOSED: হোস্ট চালু আছে, কিন্তু কোনো সার্ভিস শুনছে না (RST পাঠায়)।
- FILTERED: ফায়ারওয়াল প্যাকেট ড্রপ করেছে।`,
        commandExamples: [
          {
            command: 'ss -tulpn',
            description: 'Displays all currently listening TCP/UDP sockets and their process IDs on Linux.',
            descriptionBn: 'বর্তমানে সিস্টেমে কোন কোন পোর্ট শুনছে তা প্রসেস আইডি সহ দেখুন।',
          },
        ],
        quiz: [
          {
            question: 'When a target port responds with RST (Reset) to a SYN probe, what does it signify?',
            questionBn: 'টার্গেট পোর্ট যদি SYN প্যাকেটের জবাবে RST পাঠায়, তার অর্থ কী?',
            options: ['Port is Open', 'Port is Closed', 'Port is Filtered by firewall', 'Host is Offline'],
            correctIndex: 1,
            explanation: 'A RST response indicates the host is alive, but no active daemon is listening on that specific port.',
            explanationBn: 'RST পাওয়ার অর্থ হলো হোস্ট চালু আছে, কিন্তু ঐ পোর্টে কোনো সার্ভিস চলছে না (ক্লোজড)।',
          },
        ],
        safeExercise: {
          objective: 'View listening TCP ports on your local system using netstat or ss.',
          objectiveBn: 'ss কমান্ড দিয়ে লোকাল সিস্টেমে ওপেন লিসেনিং পোর্ট পর্যবেক্ষণ করুন।',
          hint: 'Run ss -tuln in terminal',
          solution: 'ss -tuln',
        },
        glossary: [
          { term: 'SYN Packet', definition: 'Synchronize packet used to initiate a TCP session.' },
          { term: 'RST Packet', definition: 'Reset flag sent to abort or reject an unhandled connection request.' },
        ],
      },
    ],
  },
  {
    id: 'nmap-mastery',
    title: 'Nmap Mastery & Scanning Diagnostics',
    titleBn: 'এনম্যাপ মাস্টারি এবং স্ক্যানিং ডায়াগনস্টিকস',
    category: 'Network Security',
    icon: 'Radio',
    level: 'intermediate',
    completedLessonIds: [],
    description: 'Deep dive into Nmap scan techniques, version detection, NSE scripts, and defensive logging.',
    descriptionBn: 'এনম্যাপ স্ক্যান কৌশল, ভার্সন ডিটেকশন, NSE স্ক্রিপ্ট এবং ডিফেন্সিভ লগিং।',
    lessons: [
      {
        id: 'nmap-scan-types',
        courseId: 'nmap-mastery',
        title: 'TCP Connect (-sT) vs SYN Stealth (-sS)',
        titleBn: 'টিসিপি কানেক্ট (-sT) বনাম সিন স্টিলথ (-sS) স্ক্যান',
        level: 'intermediate',
        readTimeMin: 8,
        summary: 'Compare full OS socket connections with raw half-open SYN scans and their audit footprint.',
        summaryBn: 'ফুল কানেকশন এবং হাফ-ওপেন স্ক্যানের পার্থক্য ও অডিট ট্রেইল বুঝুন।',
        content: `When scanning with Nmap:
1. TCP Connect Scan (-sT):
   - Uses the operating system's standard connect() system call.
   - Completes the entire 3-way handshake (SYN -> SYN-ACK -> ACK).
   - Does NOT require root/administrator privileges.
   - Easily recorded in target server application access logs.

2. SYN Stealth / Half-Open Scan (-sS):
   - Uses raw sockets to forge SYN packets.
   - If SYN-ACK is received, Nmap sends a RST immediately to tear down the connection before the OS application layer logs it.
   - Requires root/sudo privileges (CAP_NET_RAW).
   - The default scan type when running Nmap as root.

Safe Lab Best Practice: On local non-root Android Termux environments, use -sT for maximum reliability without root permissions.`,
        contentBn: `এনম্যাপে দুটি প্রধান স্ক্যান টেকনিক:
১. TCP Connect Scan (-sT):
   - অপারেটিং সিস্টেমের কানেক্ট কল ব্যবহার করে পূর্ণ ৩-ওয়ে হ্যান্ডশেক সম্পন্ন করে।
   - রুট (root) প্রিভিলেজ প্রয়োজন হয় না। টার্মাক্সে সহজে চলে।
২. SYN Stealth Scan (-sS):
   - হাফ-ওপেন স্ক্যান। SYN-ACK পাওয়ার পর সাথে সাথে RST পাঠিয়ে সংযোগ ভেঙে দেয়।
   - রুট বা অ্যাডমিন ক্ষমতা প্রয়োজন হয়।`,
        commandExamples: [
          {
            command: 'nmap -sT -p 80,443,3000 127.0.0.1',
            description: 'Safe non-root TCP connect scan on localhost.',
            descriptionBn: 'লোকালহোস্টে নিরাপদ নন-রুট কানেক্ট স্ক্যান।',
          },
          {
            command: 'nmap -sV --version-light -p 80 127.0.0.1',
            description: 'Fast version detection on port 80.',
            descriptionBn: 'পোর্ট ৮০ তে দ্রুত ভার্সন সনাক্তকরণ।',
          },
        ],
        quiz: [
          {
            question: 'Why does a TCP Connect scan (-sT) work in Termux without root privileges?',
            questionBn: 'রুট পারমিশন ছাড়া টার্মাক্সে TCP Connect (-sT) কীভাবে কাজ করে?',
            options: [
              'It bypasses the kernel completely',
              'It uses the standard OS Berkeley sockets connect() system call',
              'It uses raw forged IP packets',
              'It does not send any network packets',
            ],
            correctIndex: 1,
            explanation: 'The standard connect() API is accessible to any unprivileged user application in Linux/Android.',
            explanationBn: 'অপারেটিং সিস্টেমের স্ট্যান্ডার্ড connect() এপিআই যেকোনো নন-রুট অ্যাপের জন্য উন্মুক্ত।',
          },
        ],
        safeExercise: {
          objective: 'Run a version detection scan against port 3000 in your local dev environment.',
          objectiveBn: 'লোকালহোস্টের পোর্ট ৩০০০ এর উপর ভার্সন ডিটেকশন স্ক্যান করুন।',
          hint: 'Use nmap -sV -p 3000 127.0.0.1',
          solution: 'nmap -sV -p 3000 127.0.0.1',
        },
        glossary: [
          { term: 'Half-Open Scan', definition: 'A port scan technique where the connection is reset before the final ACK is sent.' },
          { term: 'NSE (Nmap Scripting Engine)', definition: 'Lua-based scripts that automate vulnerability and configuration checks in Nmap.' },
        ],
      },
    ],
  },
  {
    id: 'web-owasp-top-10',
    title: 'Web Application Security & OWASP Top 10',
    titleBn: 'ওয়েব অ্যাপ্লিকেশন সিকিউরিটি এবং ওওয়াস্প টপ ১০',
    category: 'Web Security',
    icon: 'Shield',
    level: 'intermediate',
    completedLessonIds: [],
    description: 'Learn root causes and defenses for SQL Injection, Broken Access Control, and XSS.',
    descriptionBn: 'এসকিউএল ইনজেকশন, ব্রোকেন অ্যাক্সেস কন্ট্রোল ও এক্সএসএস ত্রুটির কারণ ও প্রতিরোধ।',
    lessons: [
      {
        id: 'sql-injection-defense',
        courseId: 'web-owasp-top-10',
        title: 'SQL Injection: Flaws & Parameterized Queries',
        titleBn: 'এসকিউএল ইনজেকশন এবং প্যারামিটারাইজড কোয়েরি',
        level: 'intermediate',
        readTimeMin: 9,
        summary: 'How string concatenation causes SQLi and how prepared statements completely eliminate it.',
        summaryBn: 'স্ট্রিং কনক্যাটেনেশনের কারণে কীভাবে এসকিউএলআই হয় এবং প্রিপেয়ার্ড স্টেটমেন্ট তা দূর করে।',
        content: `SQL Injection occurs when untrusted user input is directly concatenated into a dynamic SQL query string.
Vulnerable Example:
\`const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";\`
If an attacker submits:
\`admin@example.com' OR '1'='1\`
The query logic is rewritten by the SQL interpreter to always return true, bypassing authentication.

The Secure Defensive Remediation:
Always use Parameterized Queries (Prepared Statements) or an Object-Relational Mapper (ORM):
\`db.query('SELECT * FROM users WHERE email = ?', [req.body.email]);\`
The SQL database engine treats the input strictly as a literal data parameter, never as executable SQL code.`,
        contentBn: `এসকিউএল ইনজেকশন ঘটে যখন ব্যবহারকারীর ইনপুট সরাসরি কোয়েরি স্ট্রিংয়ের সাথে যুক্ত করা হয়।
ত্রুটিপূর্ণ উদাহরণ:
SELECT * FROM users WHERE email = ' + userInput + ';

ডিফেন্সিভ সমাধান:
সর্বদা প্যারামিটারাইজড কোয়েরি (Prepared Statements) ব্যবহার করুন:
SELECT * FROM users WHERE email = ?
ডাটাবেজ ইঞ্জিন তখন ইনপুটকে কোড হিসেবে নয়, বিশুদ্ধ ডাটা হিসেবে মূল্যায়ন করে।`,
        commandExamples: [
          {
            command: 'curl -I http://127.0.0.1:3000/api/health',
            description: 'Inspects HTTP response headers to verify defensive headers like CSP and X-Content-Type.',
            descriptionBn: 'রেসপন্স হেডার চেক করে ফায়ারওয়াল বা সিকিউরিটি হেডার যাচাই করুন।',
          },
        ],
        quiz: [
          {
            question: 'What is the primary and most effective defense against SQL Injection?',
            questionBn: 'এসকিউএল ইনজেকশন প্রতিরোধের সবচেয়ে কার্যকর উপায় কী?',
            options: [
              'Blacklisting single quotes with regex',
              'Using parameterized queries / prepared statements',
              'Running queries as the database root user',
              'Storing passwords in plaintext',
            ],
            correctIndex: 1,
            explanation: 'Parameterized queries separate the query structure from untrusted user data, preventing the SQL interpreter from executing injected input.',
            explanationBn: 'প্যারামিটারাইজড কোয়েরি কোড এবং ডাটাকে আলাদা রাখে, ফলে কোনো ইনপুট কোড হিসেবে চলতে পারে না।',
          },
        ],
        safeExercise: {
          objective: 'Review a mock query snippet and convert it to a parameterized prepared statement.',
          objectiveBn: 'একটি ডায়নামিক কোয়েরিকে সিকিউর প্রিপেয়ার্ড স্টেটমেন্টে রূপান্তর করুন।',
          hint: 'Replace direct concatenation with placeholders (?)',
          solution: 'SELECT * FROM accounts WHERE id = ?',
        },
        glossary: [
          { term: 'Prepared Statement', definition: 'A pre-compiled SQL query where parameters are bound safely without modifying query structure.' },
          { term: "OR '1'='1'", definition: 'A classic tautology payload demonstrating improper string interpolation.' },
        ],
      },
    ],
  },
  {
    id: 'defensive-hardening',
    title: 'Defensive System Hardening & Monitoring',
    titleBn: 'ডিফেন্সিভ সিস্টেম হার্ডেনিং ও মনিটরিং',
    category: 'Defense',
    icon: 'Lock',
    level: 'advanced',
    completedLessonIds: [],
    description: 'Learn firewall rule policies, auditd logging, SSH hardening, and defensive zero-trust architecture.',
    descriptionBn: 'ফায়ারওয়াল রুল, অডিট লগিং, এসএসএইচ হার্ডেনিং এবং জিরো-ট্রাস্ট আর্কিটেকচার।',
    lessons: [
      {
        id: 'ssh-hardening-guide',
        courseId: 'defensive-hardening',
        title: 'Hardening SSH (sshd_config) for Production',
        titleBn: 'প্রোডাকশনের জন্য এসএসএইচ হার্ডেনিং নির্দেশিকা',
        level: 'advanced',
        readTimeMin: 8,
        summary: 'Disable root login, disable password authentication, use Ed25519 keys, and enforce rate limits.',
        summaryBn: 'রুট লগইন বন্ধ, পাসওয়ার্ড অথেনটিকেশন নিষ্ক্রিয় এবং Ed25519 কী প্রয়োগ।',
        content: `SSH is the primary administrative gateway to Linux servers. A default configuration is frequently targeted by brute-force scanners.
Key defensive directives in \`/etc/ssh/sshd_config\`:
1. \`PermitRootLogin no\`: Forces administrators to log in as a dedicated unprivileged user and use \`sudo\`.
2. \`PasswordAuthentication no\`: Disables password guessing entirely. Only cryptographic public key pairs are accepted.
3. \`PubkeyAuthentication yes\`: Enforces modern key algorithms (prefer Ed25519 or ECDSA over legacy 1024-bit RSA).
4. \`MaxAuthTries 3\`: Closes connections after 3 failed attempts to thwart dictionary bots.
5. \`AllowUsers admin devops\`: Explicitly allowlists permitted user accounts.`,
        contentBn: `এসএসএইচ হার্ডেনিংয়ের প্রধান নির্দেশনাসমূহ (/etc/ssh/sshd_config):
১. PermitRootLogin no - সরাসরি রুট লগইন নিষিদ্ধ করুন।
২. PasswordAuthentication no - পাসওয়ার্ড দিয়ে লগইন বন্ধ করুন, শুধুমাত্র এসএসএইচ কী অনুমোদন করুন।
৩. MaxAuthTries 3 - ব্যর্থ চেষ্টার সংখ্যা ৩ এ সীমাবদ্ধ করুন।
৪. UFW ফায়ারওয়াল বা Fail2ban দিয়ে এসএসএইচ পোর্ট সুরক্ষিত করুন।`,
        commandExamples: [
          {
            command: 'sshd -t',
            description: 'Tests sshd_config syntax for errors before restarting the SSH service.',
            descriptionBn: 'এসএসএইচ কনফিগারেশনের সিনট্যাক্স সঠিক আছে কি না টেস্ট করুন।',
          },
        ],
        quiz: [
          {
            question: 'Why should PasswordAuthentication be set to "no" in sshd_config?',
            questionBn: 'sshd_config এ PasswordAuthentication "no" করা কেন জরুরি?',
            options: [
              'To speed up network throughput',
              'To eliminate password guessing and automated brute-force attacks by requiring cryptographic keys',
              'Because Linux cannot handle passwords',
              'To allow anonymous logins',
            ],
            correctIndex: 1,
            explanation: 'Disabling passwords forces all clients to present a valid private key, rendering dictionary and credential-stuffing attacks useless.',
            explanationBn: 'পাসওয়ার্ড বন্ধ করলে ডিকশনারি ও ব্রুট-ফোর্স অ্যাটাক সম্পূর্ণ অকার্যকর হয়ে যায়।',
          },
        ],
        safeExercise: {
          objective: 'Generate a modern secure Ed25519 SSH keypair.',
          objectiveBn: 'একটি আধুনিক ও নিরাপদ Ed25519 এসএসএইচ কী তৈরি করুন।',
          hint: 'Use ssh-keygen -t ed25519',
          solution: 'ssh-keygen -t ed25519 -C "lab@local"',
        },
        glossary: [
          { term: 'Ed25519', definition: 'A high-speed, secure elliptic-curve signature scheme using Curve25519.' },
          { term: 'sshd_config', definition: 'The server-side configuration file for the OpenSSH daemon.' },
        ],
      },
    ],
  },
];
