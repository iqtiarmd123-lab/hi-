import { Lab } from '../types';

export const LABS_DATABASE: Lab[] = [
  {
    id: 'owasp-juice-shop',
    name: 'OWASP Juice Shop',
    type: 'web_vuln',
    difficulty: 'Easy',
    description: 'The most modern and sophisticated insecure web application! Perfect for learning OWASP Top 10 vulnerabilities in a safe sandbox.',
    descriptionBn: 'ওওয়াস্প টপ ১০ শেখার জন্য বিশ্বখ্যাত আধুনিক ভালনারেবল ওয়েব অ্যাপ্লিকেশন ল্যাব।',
    targetHost: '127.0.0.1',
    targetPort: 3000,
    network: 'docker-bridge',
    status: 'IDLE',
    dockerCommand: 'docker run --rm -p 3000:3000 bkimminich/juice-shop',
    tasks: [
      {
        id: 'js-1',
        title: 'Port & Service Fingerprint',
        description: 'Run Nmap service detection on port 3000 to identify the Node.js/Express server stack.',
        completed: false,
        verificationTool: 'nmap',
      },
      {
        id: 'js-2',
        title: 'Inspect HTTP Security Headers',
        description: 'Examine response headers with WhatWeb or curl to identify missing CSP or X-Frame headers.',
        completed: false,
        verificationTool: 'whatweb',
      },
      {
        id: 'js-3',
        title: 'Review Scoreboard Endpoint',
        description: 'Locate the hidden /#/score-board challenge registry.',
        completed: false,
      },
    ],
  },
  {
    id: 'dvwa',
    name: 'DVWA (Damn Vulnerable Web App)',
    type: 'web_vuln',
    difficulty: 'Medium',
    description: 'PHP/MySQL web application that is intentionally vulnerable. Features configurable security levels (Low, Medium, High, Impossible).',
    descriptionBn: 'পিএইচপি ও মাইএসকিউএল ভিত্তিক ক্লাসিক ল্যাব, যেখানে সিকিউরিটি লেভেল পরিবর্তন করা যায়।',
    targetHost: 'dvwa.local',
    targetPort: 8080,
    network: 'isolated-lab',
    status: 'IDLE',
    dockerCommand: 'docker run --rm -it -p 8080:80 vulnerables/web-dvwa',
    tasks: [
      {
        id: 'dvwa-1',
        title: 'Verify Lab Reachability',
        description: 'Execute safe Ping or TCP Connect probe against dvwa.local.',
        completed: false,
        verificationTool: 'ping',
      },
      {
        id: 'dvwa-2',
        title: 'Enumerate Common Directories',
        description: 'Run Gobuster or Dirsearch to find login.php and setup.php.',
        completed: false,
        verificationTool: 'gobuster',
      },
      {
        id: 'dvwa-3',
        title: 'Analyze Cookie Flags',
        description: 'Verify if the PHPSESSID cookie includes HttpOnly and SameSite flags.',
        completed: false,
        verificationTool: 'nikto',
      },
    ],
  },
  {
    id: 'webgoat',
    name: 'OWASP WebGoat',
    type: 'web_vuln',
    difficulty: 'Medium',
    description: 'Deliberately insecure Java application designed by OWASP to teach common application flaws through guided interactive lessons.',
    descriptionBn: 'জাভা ভিত্তিক ওওয়াস্প ল্যাব যা শিক্ষার্থীদের স্টেপ-বাই-স্টেপ হ্যান্ডস-অন সিকিউরিটি শেখায়।',
    targetHost: '127.0.0.1',
    targetPort: 8080,
    network: 'localhost',
    status: 'IDLE',
    dockerCommand: 'docker run -p 8080:8080 -p 9090:9090 -e TZ=Europe/Amsterdam owasp/webgoat',
    tasks: [
      {
        id: 'wg-1',
        title: 'Verify WebGoat Port Status',
        description: 'Verify ports 8080 and 9090 are bound to localhost.',
        completed: false,
      },
      {
        id: 'wg-2',
        title: 'Review Authentication Architecture',
        description: 'Examine lesson modules on Broken Authentication.',
        completed: false,
      },
    ],
  },
  {
    id: 'metasploitable',
    name: 'Metasploitable Lab VM',
    type: 'network',
    difficulty: 'Hard',
    description: 'Intentionally vulnerable Linux virtual machine configured with legacy unpatched services for testing authorized defensive detection and scanner rules.',
    descriptionBn: 'মাল্টি-সার্ভিস লিনাক্স ল্যাব যা নেটওয়ার্ক পোর্ট স্ক্যানিং ও ল্যাব টেস্টিংয়ের জন্য আদর্শ।',
    targetHost: '192.168.56.101',
    targetPort: 21,
    network: 'host-only-vm',
    status: 'IDLE',
    tasks: [
      {
        id: 'ms-1',
        title: 'Subnet Discovery',
        description: 'Discover active IP on host-only virtual adapter (192.168.56.0/24).',
        completed: false,
      },
      {
        id: 'ms-2',
        title: 'Comprehensive Service Scan',
        description: 'Run Nmap version probe across ports 21, 22, 23, 25, 80, 445.',
        completed: false,
        verificationTool: 'nmap',
      },
    ],
  },
  {
    id: 'ctf-playground',
    name: 'Defensive CTF Arena',
    type: 'ctf',
    difficulty: 'Medium',
    description: 'Challenge environment featuring digital forensics PCAP files, hash cracking audits, and defensive system log analysis puzzles.',
    descriptionBn: 'ডিজিটাল ফরেনসিক পিস্যাপ, হ্যাশ অডিট এবং সিস্টেম লগ বিশ্লেষণের ডিফেন্সিভ সিটিএফ প্ল্যাটফর্ম।',
    targetHost: 'ctf.lab',
    targetPort: 8000,
    network: 'isolated-ctf',
    status: 'IDLE',
    tasks: [
      {
        id: 'ctf-1',
        title: 'PCAP Analysis Challenge',
        description: 'Examine packet capture with TShark to identify unencrypted HTTP basic auth transmission.',
        completed: false,
        verificationTool: 'tshark',
      },
      {
        id: 'ctf-2',
        title: 'Secret Scan Challenge',
        description: 'Detect accidental AWS mock key commit using TruffleHog.',
        completed: false,
        verificationTool: 'trufflehog',
      },
    ],
  },
];

