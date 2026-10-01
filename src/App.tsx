import React, { useState, useEffect } from 'react';
import { UserSettings, ToolDefinition, ToolResult, AuditEvent, LanguageCode } from './types';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { ConfirmationModal } from './components/ConfirmationModal';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { ToolsView } from './components/ToolsView';
import { CommandsView } from './components/CommandsView';
import { LabsView } from './components/LabsView';
import { AutomationView } from './components/AutomationView';
import { ResultsView } from './components/ResultsView';
import { LearningView } from './components/LearningView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { validateToolRequest, logAuditEvent, getAuditLogs } from './services/securityEngine';
import { executeTool, assembleCommand } from './services/toolExecutor';
import { getPythonCoreStatus } from './services/aiService';
import { TOOLS_DATABASE } from './data/tools';
import { AlertCircle, CheckCircle } from 'lucide-react';

const DEFAULT_SETTINGS: UserSettings = {
  aiProvider: 'gemini',
  aiModel: 'gemini-3.8-flash',
  language: 'auto',
  responseStyle: 'normal',
  temperature: 0.7,
  permissionLevel: 50, // default level 3 (authorized lab scanning)
  maxActions: 15,
  actionsUsed: 0,
  targetScope: 'LOCALHOST',
  activeTarget: '127.0.0.1',
  isTargetAuthorized: false,
  requireConfirmationForScans: true,
  termuxBridge: {
    connected: false,
    host: '127.0.0.1',
    port: 8080,
    status: 'DISCONNECTED',
  },
  offlineMode: false,
  theme: 'dark',
  favorites: {
    tools: ['nmap', 'ping', 'whatweb'],
    commands: [],
    lessons: [],
  },
};

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('ethical_security_settings_v1');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [recentResults, setRecentResults] = useState<ToolResult[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => getAuditLogs());

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );

  // Confirmation modal state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    tool: ToolDefinition | null;
    target: string;
    parameters: Record<string, any>;
    command: string;
  }>({
    isOpen: false,
    tool: null,
    target: '',
    parameters: {},
    command: '',
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('ethical_security_settings_v1', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  // Poll Python AI Core backend status
  useEffect(() => {
    let isMounted = true;
    const checkPython = async () => {
      try {
        const pyStatus = await getPythonCoreStatus();
        if (isMounted) {
          setSettings((prev) => ({
            ...prev,
            pythonCore: pyStatus,
          }));
        }
      } catch (err) {
        console.warn('Python status check failed:', err);
      }
    };
    checkPython();
    const interval = setInterval(checkPython, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleResetActions = () => {
    setSettings((prev) => ({ ...prev, actionsUsed: 0 }));
    showToast('Action limit counter reset to 0.', 'success');
  };

  const handleToggleLanguage = () => {
    const nextLang: LanguageCode = settings.language === 'bn' ? 'en' : 'bn';
    setSettings((prev) => ({ ...prev, language: nextLang }));
    showToast(nextLang === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে।' : 'Language set to English.', 'info');
  };

  // Tool Execution Pipeline
  const handleInitiateTool = (
    tool: ToolDefinition,
    target: string,
    parameters: Record<string, any>,
    skipConfirmation: boolean = false
  ) => {
    const command = assembleCommand(tool, target, parameters);

    // Run security validation
    const validation = validateToolRequest(
      tool,
      target,
      parameters,
      settings,
      skipConfirmation
    );

    if (!validation.allowed) {
      if (validation.requiresModalConfirmation && !skipConfirmation) {
        // Open confirmation modal for legal authorization
        setConfirmModalState({
          isOpen: true,
          tool,
          target,
          parameters,
          command,
        });
        return;
      }

      // Log blocked event
      logAuditEvent({
        toolId: tool.id,
        toolName: tool.name,
        target,
        scope: settings.targetScope,
        actionCount: settings.actionsUsed,
        permissionLevel: settings.permissionLevel,
        resultStatus: 'BLOCKED',
        details: validation.message,
      });
      setAuditEvents(getAuditLogs());

      showToast(validation.message, 'error');
      return;
    }

    // If confirmation is required by setting or tool risk
    if (
      (tool.requiresConfirmation || settings.requireConfirmationForScans) &&
      !skipConfirmation &&
      tool.riskLevel !== 'SAFE'
    ) {
      setConfirmModalState({
        isOpen: true,
        tool,
        target,
        parameters,
        command,
      });
      return;
    }

    // Execute tool
    performExecution(tool, target, parameters);
  };

  const performExecution = async (
    tool: ToolDefinition,
    target: string,
    parameters: Record<string, any>
  ) => {
    // Deduct action
    const newActionsUsed = settings.actionsUsed + 1;
    handleUpdateSettings({ actionsUsed: newActionsUsed });

    try {
      showToast(`Executing ${tool.name} diagnostic...`, 'info');
      const result = await executeTool(tool, target, parameters, settings.targetScope);

      // Record in recent results
      setRecentResults((prev) => [result, ...prev].slice(0, 20));

      // Record in audit log
      logAuditEvent({
        toolId: tool.id,
        toolName: tool.name,
        target,
        scope: settings.targetScope,
        actionCount: newActionsUsed,
        permissionLevel: settings.permissionLevel,
        resultStatus: result.isSimulation ? 'SIMULATED' : 'SUCCESS',
        details: `Command: ${result.command} | Time: ${result.executionTimeMs}ms`,
      });
      setAuditEvents(getAuditLogs());

      showToast(
        `Diagnostic complete: ${tool.name} on ${target} (${result.executionTimeMs}ms).`,
        'success'
      );

      // Switch to results tab so user immediately sees real analysis
      setActiveTab('results');
    } catch (err: any) {
      logAuditEvent({
        toolId: tool.id,
        toolName: tool.name,
        target,
        scope: settings.targetScope,
        actionCount: newActionsUsed,
        permissionLevel: settings.permissionLevel,
        resultStatus: 'ERROR',
        details: err.message,
      });
      setAuditEvents(getAuditLogs());
      showToast(`Execution error: ${err.message}`, 'error');
    }
  };

  // Helper to run command directly from AI Chat or reference cards
  const handleRunCommandString = (commandStr: string, toolId?: string) => {
    const parts = commandStr.trim().split(/\s+/);
    const id = toolId || parts[0].toLowerCase();
    const tool = TOOLS_DATABASE.find((t) => t.id === id) || TOOLS_DATABASE[0];
    const target = parts[parts.length - 1] || settings.activeTarget;
    handleInitiateTool(tool, target, {});
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0c0e] text-[#e4e4e7] flex flex-col md:flex-row antialiased selection:bg-[#10b981] selection:text-[#0c0c0e]">
      {/* Systematic Industrial Navigation (Sidebar on Desktop, Bottom Bar on Mobile) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={settings.language}
      />

      {/* Main Workspace (Header + Content Pane) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Systematic HUD Header */}
        <Header
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetActions={handleResetActions}
          language={settings.language}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 md:pb-12 bg-[#0c0c0e]">
          {activeTab === 'home' && (
            <DashboardView
              settings={settings}
              onSelectTab={setActiveTab}
              recentResults={recentResults}
              language={settings.language}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onRunCommand={handleRunCommandString}
              language={settings.language}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsView
              settings={settings}
              onRunTool={handleInitiateTool}
              language={settings.language}
            />
          )}

          {activeTab === 'commands' && (
            <CommandsView
              settings={settings}
              onRunTool={handleInitiateTool}
              language={settings.language}
            />
          )}

          {activeTab === 'labs' && (
            <LabsView
              settings={settings}
              onRunTool={handleInitiateTool}
              language={settings.language}
            />
          )}

          {activeTab === 'automation' && (
            <AutomationView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              language={settings.language}
            />
          )}

          {activeTab === 'results' && (
            <ResultsView
              settings={settings}
              recentResults={recentResults}
              language={settings.language}
            />
          )}

          {activeTab === 'learning' && <LearningView language={settings.language} />}

          {activeTab === 'history' && (
            <HistoryView
              auditEvents={auditEvents}
              onRefreshEvents={() => setAuditEvents(getAuditLogs())}
              language={settings.language}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetActions={handleResetActions}
              language={settings.language}
            />
          )}
        </main>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 animate-in slide-in-from-bottom duration-200">
          <div
            className={`px-4 py-3 rounded-[4px] border shadow-2xl flex items-center gap-2.5 text-xs font-mono ${
              toast.type === 'error'
                ? 'bg-[#180a0a] border-red-500/50 text-red-200'
                : toast.type === 'success'
                ? 'bg-[#0a1811] border-[#10b981]/50 text-emerald-200'
                : 'bg-[#111113] border-[rgba(228,228,231,0.2)] text-[#e4e4e7]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-[#10b981] shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Legal Authorization Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalState.isOpen}
        tool={confirmModalState.tool}
        target={confirmModalState.target}
        scope={settings.targetScope}
        command={confirmModalState.command}
        language={settings.language}
        onConfirm={() => {
          if (confirmModalState.tool) {
            performExecution(
              confirmModalState.tool,
              confirmModalState.target,
              confirmModalState.parameters
            );
          }
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
