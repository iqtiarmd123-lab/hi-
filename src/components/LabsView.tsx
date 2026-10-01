import React, { useState } from 'react';
import {
  FlaskConical,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  Info,
  Check,
  Eye,
} from 'lucide-react';
import { Lab, UserSettings, ToolDefinition } from '../types';
import { LABS_DATABASE, PHISHING_AWARENESS_TEMPLATES, PhishingEmailTemplate } from '../data/labsData';
import { TOOLS_DATABASE } from '../data/tools';

interface LabsViewProps {
  settings: UserSettings;
  onRunTool: (tool: ToolDefinition, target: string, parameters: Record<string, any>) => void;
  language: 'auto' | 'en' | 'bn';
}

export const LabsView: React.FC<LabsViewProps> = ({
  settings,
  onRunTool,
  language,
}) => {
  const isBengali = language === 'bn';

  const [activeTab, setActiveTab] = useState<'labs' | 'phishing'>('labs');
  const [labs, setLabs] = useState<Lab[]>(LABS_DATABASE);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Phishing simulator state
  const [selectedEmail, setSelectedEmail] = useState<PhishingEmailTemplate>(
    PHISHING_AWARENESS_TEMPLATES[0]
  );
  const [userFlaggedSuspicious, setUserFlaggedSuspicious] = useState<boolean | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const toggleTask = (labId: string, taskId: string) => {
    setLabs((prev) =>
      prev.map((lab) => {
        if (lab.id !== labId) return lab;
        return {
          ...lab,
          tasks: lab.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            {isBengali ? 'ল্যাব ও ফিশিং সচেতনতা সিমুলেটর' : 'Authorized Labs & Awareness Simulator'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'নিরাপদ স্থানীয় ডকার ল্যাব ও সচেতনতামূলক সিমুলেশন পরিবেশ।'
              : 'Containerized training environments and safe educational simulators.'}
          </p>
        </div>

        <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
          <button
            onClick={() => setActiveTab('labs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'labs'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isBengali ? 'ট্রেনিং ল্যাবস' : 'Training Labs'}
          </button>
          <button
            onClick={() => setActiveTab('phishing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'phishing'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isBengali ? 'ফিশিং সিমুলেটর' : 'Phishing Awareness'}
          </button>
        </div>
      </div>

      {activeTab === 'labs' ? (
        /* Training Labs Section */
        <div className="space-y-4">
          {labs.map((lab) => (
            <div
              key={lab.id}
              className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-100">{lab.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {lab.type}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        lab.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : lab.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {lab.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {isBengali && lab.descriptionBn ? lab.descriptionBn : lab.description}
                  </p>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <div className="text-xs font-mono text-cyan-400 font-semibold">
                    {lab.targetHost}:{lab.targetPort}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">Net: {lab.network}</div>
                </div>
              </div>

              {/* Docker Launch Command */}
              {lab.dockerCommand && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      Docker Run Command:
                    </span>
                    <button
                      onClick={() => handleCopy(lab.id, lab.dockerCommand!)}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 font-mono"
                    >
                      {copiedCmd === lab.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCmd === lab.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="text-xs font-mono text-emerald-300 block bg-zinc-900 p-2 rounded break-all">
                    {lab.dockerCommand}
                  </code>
                </div>
              )}

              {/* Tasks & Verification Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
                  {isBengali ? 'ল্যাব টাস্ক ও ভেরিফিকেশন তালিকা:' : 'Guided Lab Tasks:'}
                </span>
                <div className="space-y-1.5">
                  {lab.tasks.map((task) => {
                    const tool = task.verificationTool
                      ? TOOLS_DATABASE.find((t) => t.id === task.verificationTool)
                      : null;

                    return (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                          task.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleTask(lab.id, task.id)}
                            className="mt-0.5 text-zinc-400 hover:text-emerald-400"
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                task.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-zinc-600'
                              }`}
                            />
                          </button>
                          <div>
                            <div className="text-xs font-semibold">{task.title}</div>
                            <p className="text-[11px] text-zinc-400">{task.description}</p>
                          </div>
                        </div>

                        {tool && (
                          <button
                            onClick={() =>
                              onRunTool(tool, lab.targetHost, { ports: String(lab.targetPort) })
                            }
                            className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-cyan-400 border border-zinc-700 text-xs font-medium flex items-center gap-1 shrink-0 self-end sm:self-auto"
                          >
                            <Play className="w-3 h-3" />
                            <span>{isBengali ? 'ভেরিফাই করুন' : `Run ${tool.name}`}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Educational Phishing Awareness Lab */
        <div className="space-y-5">
          {/* Safety Notice */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">
                {isBengali ? 'শিক্ষামূলক সচেতনতা পরিবেশ (Safe Awareness Simulator)' : 'Educational Awareness Simulator'}
              </strong>
              <p className="text-amber-200/90 leading-relaxed">
                {isBengali
                  ? 'এই ল্যাবটি শুধুমাত্র ব্যবহারকারীদের ফিশিং ইমেল সনাক্তকরণ শেখানোর জন্য। এটি কোনো বাস্তব ক্রেডেনশিয়াল সংগ্রহ বা প্রেরণ করে না। সর্বদা শুধুমাত্র কাল্পনিক টেস্ট ডাটা ব্যবহৃত হয়।'
                  : 'This environment is strictly for teaching human verification and defensive email header inspection. No real credentials are ever harvested, stored, or transmitted.'}
              </p>
            </div>
          </div>

          {/* Email Template Selector */}
          <div className="flex gap-2">
            {PHISHING_AWARENESS_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  setSelectedEmail(tmpl);
                  setUserFlaggedSuspicious(null);
                  setShowAnalysis(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                  selectedEmail.id === tmpl.id
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="font-bold truncate max-w-[200px]">{tmpl.subject}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">{tmpl.displaySender}</div>
              </button>
            ))}
          </div>

          {/* Simulated Email Client View */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
            {/* Email Header */}
            <div className="border-b border-zinc-800 pb-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-100">{selectedEmail.subject}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{selectedEmail.date}</span>
              </div>
              <div className="text-zinc-400 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-500">From: </span>
                  <span className="text-zinc-200 font-semibold">{selectedEmail.displaySender}</span> &lt;{selectedEmail.sender}&gt;
                </div>
                <div>
                  <span className="text-zinc-500">Reply-To: </span>
                  <span className="text-cyan-400">{selectedEmail.replyTo}</span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-line leading-relaxed font-sans">
              {selectedEmail.body}
            </div>

            {/* User Assessment Quiz */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
              <span className="text-xs font-semibold text-zinc-200 block">
                {isBengali ? 'আপনার মূল্যায়ন: এটি কি একটি ফিশিং আক্রমণ?' : 'Your Assessment: Is this email suspicious / phishing?'}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUserFlaggedSuspicious(true);
                    setShowAnalysis(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    userFlaggedSuspicious === true
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>{isBengali ? 'হ্যাঁ, এটি সন্দেহজনক ফিশিং' : 'Yes, Suspicious Phishing'}</span>
                </button>
                <button
                  onClick={() => {
                    setUserFlaggedSuspicious(false);
                    setShowAnalysis(true);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    userFlaggedSuspicious === false
                      ? 'bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBengali ? 'না, এটি নিরাপদ নোটিফিকেশন' : 'No, Safe / Legitimate'}</span>
                </button>
              </div>
            </div>

            {/* Detailed Defensive Breakdown */}
            {showAnalysis && (
              <div className="p-4 rounded-xl bg-zinc-950 border border-amber-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      userFlaggedSuspicious === selectedEmail.isSuspicious
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {userFlaggedSuspicious === selectedEmail.isSuspicious
                      ? isBengali ? 'সঠিক মূল্যায়ন!' : 'CORRECT EVALUATION!'
                      : isBengali ? 'ভুল উত্তর' : 'INCORRECT EVALUATION'}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {isBengali ? selectedEmail.explanationBn : selectedEmail.explanation}
                </p>

                {selectedEmail.redFlags.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                      {isBengali ? 'গুরুত্বপূর্ণ লাল পতাকা (Red Flags):' : 'Key Red Flags Detected:'}
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
                      {(isBengali && selectedEmail.redFlagsBn.length > 0
                        ? selectedEmail.redFlagsBn
                        : selectedEmail.redFlags
                      ).map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
