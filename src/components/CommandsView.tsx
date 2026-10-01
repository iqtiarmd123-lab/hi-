import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { UserSettings, ToolDefinition } from '../types';
import { TOOLS_DATABASE } from '../data/tools';

interface CommandsViewProps {
  settings: UserSettings;
  onRunTool: (tool: ToolDefinition, target: string, parameters: Record<string, any>) => void;
  language: 'auto' | 'en' | 'bn';
}

type NmapProfile =
  | 'BASIC_DISCOVERY'
  | 'PORT_ENUMERATION'
  | 'SERVICE_DETECTION'
  | 'VERSION_DETECTION'
  | 'LAB_OS_DETECTION';

export const CommandsView: React.FC<CommandsViewProps> = ({
  settings,
  onRunTool,
  language,
}) => {
  const isBengali = language === 'bn';

  const [target, setTarget] = useState(settings.activeTarget || '127.0.0.1');
  const [profile, setProfile] = useState<NmapProfile>('SERVICE_DETECTION');
  const [scanType, setScanType] = useState('-sT');
  const [ports, setPorts] = useState('80,443,3000,8080');
  const [timing, setTiming] = useState('-T3');
  const [versionDetect, setVersionDetect] = useState(true);
  const [copied, setCopied] = useState(false);
  const [authorizedChecked, setAuthorizedChecked] = useState(false);

  const nmapTool = TOOLS_DATABASE.find((t) => t.id === 'nmap')!;

  const handleProfileSelect = (p: NmapProfile) => {
    setProfile(p);
    if (p === 'BASIC_DISCOVERY') {
      setScanType('-sn');
      setPorts('');
      setVersionDetect(false);
    } else if (p === 'PORT_ENUMERATION') {
      setScanType('-sT');
      setPorts('1-1024');
      setVersionDetect(false);
    } else if (p === 'SERVICE_DETECTION') {
      setScanType('-sT');
      setPorts('80,443,3000,8080');
      setVersionDetect(true);
      setTiming('-T3');
    } else if (p === 'VERSION_DETECTION') {
      setScanType('-sT');
      setPorts('22,80,443,3000,8080,3306');
      setVersionDetect(true);
      setTiming('-T3');
    } else if (p === 'LAB_OS_DETECTION') {
      setScanType('-sT');
      setPorts('80,443');
      setVersionDetect(true);
      setTiming('-T3');
    }
  };

  // Generate safe command string
  const assembleNmap = () => {
    const parts = ['nmap'];
    if (scanType) parts.push(scanType);
    if (versionDetect && scanType !== '-sn') parts.push('-sV');
    if (ports && scanType !== '-sn') parts.push(`-p ${ports}`);
    if (timing && scanType !== '-sn') parts.push(timing);
    parts.push(target);
    return parts.join(' ');
  };

  const currentCommand = assembleNmap();

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = () => {
    onRunTool(nmapTool, target, {
      scanType,
      versionDetection: versionDetect,
      ports,
      timing,
    });
  };

  // Safe educational command templates
  const safeReferenceCommands = [
    {
      name: 'Ping Connectivity',
      toolId: 'ping',
      cmd: `ping -c 4 ${target}`,
      desc: isBengali
        ? 'টার্গেট হোস্ট অনলাইনে আছে কি না এবং নেটওয়ার্ক লেটেন্সি চেক করে।'
        : 'Verifies target host reachability and round-trip latency.',
      params: { count: 4 },
    },
    {
      name: 'Traceroute Hops',
      toolId: 'traceroute',
      cmd: `traceroute -m 15 ${target}`,
      desc: isBengali
        ? 'টার্গেটে পৌঁছাতে কয়টি নেটওয়ার্ক রাউটার বা হপ অতিক্রম করতে হয়।'
        : 'Maps IP routing hops to target.',
      params: { maxHops: 15 },
    },
    {
      name: 'HTTP Header Audit',
      toolId: 'whatweb',
      cmd: `whatweb -a 1 http://${target}`,
      desc: isBengali
        ? 'সার্ভারের হেডার, সার্ভার সফটওয়্যার ও ওয়েব ফ্রেমওয়ার্ক নিরীক্ষা করে।'
        : 'Passively probes HTTP response headers and web technology.',
      params: { aggression: '1' },
    },
    {
      name: 'TLS Certificate Inspection',
      toolId: 'openssl',
      cmd: `openssl s_client -connect ${target.includes(':') ? target : target + ':443'} -showcerts`,
      desc: isBengali
        ? 'টিএলএস সার্টিফিকেট চেইন, মেয়াদ এবং এনক্রিপশন সাইফার পরীক্ষা করে।'
        : 'Dumps SSL/TLS certificate chain and negotiated cipher suite.',
      params: {},
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Title & Scope Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            {isBengali ? 'এনম্যাপ কমান্ড বিল্ডার ও রেফারেন্স' : 'Nmap Builder & Safe Command Reference'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'অনুমোদিত ল্যাবের জন্য প্রি-ভ্যালিডেটেড ও নিরাপদ এনম্যাপ স্ক্যান তৈরি করুন।'
              : 'Construct safe, parameterized Nmap diagnostics for authorized lab targets.'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>SCOPE: {settings.targetScope}</span>
        </div>
      </div>

      {/* Profile Selector Cards */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
          {isBengali ? '১. স্ক্যান প্রোফাইল নির্বাচন করুন:' : '1. Choose Scan Profile:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {[
            {
              id: 'BASIC_DISCOVERY',
              title: isBengali ? 'হোস্ট আবিষ্কার' : 'Host Discovery',
              flag: '-sn (Ping Sweep)',
              desc: isBengali ? 'শুধুমাত্র হোস্ট অন আছে কি না' : 'Ping only, no port probes',
            },
            {
              id: 'PORT_ENUMERATION',
              title: isBengali ? 'পোর্ট স্ক্যান' : 'Port Sweep',
              flag: '-p 1-1024',
              desc: isBengali ? 'সাধারণ ১-১০২৪ পোর্ট' : 'Scan standard 1-1024 ports',
            },
            {
              id: 'SERVICE_DETECTION',
              title: isBengali ? 'সার্ভিস ডিটেকশন' : 'Service Detection',
              flag: '-sV Web Ports',
              desc: isBengali ? 'সফটওয়্যার ও সংস্করণ' : 'Inspect common web daemons',
            },
            {
              id: 'VERSION_DETECTION',
              title: isBengali ? 'ভার্সন প্রোব' : 'Full Versioning',
              flag: '-sV Common',
              desc: isBengali ? 'ল্যাব সার্ভিস ভার্সনিং' : 'Full service fingerprint',
            },
            {
              id: 'LAB_OS_DETECTION',
              title: isBengali ? 'ল্যাব ওএস' : 'OS Fingerprint',
              flag: '-O Fingerprint',
              desc: isBengali ? 'অপারেটিং সিস্টেম নিরীক্ষা' : 'TCP/IP stack OS detection',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleProfileSelect(item.id as NmapProfile)}
              className={`p-3 rounded-xl border text-left transition-all ${
                profile === item.id
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-md'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="font-bold text-xs text-zinc-100">{item.title}</div>
              <div className="font-mono text-[10px] text-cyan-400 mt-0.5">{item.flag}</div>
              <div className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
          {isBengali ? '২. টার্গেট ও প্যারামিটার কনফিগারেশন:' : '2. Target & Parameter Controls:'}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Target Host Input */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">
              {isBengali ? 'অনুমোদিত টার্গেট আইপি বা হোস্ট:' : 'Authorized Target Host / IP:'}
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
              placeholder="127.0.0.1 or dvwa.local"
            />
          </div>

          {/* Target Ports Input */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">
              {isBengali ? 'পোর্ট ফিল্টার (-p):' : 'Port Range (-p):'}
            </label>
            <input
              type="text"
              value={ports}
              onChange={(e) => setPorts(e.target.value)}
              disabled={scanType === '-sn'}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
              placeholder="e.g. 80,443,3000 or 1-1024"
            />
          </div>

          {/* Scan Technique */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">
              {isBengali ? 'স্ক্যান টেকনিক:' : 'Scan Technique:'}
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="-sT">-sT (TCP Connect - Recommended for Non-Root / Termux)</option>
              <option value="-sS">-sS (TCP SYN Half-Open Stealth - Requires Root)</option>
              <option value="-sU">-sU (UDP Ports Scan)</option>
              <option value="-sn">-sn (Host Discovery Ping Sweep)</option>
            </select>
          </div>

          {/* Timing Template */}
          <div className="space-y-1.5">
            <label className="text-zinc-300 font-medium">
              {isBengali ? 'টাইমিং টেমপ্লেট:' : 'Timing Template:'}
            </label>
            <select
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="-T2">-T2 (Polite / Gentle for unstable networks)</option>
              <option value="-T3">-T3 (Normal Default)</option>
              <option value="-T4">-T4 (Aggressive for fast local lab networks)</option>
            </select>
          </div>
        </div>

        {/* Version Detection Toggle */}
        <label className="flex items-center gap-2 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={versionDetect}
            onChange={(e) => setVersionDetect(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700 focus:ring-emerald-500"
          />
          <span className="text-xs text-zinc-200">
            {isBengali
              ? 'সার্ভিস ও সংস্করণ সনাক্তকরণ (-sV) সক্রিয় করুন'
              : 'Enable Service Version Detection (-sV)'}
          </span>
        </label>
      </div>

      {/* Command Preview & Flag Breakdown */}
      <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            {isBengali ? 'জেনারেটেড কমান্ড প্রিভিউ' : 'Generated Command Preview'}
          </span>
          <button
            onClick={() => handleCopy(currentCommand)}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-300 break-all">
          {currentCommand}
        </div>

        {/* Flag Breakdown Table (English & Bengali) */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs">
          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            {isBengali ? 'প্যারামিটার ও ফ্ল্যাগ ব্যাখ্যা:' : 'Parameter Breakdown:'}
          </div>
          <div className="space-y-1 font-mono text-zinc-300 text-[11px]">
            <div>
              <span className="text-cyan-400 font-bold">nmap</span>: Network exploration & port scanner binary.
            </div>
            <div>
              <span className="text-cyan-400 font-bold">{scanType}</span>: {scanType === '-sT' ? 'TCP full handshake connection.' : 'Scan mode probe flag.'}
            </div>
            {versionDetect && (
              <div>
                <span className="text-cyan-400 font-bold">-sV</span>: Service & version detection. {isBengali ? '(চলমান সফটওয়্যারের ভার্সন বিশ্লেষণ করে)' : '(Queries listening sockets for version banners)'}
              </div>
            )}
            {ports && (
              <div>
                <span className="text-cyan-400 font-bold">-p {ports}</span>: Targeted port filter. {isBengali ? '(নির্দিষ্ট পোর্টগুলোতে সীমাবদ্ধ রাখে)' : '(Restricts probes to specified ports)'}
              </div>
            )}
            <div>
              <span className="text-cyan-400 font-bold">{target}</span>: Authorized destination target.
            </div>
          </div>
        </div>

        {/* Authorization Verification Checkbox */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 cursor-pointer">
          <input
            type="checkbox"
            checked={authorizedChecked}
            onChange={(e) => setAuthorizedChecked(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700 focus:ring-emerald-500"
          />
          <span className="text-xs text-amber-200">
            {isBengali
              ? 'আমি নিশ্চিত করছি যে আমি টার্গেট সিস্টেমটির (' + target + ') মালিক অথবা এটি পরীক্ষা করার জন্য আমার সুস্পষ্ট অনুমতি রয়েছে।'
              : 'I confirm that I legally own or have explicit authorization to test target: ' + target}
          </span>
        </label>

        {/* Run Diagnostic Button */}
        <div className="flex justify-end">
          <button
            onClick={handleExecute}
            disabled={!authorizedChecked}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              authorizedChecked
                ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>{isBengali ? 'ল্যাব ডায়াগনস্টিক চালান' : 'Execute Lab Diagnostic'}</span>
          </button>
        </div>
      </div>

      {/* Safe Educational Command Reference Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-400" />
          {isBengali ? 'নিরাপদ শিক্ষামূলক কমান্ড রেফারেন্স' : 'Safe Educational Command Reference'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safeReferenceCommands.map((ref, idx) => {
            const tool = TOOLS_DATABASE.find((t) => t.id === ref.toolId);
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-zinc-200">{ref.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">{ref.toolId}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{ref.desc}</p>
                  <code className="text-xs font-mono text-cyan-300 block bg-zinc-950 p-2 rounded break-all border border-zinc-800">
                    {ref.cmd}
                  </code>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleCopy(ref.cmd)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  {tool && (
                    <button
                      onClick={() => onRunTool(tool, target, ref.params)}
                      className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isBengali ? 'চালান' : 'Run'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
