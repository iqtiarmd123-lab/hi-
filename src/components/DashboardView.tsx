import React from 'react';
import {
  ShieldAlert,
  Terminal,
  Activity,
  Zap,
  BookOpen,
  FlaskConical,
  FileSearch,
  MessageSquare,
  Wrench,
  Gauge,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { UserSettings, ToolResult } from '../types';
import { NavTab } from './Navigation';
import { TOOLS_DATABASE } from '../data/tools';
import { LEARNING_COURSES } from '../data/learningData';

interface DashboardViewProps {
  settings: UserSettings;
  onSelectTab: (tab: NavTab) => void;
  recentResults: ToolResult[];
  language: 'auto' | 'en' | 'bn';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  onSelectTab,
  recentResults,
  language,
}) => {
  const isBengali = language === 'bn';

  const totalTools = TOOLS_DATABASE.length;
  const installedTools = TOOLS_DATABASE.filter((t) => t.installed).length;
  const availableTools = TOOLS_DATABASE.filter((t) => t.available === 'AVAILABLE').length;

  const totalLessons = LEARNING_COURSES.reduce((acc, c) => acc + c.lessons.length, 0);
  const completedLessons = LEARNING_COURSES.reduce(
    (acc, c) => acc + c.completedLessonIds.length,
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Systematic Industrial Hero */}
      <div className="relative border-2 border-[#e4e4e7] p-7 sm:p-10 bg-gradient-to-br from-[#111113] via-[#0e0e10] to-[#0c0c0e]">
        {/* Floating Accent Tag */}
        <div className="absolute -top-3 left-5 bg-[#0c0c0e] px-2 font-mono text-[0.7rem] text-[#10b981] font-semibold tracking-wider uppercase border border-[rgba(228,228,231,0.15)] rounded-[2px]">
          {isBengali ? 'অনুমোদিত সিকিউরিটি ইঞ্জিন' : 'AUTHORIZED ENVIRONMENT'}
        </div>

        <div className="max-w-3xl">
          <h1 className="font-syne text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.05em] text-[#e4e4e7] uppercase leading-[0.92] mb-4">
            {isBengali ? 'এথিক্যাল সিকিউরিটি এআই' : 'ETHICAL SECURITY'}
          </h1>
          <p className="text-[0.875rem] sm:text-base text-[rgba(228,228,231,0.7)] leading-relaxed max-w-2xl font-sans">
            {isBengali
              ? 'সাইবার সিকিউরিটি শিক্ষা, ডিফেন্সিভ হার্ডেনিং, টুল ক্যাটালগ এবং অনুমোদিত ল্যাব পরিবেশের জন্য সিস্টেম্যাটিক ইন্ডাস্ট্রিয়াল প্ল্যাটফর্ম।'
              : 'Systematic industrial cybersecurity intelligence platform. Engineered for defensive hardening, automated diagnostic pipelines, verified tool catalogs, and safe lab exploration.'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('chat')}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-400 text-[#0c0c0e] font-syne font-bold text-xs uppercase tracking-wider rounded-[3px] transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 stroke-[2.5]" />
              <span>{isBengali ? 'এআই কনভারসেশন শুরু করুন' : 'LAUNCH AI CONSULT'}</span>
            </button>

            <button
              onClick={() => onSelectTab('commands')}
              className="px-5 py-2.5 bg-transparent border border-[rgba(228,228,231,0.25)] hover:border-[#e4e4e7] text-[#e4e4e7] font-mono text-xs uppercase tracking-wider rounded-[3px] transition-colors flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 text-[#10b981]" />
              <span>{isBengali ? 'এনম্যাপ বিল্ডার' : 'BUILD NMAP PROFILE'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Systematic Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Python AI Core */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(228,228,231,0.5)]">
              {isBengali ? 'পাইথন এআই কোর' : 'PYTHON AI CORE'}
            </span>
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse-subtle" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#e4e4e7]">
            {settings.pythonCore?.connected ? 'ONLINE' : 'STANDBY'}
          </div>
          <div className="flex items-center justify-between text-[0.68rem] font-mono text-[rgba(228,228,231,0.45)] border-t border-[rgba(228,228,231,0.08)] pt-2 mt-auto">
            <span>{settings.pythonCore?.runtime || 'Python 3.10'}</span>
            <span className="text-[#10b981]">Port {settings.pythonCore?.port || 5055}</span>
          </div>
        </div>

        {/* Stat 2: Active AI Engine */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(228,228,231,0.5)]">
              {isBengali ? 'এআই ইঞ্জিন' : 'AI ENGINE'}
            </span>
            <Zap className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#e4e4e7] uppercase truncate">
            {settings.offlineMode ? 'LOCAL' : 'GEMINI 3.8'}
          </div>
          <div className="flex items-center justify-between text-[0.68rem] font-mono text-[rgba(228,228,231,0.45)] border-t border-[rgba(228,228,231,0.08)] pt-2 mt-auto">
            <span className="truncate">{settings.aiModel}</span>
            <span className="text-[#10b981]">PROV</span>
          </div>
        </div>

        {/* Stat 3: Tool Catalog */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(228,228,231,0.5)]">
              {isBengali ? 'টুল রেজিস্ট্রি' : 'TOOL REGISTRY'}
            </span>
            <Wrench className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#e4e4e7]">
            {availableTools} <span className="text-base text-[rgba(228,228,231,0.4)]">/ {totalTools}</span>
          </div>
          <div className="flex items-center justify-between text-[0.68rem] font-mono text-[rgba(228,228,231,0.45)] border-t border-[rgba(228,228,231,0.08)] pt-2 mt-auto">
            <span>{installedTools} INSTALLED</span>
            <span className="text-[#10b981]">26 CATS</span>
          </div>
        </div>

        {/* Stat 4: Security Budget & Scope */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] tracking-[0.12em] uppercase text-[rgba(228,228,231,0.5)]">
              {isBengali ? 'পারমিশন ও বাজেট' : 'PERM & BUDGET'}
            </span>
            <Activity className="w-3.5 h-3.5 text-[#10b981]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold text-[#e4e4e7]">
            {settings.actionsUsed} <span className="text-base text-[rgba(228,228,231,0.4)]">/ {settings.maxActions}</span>
          </div>
          <div className="flex items-center justify-between text-[0.68rem] font-mono text-[rgba(228,228,231,0.45)] border-t border-[rgba(228,228,231,0.08)] pt-2 mt-auto">
            <span>LVL {settings.permissionLevel}%</span>
            <span className="text-[#10b981] truncate">{settings.targetScope}</span>
          </div>
        </div>
      </div>

      {/* Systematic Action Hub */}
      <div>
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-[rgba(228,228,231,0.5)] mb-3">
          {isBengali ? 'অ্যাকশন হাব ও মডিউল' : 'ACTION HUB & MODULES'}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-[1px] bg-[rgba(228,228,231,0.1)] border border-[rgba(228,228,231,0.1)]">
          {/* Action 1: AI Chat */}
          <button
            onClick={() => onSelectTab('chat')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <MessageSquare className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'এআই কনভারসেশন' : 'AI CHAT'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'ভয়েস ও টেক্সট' : 'VOICE & TEXT'}
            </span>
          </button>

          {/* Action 2: Commands */}
          <button
            onClick={() => onSelectTab('commands')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <Terminal className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'এনম্যাপ বিল্ডার' : 'NMAP BUILDER'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'সেফ প্রোফাইল' : 'SAFE PROFILES'}
            </span>
          </button>

          {/* Action 3: Tools */}
          <button
            onClick={() => onSelectTab('tools')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <Wrench className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'টুল ক্যাটালগ' : 'TOOL CATALOG'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'প্যারামিটার ভ্যালিডেশন' : 'VALIDATED'}
            </span>
          </button>

          {/* Action 4: Labs */}
          <button
            onClick={() => onSelectTab('labs')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <FlaskConical className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'ল্যাব ম্যানেজার' : 'LABS MANAGER'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'DVWA ও জুস শপ' : 'LOCAL DOCKER'}
            </span>
          </button>

          {/* Action 5: Results */}
          <button
            onClick={() => onSelectTab('results')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <FileSearch className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'অ্যানালাইজার' : 'ANALYZER'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'এভিডেন্স-বেসড' : 'EVIDENCE-BASED'}
            </span>
          </button>

          {/* Action 6: Learning */}
          <button
            onClick={() => onSelectTab('learning')}
            className="bg-[#0c0c0e] hover:bg-[#111113] p-6 sm:p-8 flex flex-col items-center gap-3 transition-colors text-center group cursor-pointer"
          >
            <BookOpen className="w-6 h-6 text-[#10b981] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all" />
            <span className="font-syne font-bold text-xs text-[#e4e4e7] tracking-tight">
              {isBengali ? 'লার্নিং সেন্টার' : 'LEARNING'}
            </span>
            <span className="font-mono text-[0.6rem] text-[rgba(228,228,231,0.45)] uppercase tracking-wider">
              {isBengali ? 'কোর্স ও কুইজ' : 'DEFENSIVE PATH'}
            </span>
          </button>
        </div>
      </div>

      {/* Systematic Panes: Recent Diagnostics + Learning Track */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pane 1: Recent Activity */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-4">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-[rgba(228,228,231,0.5)] border-b border-[rgba(228,228,231,0.1)] pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#10b981]" />
              {isBengali ? 'সাম্প্রতিক ডায়াগনস্টিক ট্র্যাকার' : 'RECENT DIAGNOSTIC ACTIVITY'}
            </span>
            <button
              onClick={() => onSelectTab('history')}
              className="text-[#10b981] hover:text-emerald-300 text-[0.65rem] flex items-center gap-1 uppercase"
            >
              <span>{isBengali ? 'লগ দেখুন' : 'VIEW LOGS'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-10 text-[rgba(228,228,231,0.5)] text-[0.85rem] flex flex-col items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-[rgba(228,228,231,0.3)]" />
              <p>{isBengali ? 'এখনো কোনো স্ক্যান রেকর্ড নেই।' : 'No diagnostics recorded in this session.'}</p>
              <div className="font-mono text-[0.6rem] px-2 py-0.5 bg-[rgba(228,228,231,0.1)] rounded-[3px] text-[rgba(228,228,231,0.7)]">
                {isBengali ? 'এনম্যাপ বা টুলস ট্যাব থেকে কমান্ড রান করুন' : 'EXECUTE SAFE SCAN FROM TOOLS OR NMAP BUILDER'}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {recentResults.slice(0, 3).map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 bg-[#111113] border border-[rgba(228,228,231,0.1)] flex items-center justify-between text-xs"
                >
                  <div className="space-y-1 max-w-[200px] sm:max-w-xs truncate">
                    <div className="flex items-center gap-2 font-mono font-bold text-[#e4e4e7]">
                      <span>{res.toolName}</span>
                      <span className="text-[#10b981] text-[10px]">@{res.target}</span>
                    </div>
                    <p className="font-mono text-[10px] text-[rgba(228,228,231,0.5)] truncate">
                      {res.command}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="font-mono text-[0.6rem] px-2 py-0.5 bg-[rgba(228,228,231,0.1)] text-[#10b981] rounded-[2px]">
                      {res.isSimulation ? 'SIMULATED' : 'EXECUTED'}
                    </span>
                    <span className="font-mono text-[10px] text-[rgba(228,228,231,0.4)] mt-1">
                      {res.executionTimeMs}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pane 2: Systematic Learning Progress */}
        <div className="border border-[rgba(228,228,231,0.1)] bg-[#0c0c0e] p-6 flex flex-col gap-4">
          <div className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-[rgba(228,228,231,0.5)] border-b border-[rgba(228,228,231,0.1)] pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#10b981]" />
              {isBengali ? 'লার্নিং ট্র্যাক অগ্রগতি' : 'LEARNING PIPELINE PROGRESS'}
            </span>
            <button
              onClick={() => onSelectTab('learning')}
              className="text-[#10b981] hover:text-emerald-300 text-[0.65rem] flex items-center gap-1 uppercase"
            >
              <span>{isBengali ? 'কোর্সগুলো দেখুন' : 'EXPLORE'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono text-[rgba(228,228,231,0.6)]">
              <span>{isBengali ? 'সম্পন্ন পাঠ:' : 'LESSONS COMPLETED:'}</span>
              <span className="text-[#e4e4e7] font-bold">
                {completedLessons} / {totalLessons} ({progressPercent}%)
              </span>
            </div>

            {/* Systematic Industrial Progress Bar */}
            <div className="h-1.5 w-full bg-[rgba(228,228,231,0.1)] relative">
              <div
                className="h-full bg-[#10b981] transition-all duration-500"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-[#111113] border border-[rgba(228,228,231,0.1)]">
              <div className="font-mono text-[9px] text-[rgba(228,228,231,0.45)] uppercase mb-1">
                {isBengali ? 'পরবর্তী অধ্যায়' : 'UPCOMING'}
              </div>
              <div className="font-syne font-bold text-xs text-[#e4e4e7] truncate">
                Linux System Hardening
              </div>
              <div className="font-mono text-[10px] text-[#10b981] mt-1">Foundational · 8 min</div>
            </div>

            <div className="p-3 bg-[#111113] border border-[rgba(228,228,231,0.1)]">
              <div className="font-mono text-[9px] text-[rgba(228,228,231,0.45)] uppercase mb-1">
                {isBengali ? 'প্রস্তাবিত ল্যাব' : 'RECOMMENDED LAB'}
              </div>
              <div className="font-syne font-bold text-xs text-[#e4e4e7] truncate">
                OWASP Juice Shop
              </div>
              <div className="font-mono text-[10px] text-[#10b981] mt-1">Port 3000 · Sandbox</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
