import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Activity,
  Terminal,
  Cpu,
  Globe,
  Sliders,
  RotateCcw,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  Database,
} from 'lucide-react';
import { UserSettings, LanguageCode, ResponseMode, TargetScope } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetActions: () => void;
  language: 'auto' | 'en' | 'bn';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetActions,
  language,
}) => {
  const isBengali = language === 'bn';

  const [testingTermux, setTestingTermux] = useState(false);
  const [termuxTestResult, setTermuxTestResult] = useState<string | null>(null);

  const handleTestTermux = async () => {
    setTestingTermux(true);
    setTermuxTestResult(null);
    try {
      const res = await fetch('/api/termux/status');
      const data = await res.json();
      if (data.connected) {
        setTermuxTestResult('Connected: Termux Bridge daemon is active.');
        onUpdateSettings({
          termuxBridge: { ...settings.termuxBridge, connected: true, status: 'CONNECTED' },
        });
      } else {
        setTermuxTestResult(
          data.message || 'Termux Bridge daemon is not running. Safe simulation mode remains active.'
        );
        onUpdateSettings({
          termuxBridge: { ...settings.termuxBridge, connected: false, status: 'DISCONNECTED' },
        });
      }
    } catch {
      setTermuxTestResult(
        'Termux daemon unreachable on localhost:8080. Using safe sandbox simulator.'
      );
      onUpdateSettings({
        termuxBridge: { ...settings.termuxBridge, connected: false, status: 'DISCONNECTED' },
      });
    } finally {
      setTestingTermux(false);
    }
  };

  const getPermissionLabel = (level: number) => {
    if (level <= 20) return isBengali ? 'লেভেল ১ (০-২০): লার্নিং ও নিরাপদ সিমুলেশন' : 'Level 1 (0-20): Learning & Documentation Only';
    if (level <= 40) return isBengali ? 'লেভেল ২ (২১-৪০): লো-রিস্ক অনুমোদিত ডায়াগনস্টিক' : 'Level 2 (21-40): Low-Risk Diagnostics';
    if (level <= 60) return isBengali ? 'লেভেল ৩ (৪১-৬০): অনুমোদিত ল্যাব স্ক্যানিং' : 'Level 3 (41-60): Authorized Lab Scanning';
    if (level <= 80) return isBengali ? 'লেভেল ৪ (৬১-৮০): অ্যাডভান্সড ল্যাব টেস্টিং' : 'Level 4 (61-80): Advanced Lab Workflows';
    return isBengali ? 'লেভেল ৫ (৮১-১০০): হাই-রিস্ক অপারেশন (স্পষ্ট নিশ্চিতকরণ প্রয়োজন)' : 'Level 5 (81-100): High-Risk Authorized Lab Ops';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            {isBengali ? 'প্ল্যাটফর্ম সেটিংস ও নিয়ন্ত্রণ' : 'Platform Settings & Governance'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'এআই মডেল, পারমিশন স্তর, অ্যাকশন লিমিট এবং টার্মাক্স ব্রিজ কনফিগারেশন।'
              : 'Configure AI engine providers, permission boundaries, action limits, and bridge adapters.'}
          </p>
        </div>
      </div>

      {/* Section 1: Permission System (0 - 100) */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              {isBengali ? 'অনুমতি স্তর ম্যানেজার (Permission 0-100%)' : 'Permission Level Guardrail (0-100%)'}
            </h3>
          </div>
          <span className="font-mono text-sm font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {settings.permissionLevel}%
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isBengali
            ? 'এই সেটিংটি নির্ধারণ করে কোন টুল বা কমান্ডগুলো চালানো যাবে। কোনো অবস্থাতেই অনুমোদনহীন সিস্টেমে আঘাত হানার অনুমতি প্রদান করে না।'
            : 'Controls the authorization threshold for tools in the registry. Higher values permit advanced multi-step diagnostics in authorized lab targets.'}
        </p>

        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={settings.permissionLevel}
            onChange={(e) => onUpdateSettings({ permissionLevel: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-2 bg-zinc-950 rounded-lg"
          />
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-300">
            {getPermissionLabel(settings.permissionLevel)}
          </div>
        </div>
      </div>

      {/* Section 2: Action Limit Settings */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              {isBengali ? 'অ্যাকশন লিমিট কন্ট্রোল (Action Limits)' : 'Action Limit Governor'}
            </h3>
          </div>
          <button
            onClick={onResetActions}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 font-mono"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isBengali ? 'কাউন্টার রিসেট' : 'Reset Counter'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-300 font-medium">
              {isBengali ? 'সর্বোচ্চ অ্যাকশন সংখ্যা (Max Actions):' : 'Configured Maximum Actions:'}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.maxActions}
              onChange={(e) => onUpdateSettings({ maxActions: Number(e.target.value) })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-500">
              {isBengali ? 'সীমা পৌঁছালে অটোমেশন বন্ধ হয়ে যাবে।' : 'Workflows automatically halt upon reaching this threshold.'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-center">
            <span className="text-[11px] text-zinc-500">
              {isBengali ? 'বর্তমান ব্যবহৃত অ্যাকশন:' : 'Current Session Usage:'}
            </span>
            <div className="text-base font-bold font-mono text-zinc-200 mt-1">
              {settings.actionsUsed} / {settings.maxActions}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({settings.maxActions - settings.actionsUsed} remaining)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: AI Provider Configuration */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
            {isBengali ? 'এআই প্রোভাইডার ও ভাষা' : 'AI Provider & Engine'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">
              {isBengali ? 'এআই প্রোভাইডার:' : 'AI Provider Architecture:'}
            </label>
            <select
              value={settings.aiProvider}
              onChange={(e) => onUpdateSettings({ aiProvider: e.target.value as any })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini">Google Gemini 3.8 Flash (Server)</option>
              <option value="openai">OpenAI Compatible Provider</option>
              <option value="local">Local On-Device Engine</option>
              <option value="mock">Offline Mock Provider</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">
              {isBengali ? 'ডিফল্ট ভাষা:' : 'Primary Language:'}
            </label>
            <select
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value as LanguageCode })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="auto">Auto Detect (অটো ডিটেক্ট)</option>
              <option value="en">English (Default)</option>
              <option value="bn">বাংলা (Bengali Explanations)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 font-medium block mb-1">
              {isBengali ? 'রেসপন্স স্টাইল:' : 'Response Style:'}
            </label>
            <select
              value={settings.responseStyle}
              onChange={(e) => onUpdateSettings({ responseStyle: e.target.value as ResponseMode })}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="beginner">Beginner (সহজ ব্যাখ্যা)</option>
              <option value="normal">Normal</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert (প্রটোকল মেকানিক্স)</option>
            </select>
          </div>
        </div>

        {/* Offline Mode Toggle */}
        <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer text-xs">
          <div>
            <span className="font-semibold text-zinc-200 block">
              {isBengali ? 'সম্পূর্ণ অফলাইন মোড (Offline Mode)' : 'Strict Offline Mode'}
            </span>
            <span className="text-[11px] text-zinc-500">
              {isBengali
                ? 'বাইরের কোনো ক্লাউড কল না করে লোকাল ইঞ্জিন ও ক্যাটালগ ব্যবহার করুন।'
                : 'Prohibit external network API requests; rely strictly on local rule engines.'}
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.offlineMode}
            onChange={(e) => onUpdateSettings({ offlineMode: e.target.checked })}
            className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700 focus:ring-emerald-500"
          />
        </label>
      </div>

      {/* Section 4: Python AI Core Backend Engine */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              {isBengali ? 'পাইথন এআই কোর ব্যাকএন্ড (Python AI Core)' : 'Python AI Core Backend Service'}
            </h3>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              settings.pythonCore?.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            {settings.pythonCore?.connected ? 'CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isBengali
            ? 'পাইথন ফার্স্ট আর্কিটেকচার: সিকিউরিটি পলিসি ইঞ্জিন, পারমিশন ম্যানেজার, টুল ভ্যালিডেশন এবং রেজাল্ট অ্যানালাইজার সম্পূর্ণ পাইথনে পরিচালিত হচ্ছে।'
            : 'Python-first architecture: Security policy evaluation, permission tiers, tool validation, action budget deduction, and result parsing run natively in the Python AI Core.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">RUNTIME</span>
            <span className="text-zinc-200">{settings.pythonCore?.runtime || 'Python 3.10.12'}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">PORT</span>
            <span className="text-zinc-200">{settings.pythonCore?.port || 5055}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">ACTIVE PROVIDER</span>
            <span className="text-emerald-400 uppercase">{settings.pythonCore?.activeProvider || settings.aiProvider}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-[10px] text-zinc-500 block">TOOLS IN REGISTRY</span>
            <span className="text-zinc-200">{settings.pythonCore?.toolsCount || 10} registered</span>
          </div>
        </div>
      </div>

      {/* Section 5: Termux Bridge Settings */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
              {isBengali ? 'টার্মাক্স ব্রিজ অ্যাডাপ্টার (Termux Bridge)' : 'Termux Bridge Adapter'}
            </h3>
          </div>
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
              settings.termuxBridge.connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}
          >
            {settings.termuxBridge.connected ? 'CONNECTED' : 'NOT CONNECTED'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isBengali
            ? 'টার্মাক্স ব্রিজের মাধ্যমে অ্যান্ড্রয়েডে ইনস্টল করা টুলস নিরাপদে নিয়ন্ত্রণ করা সম্ভব। ব্রিজ চালু না থাকলে অ্যাপটি নিরাপদ ল্যাব সিমুলেশন মোডে কাজ করে।'
            : 'Controls connection to the ethical-termux-bridge daemon. When disconnected, diagnostics execute safely in the built-in lab sandbox.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestTermux}
            disabled={testingTermux}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>{testingTermux ? (isBengali ? 'যাচাই হচ্ছে...' : 'Testing...') : isBengali ? 'ব্রিজ সংযোগ পরীক্ষা করুন' : 'Test Bridge Connection'}</span>
          </button>
        </div>

        {termuxTestResult && (
          <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300">
            {termuxTestResult}
          </div>
        )}
      </div>
    </div>
  );
};