// Educational Phishing Awareness Mock Data
export interface PhishingEmailTemplate {
  id: string;
  sender: string;
  displaySender: string;
  replyTo: string;
  subject: string;
  date: string;
  body: string;
  redFlags: string[];
  redFlagsBn: string[];
  isSuspicious: boolean;
  explanation: string;
  explanationBn: string;
}

export const PHISHING_AWARENESS_TEMPLATES: PhishingEmailTemplate[] = [
  {
    id: 'phish-fake-urgent',
    displaySender: 'IT Security Helpdesk',
    sender: 'it-support@verify-account-internal-login-alert.co',
    replyTo: 'collect-data@external-drop-node.xyz',
    subject: 'URGENT: Your Corporate Password Expires in 2 Hours - Verify Now',
    date: 'Today at 09:15 AM',
    body: `Dear Employee,
    
Our security systems detected irregular activity on your workstation. Your company single-sign-on (SSO) account will be permanently deactivated within 2 hours unless you re-verify your credentials immediately.

Click the link below to verify:
http://corp-sso.verify-account-internal-login-alert.co/auth/login

Failure to comply will result in account suspension and escalation to HR.

Regards,
IT Global Security Team`,
    redFlags: [
      'Artificial urgency ("expires in 2 hours") designed to cause panic and bypass critical thinking.',
      'Sender domain mismatch ("verify-account-internal-login-alert.co" instead of official corporate domain).',
      'Generic greeting ("Dear Employee" rather than personalized name).',
      'Insecure HTTP link pointing to an external domain.',
      'Coercive threat of disciplinary action or escalation.',
    ],
    redFlagsBn: [
      'অযৌক্তিক জরুরি তাড়া ("২ ঘন্টার মধ্যে বন্ধ হবে") যা মানুষকে তাড়াহুড়ো করাতে ব্যবহার করা হয়।',
      'ভুয়া সেন্ডার ডোমেইন যা প্রতিষ্ঠানের আসল ডোমেইনের সাথে মেলে না।',
      'অনিরাপদ HTTP লিংক যা বহিরাগত সার্ভারে নির্দেশ করছে।',
      'সাধারণ সম্বোধন (নামের বদলে শুধু "Dear Employee")।',
    ],
    isSuspicious: true,
    explanation: 'Classic credential harvesting scam using psychological urgency cues and domain typosquatting. A legitimate IT department will never ask for credentials via urgent external HTTP links.',
    explanationBn: 'এটি একটি ক্লাসিক ফিশিং আক্রমণ। অফিসিয়াল আইটি টিম কখনোই বাহ্যিক লিংকের মাধ্যমে জরুরি পাসওয়ার্ড ভেরিফাই করতে বলে না।',
  },
  {
    id: 'legitimate-notification',
    displaySender: 'GitHub Notifications',
    sender: 'notifications@github.com',
    replyTo: 'noreply@github.com',
    subject: '[Security Advisory] A new dependency update is available for your repository',
    date: 'Yesterday at 04:30 PM',
    body: `Hello Developer,
    
Dependabot has created a pull request (#42) to bump @google/genai from 2.3.0 to 2.4.0 in your repository.

You can view the diff and release notes directly on GitHub:
https://github.com/my-lab/ethical-assistant/pull/42

No password or account action is required. Review the pull request at your convenience.`,
    redFlags: [],
    redFlagsBn: [],
    isSuspicious: false,
    explanation: 'Legitimate service notification from an authenticated domain (DKIM/SPF pass) with standard HTTPS GitHub URL, no urgency, and no request for credentials.',
    explanationBn: 'বৈধ নোটিফিকেশন। সেন্ডার ডোমেইন সঠিক, কোনো পাসওয়ার্ড চাওয়া হয়নি এবং কোনো অযৌক্তিক তাড়া নেই।',
  },
];
