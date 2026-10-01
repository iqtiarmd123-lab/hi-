import React, { useState } from 'react';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowDown,
  Layers,
  Shield,
  Activity,
} from 'lucide-react';
import { Workflow, WorkflowNode, UserSettings, ToolDefinition } from '../types';
import { TOOLS_DATABASE } from '../data/tools';
import { executeTool } from '../services/toolExecutor';
import { validateToolRequest } from '../services/securityEngine';

interface AutomationViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  language: 'auto' | 'en' | 'bn';
}

export const AutomationView: React.FC<AutomationViewProps> = ({
  settings,
  onUpdateSettings,
  language,
}) => {
  const isBengali = language === 'bn';

  const initialNodes: WorkflowNode[] = [
    {
      id: 'node-1',
      toolId: 'ping',
      name: 'Host Reachability Diagnostic',
      parameters: { count: 3 },
      timeoutSec: 5,
      actionCost: 1,
      permissionRequired: 10,
      confirmationRequired: false,
      stopOnError: true,
      status: 'PENDING',
    },
    {
      id: 'node-2',
      toolId: 'nmap',
      name: 'Service Version Fingerprint',
      parameters: { scanType: '-sT', versionDetection: true, ports: '80,443,3000' },
      timeoutSec: 10,
      actionCost: 1,
      permissionRequired: 25,
      confirmationRequired: false,
      stopOnError: true,
      status: 'PENDING',
    },
    {
      id: 'node-3',
      toolId: 'whatweb',
      name: 'Web Tech Stack Inspection',
      parameters: { aggression: '1' },
      timeoutSec: 8,
      actionCost: 1,
      permissionRequired: 20,
      confirmationRequired: false,
      stopOnError: false,
      status: 'PENDING',
    },
    {
      id: 'node-4',
      toolId: 'nuclei',
      name: 'Configuration Audit Check',
      parameters: { tags: 'config,exposure' },
      timeoutSec: 15,
      actionCost: 1,
      permissionRequired: 45,
      confirmationRequired: false,
      stopOnError: false,
      status: 'PENDING',
    },
  ];

  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'wf-recon-pipeline',
    name: 'Defensive Lab Baseline Workflow',
    description: 'Sequentially discovers connectivity, enumerates services, identifies tech headers, and audits configs.',
    target: settings.activeTarget || '127.0.0.1',
    scope: settings.targetScope,
    status: 'IDLE',
    nodes: initialNodes,
  });

  const [currentNodeIndex, setCurrentNodeIndex] = useState<number | null>(null);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runWorkflow = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setWorkflow((prev) => ({
      ...prev,
      status: 'RUNNING',
      nodes: prev.nodes.map((n) => ({ ...n, status: 'PENDING', result: undefined })),
    }));
    setExecutionLogs([
      `[${new Date().toLocaleTimeString()}] Initializing workflow: ${workflow.name}`,
      `Target: ${workflow.target} (${workflow.scope})`,
      `Permission: ${settings.permissionLevel}% | Actions: ${settings.actionsUsed}/${settings.maxActions}`,
    ]);

    let currentUsed = settings.actionsUsed;

    for (let i = 0; i < workflow.nodes.length; i++) {
      setCurrentNodeIndex(i);
      const node = workflow.nodes[i];
      const tool = TOOLS_DATABASE.find((t) => t.id === node.toolId);

      if (!tool) {
        setExecutionLogs((prev) => [...prev, `[ERROR] Tool '${node.toolId}' not found in registry.`]);
        break;
      }

      // 1. Validate security constraints
      const validation = validateToolRequest(
        tool,
        workflow.target,
        node.parameters,
        { ...settings, actionsUsed: currentUsed }
      );

      if (!validation.allowed) {
        setExecutionLogs((prev) => [
          ...prev,
          `[BLOCKED] Step ${i + 1} (${tool.name}) stopped by Security Engine: ${validation.message}`,
        ]);
        setWorkflow((prev) => ({
          ...prev,
          status: 'STOPPED_ERROR',
          nodes: prev.nodes.map((n, idx) => (idx === i ? { ...n, status: 'FAILED' } : n)),
        }));
        setIsRunning(false);
        return;
      }

      // 2. Mark node running
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n, idx) => (idx === i ? { ...n, status: 'RUNNING' } : n)),
      }));

      setExecutionLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Executing Step ${i + 1}/${workflow.nodes.length}: ${tool.name}...`,
      ]);

      // 3. Deduct action cost
      currentUsed += node.actionCost;
      onUpdateSettings({ actionsUsed: currentUsed });

      // 4. Execute tool in safe sandbox
      try {
        const result = await executeTool(tool, workflow.target, node.parameters, workflow.scope);

        setWorkflow((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n, idx) =>
            idx === i ? { ...n, status: 'COMPLETED', result } : n
          ),
        }));

        setExecutionLogs((prev) => [
          ...prev,
          `[SUCCESS] Step ${i + 1} completed (${result.executionTimeMs}ms). Exit: ${result.exitCode}`,
        ]);
      } catch (err: any) {
        setExecutionLogs((prev) => [...prev, `[FAILED] Step ${i + 1} error: ${err.message}`]);
        setWorkflow((prev) => ({
          ...prev,
          status: 'STOPPED_ERROR',
          nodes: prev.nodes.map((n, idx) => (idx === i ? { ...n, status: 'FAILED' } : n)),
        }));
        if (node.stopOnError) {
          setIsRunning(false);
          return;
        }
      }
    }

    setWorkflow((prev) => ({ ...prev, status: 'COMPLETED' }));
    setExecutionLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Workflow finished successfully. All planned nodes executed.`,
    ]);
    setIsRunning(false);
    setCurrentNodeIndex(null);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentNodeIndex(null);
    setWorkflow((prev) => ({
      ...prev,
      status: 'IDLE',
      nodes: initialNodes,
    }));
    setExecutionLogs([]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            {isBengali ? 'ভিজুয়াল ওয়ার্কফ্লো অটোমেশন' : 'Visual Workflow Automation'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {isBengali
              ? 'নিরাপত্তা নীতি, অ্যাকশন লিমিট ও পারমিশন গার্ডরেইল সহ মাল্টি-স্টেপ ল্যাব সিকোয়েন্স।'
              : 'Multi-step diagnostics constrained by strict scope checks and action limits.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={isRunning}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBengali ? 'রিসেট' : 'Reset'}</span>
          </button>

          <button
            onClick={runWorkflow}
            disabled={isRunning || settings.actionsUsed >= settings.maxActions}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isRunning || settings.actionsUsed >= settings.maxActions
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? (isBengali ? 'চলছে...' : 'Running...') : isBengali ? 'ওয়ার্কফ্লো শুরু' : 'Start Workflow'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Status Bar */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div>
          <span className="text-zinc-500 block mb-0.5">{isBengali ? 'টার্গেট ও স্কোপ:' : 'Target & Scope:'}</span>
          <span className="text-cyan-400 font-bold">{workflow.target}</span>
          <span className="text-zinc-500 ml-1.5">({workflow.scope})</span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-0.5">{isBengali ? 'পরিকল্পিত অ্যাকশন:' : 'Action Consumption:'}</span>
          <span className="text-amber-400 font-bold">
            +{workflow.nodes.length} Actions
          </span>
          <span className="text-zinc-500 ml-1">
            (Total: {settings.actionsUsed}/{settings.maxActions})
          </span>
        </div>

        <div>
          <span className="text-zinc-500 block mb-0.5">{isBengali ? 'স্ট্যাটাস:' : 'Workflow Status:'}</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              workflow.status === 'COMPLETED'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : workflow.status === 'RUNNING'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse'
                : workflow.status === 'STOPPED_ERROR'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {workflow.status}
          </span>
        </div>
      </div>

      {/* Visual Pipeline Nodes */}
      <div className="space-y-3">
        {workflow.nodes.map((node, idx) => {
          const isCurrent = currentNodeIndex === idx;
          const isDone = node.status === 'COMPLETED';
          const isFailed = node.status === 'FAILED';

          return (
            <React.Fragment key={node.id}>
              <div
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/20 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : isDone
                    ? 'bg-emerald-950/15 border-emerald-500/30'
                    : isFailed
                    ? 'bg-red-950/20 border-red-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                        isDone
                          ? 'bg-emerald-500 text-zinc-950'
                          : isCurrent
                          ? 'bg-cyan-500 text-zinc-950 animate-pulse'
                          : isFailed
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-100">{node.name}</h4>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Tool: <strong className="text-emerald-400">{node.toolId}</strong> · Cost: {node.actionCost} action · Min Perm: {node.permissionRequired}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px]">
                    {isDone && <span className="text-emerald-400 font-bold">COMPLETED</span>}
                    {isCurrent && <span className="text-cyan-400 font-bold">RUNNING...</span>}
                    {isFailed && <span className="text-red-400 font-bold">STOPPED</span>}
                    {node.status === 'PENDING' && <span className="text-zinc-500">QUEUED</span>}
                  </div>
                </div>

                {node.result && (
                  <div className="mt-3 pt-3 border-t border-zinc-800/80">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">
                      Execution Output Preview:
                    </span>
                    <pre className="text-[11px] font-mono text-zinc-300 bg-zinc-950 p-2.5 rounded-lg overflow-x-auto max-h-28 border border-zinc-800">
                      {node.result.stdout}
                    </pre>
                  </div>
                )}
              </div>

              {idx < workflow.nodes.length - 1 && (
                <div className="flex justify-center my-0.5">
                  <ArrowDown className="w-4 h-4 text-zinc-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Live Execution Logs Console */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2">
          <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            Workflow Audit & Execution Log
          </span>
          <span className="text-[10px] text-zinc-500">{executionLogs.length} events</span>
        </div>
        <div className="text-[11px] text-zinc-400 space-y-1 max-h-40 overflow-y-auto pr-1">
          {executionLogs.length === 0 ? (
            <p className="text-zinc-600 italic">No execution events yet. Press "Start Workflow" to begin.</p>
          ) : (
            executionLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
