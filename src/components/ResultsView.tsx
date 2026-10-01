import React, { useState } from 'react';
import {
  FileSearch,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Terminal,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Printer,
  FileCode,
} from 'lucide-react';
import { UserSettings, ToolResult } from '../types';
import { analyzeSecurityOutput } from '../services/aiService';

interface ResultsViewProps {
  settings: UserSettings;
  recentResults: ToolResult[];
  language: 'auto' | 'en' | 'bn';
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  settings,
  recentResults,
  language,
}) => {
  const isBengali = language === 'bn';

  const [rawInput, setRawInput] = useState('');
  const [toolName, setToolName] = useState('Nmap');
  const [target, setTarget] = useState(settings.activeTarget || '127.0.0.1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sample outputs for quick testing
  const sampleNmap = `Starting Nmap 7.94 at 2026-09-30 09:30 UTC
Nmap scan report for 127.0.0.1
Host is up (0.00042s latency).
PORT     STATE SERVICE VERSION
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
443/tcp  open  ssl/http nginx 1.18.0 (Ubuntu)
3000/tcp open  http    Node.js (Express framework)
8080/tcp open  http    Apache Tomcat/9.0.41
Service detection performed. 1 host up scanned in 1.48 seconds`;

  const sampleNikto = `- Nikto v2.5.0
+ Target IP: 127.0.0.1
+ Target Port: 80
+ Server: Apache/2.4.41 (Ubuntu)
+ Retrieved x-powered-by header: PHP/7.4.3
+ The anti-clickjacking X-Frame-Options header is not present.
+ The X-Content-Type-Options header is not set.
+ Root directory indexing is disabled.
+ 0 error(s) and 2 item(s) reported on remote host`;

  const handleAnalyze = async () => {
    if (!rawInput.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeSecurityOutput(rawInput, toolName, target, language);
      setAnalysisResult(res.rawAnalysis || 'Analysis completed with default findings.');
    } catch (err: any) {
      setAnalysisResult(`Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const md = `# Security Diagnostic Analysis Report
**Target**: ${target}
**Tool**: ${toolName}
**Date**: ${new Date().toISOString()}

## Raw Diagnostic Output
\`\`\`
${rawInput}
\`\`\`

## AI Executive Analysis
${analysisResult || 'No analysis generated.'}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analysis-${target}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(
      {
        target,
        tool: toolName,
        timestamp: new Date().toISOString(),
        rawOutput: rawInput,
        analysis: analysisResult,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analysis-${target}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-blue-400" />
            {isBengali ? 'এআই রেজাল্ট অ্যানালাইজার' : 'AI Result & Log Analyzer'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'এনম্যাপ, নিকটো বা সিস্টেম লগ পেস্ট করে এআই এর মাধ্যমে গুরুত্বপূর্ণ পর্যবেক্ষণ ও প্রতিকার জানুন।'
              : 'Paste terminal logs, scan outputs, or HTTP responses for automated defensive breakdown.'}
          </p>
        </div>

        {/* Load Recent Scans Dropdown */}
        {recentResults.length > 0 && (
          <select
            onChange={(e) => {
              const res = recentResults.find((r) => r.id === e.target.value);
              if (res) {
                setRawInput(res.stdout);
                setToolName(res.toolName);
                setTarget(res.target);
              }
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">{isBengali ? 'সাম্প্রতিক স্ক্যান থেকে লোড করুন' : 'Load from Recent Scans...'}</option>
            {recentResults.map((r) => (
              <option key={r.id} value={r.id}>
                {r.toolName} @ {r.target} ({r.executionTimeMs}ms)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Input Form & Sample Buttons */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Tool / Scanner Name:</label>
            <input
              type="text"
              value={toolName}
              onChange={(e) => setToolName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="text-zinc-400 font-medium block mb-1">Target Host / System:</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <label className="font-medium">
              {isBengali ? 'টার্মিনাল আউটপুট বা লগ টেক্সট:' : 'Raw Diagnostic Output / Log Content:'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRawInput(sampleNmap);
                  setToolName('Nmap');
                }}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Sample Nmap
              </button>
              <button
                type="button"
                onClick={() => {
                  setRawInput(sampleNikto);
                  setToolName('Nikto');
                }}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Sample Nikto
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            placeholder={
              isBengali
                ? 'এখানে Nmap, Nikto, HTTP response, অথবা লিনাক্স লগ পেস্ট করুন...'
                : 'Paste terminal scan output, log lines, or HTTP response text here...'
            }
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-200 font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setRawInput('');
              setAnalysisResult(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800"
          >
            {isBengali ? 'ক্লিয়ার' : 'Clear'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!rawInput.trim() || isAnalyzing}
            className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              rawInput.trim() && !isAnalyzing
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              {isAnalyzing
                ? isBengali
                  ? 'বিশ্লেষণ চলছে...'
                  : 'Analyzing...'
                : isBengali
                ? 'এআই অ্যানালাইসিস চালান'
                : 'Analyze Output'}
            </span>
          </button>
        </div>
      </div>

      {/* Analysis Result Box */}
      {analysisResult && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/40 space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider font-mono">
                {isBengali ? 'নিরাপত্তা মূল্যায়ন ও প্রতিকার' : 'Executive Diagnostic Evaluation'}
              </h3>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(analysisResult)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Copy</span>
              </button>
              <button
                onClick={handleExportMarkdown}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1"
                title="Export Markdown"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MD</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1"
                title="Export JSON"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">JSON</span>
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1"
                title="Print Report / Save as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed space-y-2 font-sans">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  );
};
