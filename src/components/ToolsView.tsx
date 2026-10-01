import React, { useState } from 'react';
import {
  Search,
  Filter,
  Wrench,
  Terminal,
  Play,
  Copy,
  ExternalLink,
  Shield,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  BookOpen,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ToolDefinition, UserSettings } from '../types';
import { TOOL_CATEGORIES, TOOLS_DATABASE } from '../data/tools';
import { assembleCommand } from '../services/toolExecutor';

interface ToolsViewProps {
  settings: UserSettings;
  onRunTool: (tool: ToolDefinition, target: string, parameters: Record<string, any>) => void;
  language: 'auto' | 'en' | 'bn';
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  settings,
  onRunTool,
  language,
}) => {
  const isBengali = language === 'bn';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [activeTool, setActiveTool] = useState<ToolDefinition | null>(null);
  const [toolParameters, setToolParameters] = useState<Record<string, any>>({});
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Initialize parameters when active tool changes
  const handleSelectTool = (tool: ToolDefinition) => {
    setActiveTool(tool);
    const initialParams: Record<string, any> = {};
    tool.parameters.forEach((p) => {
      initialParams[p.name] = p.defaultValue ?? '';
    });
    setToolParameters(initialParams);
  };

  const filteredTools = TOOLS_DATABASE.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase()) ||
      tool.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || tool.categoryLetter === selectedCategory;

    const matchesPlatform =
      selectedPlatform === 'ALL' ||
      tool.platform === selectedPlatform ||
      tool.platform === 'multi';

    return matchesSearch && matchesCategory && matchesPlatform;
  });

  const previewCommand = activeTool
    ? assembleCommand(activeTool, settings.activeTarget || '127.0.0.1', toolParameters)
    : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              {isBengali ? 'সিকিউরিটি টুল ক্যাটালগ (A-Z)' : 'Security Tool Catalog (A-Z)'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isBengali
                ? '২৬টি ক্যাটাগরির অনুমোদিত সিকিউরিটি ও ল্যাব টুলসের পূর্ণ ডাটাবেজ।'
                : 'Modular registry of legitimate security tools, diagnostics, and defensive utilities.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
              {filteredTools.length} {isBengali ? 'টুল প্রদর্শিত' : 'Tools Found'}
            </span>
          </div>
        </div>

        {/* Search & Platform Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              placeholder={
                isBengali
                  ? 'টুল নাম, ক্যাটাগরি বা বিবরণ দিয়ে খুঁজুন (Nmap, Wireshark, Gobuster...)'
                  : 'Search by tool name, purpose, or category (Nmap, Wireshark, Gobuster...)'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">{isBengali ? 'সকল প্ল্যাটফর্ম' : 'All Platforms'}</option>
            <option value="linux">Linux Only</option>
            <option value="android">Android / Termux</option>
            <option value="docker">Docker Containers</option>
          </select>
        </div>

        {/* A-Z Category Scroll Ribbon */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ALL
          </button>
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.letter}
              onClick={() => setSelectedCategory(cat.letter)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                selectedCategory === cat.letter
                  ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title={cat.description}
            >
              <span className="font-bold text-zinc-300">{cat.letter}.</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleSelectTool(tool)}
            className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
                    {tool.categoryLetter}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono">{tool.category}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                    tool.riskLevel === 'SAFE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : tool.riskLevel === 'LOW'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : tool.riskLevel === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {tool.riskLevel}
                </span>
              </div>

              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                {isBengali && tool.descriptionBn ? tool.descriptionBn : tool.description}
              </p>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
              <span className="font-mono">Req: {tool.minPermissionRequired}% Perm</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tool.available === 'AVAILABLE' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span className="font-mono text-[10px] text-zinc-400">{tool.available}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tool Detail & Parameter Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold font-mono">
                  {activeTool.categoryLetter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-zinc-100">{activeTool.name}</h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      v{activeTool.version}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{activeTool.category}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Purpose & Description */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  {isBengali ? 'উদ্দেশ্য ও কাজ:' : 'Purpose & Application:'}
                </h4>
                <p className="text-zinc-300 leading-relaxed">{activeTool.purpose}</p>
                {activeTool.descriptionBn && (
                  <p className="text-zinc-400 text-xs mt-1 italic">{activeTool.descriptionBn}</p>
                )}
              </div>

              {/* Status and Parameters */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-0.5">{isBengali ? 'ইনস্টল স্ট্যাটাস' : 'Availability'}</span>
                  <span
                    className={`font-mono font-bold ${
                      activeTool.available === 'AVAILABLE' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {activeTool.available}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-0.5">{isBengali ? 'প্রয়োজনীয় পারমিশন' : 'Min Permission'}</span>
                  <span className="font-mono font-bold text-amber-400">
                    {activeTool.minPermissionRequired}%
                  </span>
                </div>
              </div>

              {/* Parameters Builder */}
              {activeTool.parameters.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {isBengali ? 'কমান্ড প্যারামিটার কনফিগারেশন' : 'Parameter Configuration'}
                  </h4>
                  <div className="space-y-2.5">
                    {activeTool.parameters.map((param) => (
                      <div
                        key={param.name}
                        className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-mono text-zinc-300 font-semibold">
                            {param.flag} ({param.name})
                          </label>
                          <span className="text-[10px] text-zinc-500">{param.type}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {isBengali && param.descriptionBn ? param.descriptionBn : param.description}
                        </p>

                        {param.type === 'select' && param.options && (
                          <select
                            value={toolParameters[param.name] ?? param.defaultValue}
                            onChange={(e) =>
                              setToolParameters({ ...toolParameters, [param.name]: e.target.value })
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                          >
                            {param.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {param.type === 'string' && (
                          <input
                            type="text"
                            value={toolParameters[param.name] ?? ''}
                            onChange={(e) =>
                              setToolParameters({ ...toolParameters, [param.name]: e.target.value })
                            }
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500"
                          />
                        )}

                        {param.type === 'boolean' && (
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={!!toolParameters[param.name]}
                              onChange={(e) =>
                                setToolParameters({
                                  ...toolParameters,
                                  [param.name]: e.target.checked,
                                })
                              }
                              className="rounded text-emerald-500 focus:ring-emerald-500 w-4 h-4 bg-zinc-900 border-zinc-700"
                            />
                            <span className="text-xs text-zinc-300">{isBengali ? 'সক্রিয় করুন' : 'Enable flag'}</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Termux Installation Guide */}
              {activeTool.termuxInstallCommand && (
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1 font-semibold text-cyan-400">
                      <Terminal className="w-3.5 h-3.5" />
                      Termux Installation Guide
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeTool.termuxInstallCommand!);
                        setCopiedCmd(true);
                        setTimeout(() => setCopiedCmd(false), 2000);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="text-xs font-mono text-zinc-300 block bg-zinc-900 p-2 rounded">
                    {activeTool.termuxInstallCommand}
                  </code>
                </div>
              )}

              {/* Command Preview */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
                  {isBengali ? 'জেনারেটেড নিরাপদ কমান্ড প্রিভিউ' : 'Generated Safe Command Preview'}
                </span>
                <div className="p-3 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-emerald-300 break-all">{previewCommand}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(previewCommand);
                      setCopiedCmd(true);
                      setTimeout(() => setCopiedCmd(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white shrink-0"
                    title="Copy command"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0">
              <a
                href={activeTool.documentationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-zinc-400 hover:text-cyan-400 flex items-center gap-1"
              >
                <span>Official Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTool(null)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-xl"
                >
                  {isBengali ? 'বন্ধ করুন' : 'Close'}
                </button>
                <button
                  onClick={() => {
                    onRunTool(
                      activeTool,
                      settings.activeTarget || '127.0.0.1',
                      toolParameters
                    );
                    setActiveTool(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'ল্যাবে চালান' : 'Execute in Lab'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
