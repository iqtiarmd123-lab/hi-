import React, { useState } from 'react';
import {
  Shield,
  Target,
  Gauge,
  Activity,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  Terminal,
  Globe,
} from 'lucide-react';
import { UserSettings, TargetScope } from '../types';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetActions: () => void;
  language: 'auto' | 'en' | 'bn';
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onResetActions,
  language,
  onToggleLanguage,
}) => {
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState('');

  const isBengali = language === 'bn';

  const scopeColorMap: Record<TargetScope, string> = {
    LOCALHOST: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40',
    PRIVATE_NETWORK: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
    AUTHORIZED_LAB: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    USER_AUTHORIZED_TARGET: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  };

  const commonTargets = [
    { label: 'Localhost (127.0.0.1)', target: '127.0.0.1', scope: 'LOCALHOST' as TargetScope },
    { label: 'DVWA Lab (dvwa.local)', target: 'dvwa.local', scope: 'AUTHORIZED_LAB' as TargetScope },
    { label: 'Juice Shop (127.0.0.1:3000)', target: '127.0.0.1:3000', scope: 'AUTHORIZED_LAB' as TargetScope },
    { label: 'Private Subnet (192.168.1.1)', target: '192.168.1.1', scope: 'PRIVATE_NETWORK' as TargetScope },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e] border-b border-[rgba(228,228,231,0.1)] h-16 px-4 md:px-8 flex items-center justify-between select-none">
      {/* Left: Mobile Brand & Desktop System Meta */}
      <div className="flex items-center gap-4">
        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-7 h-7 rounded-[4px] bg-[#10b981] flex items-center justify-center text-[#0c0c0e] font-bold">
            <Shield className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="font-syne font-extrabold text-sm tracking-tight text-[#e4e4e7]">
            SECURITY AI
          </span>
        </div>

        {/* Desktop System Meta (JetBrains Mono uppercase metrics) */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[0.65rem] tracking-[0.1em] uppercase text-[rgba(228,228,231,0.5)]">
          {/* Active Status */}
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-subtle" />
            <span className="text-[#e4e4e7]">DEFENSIVE SYSTEM: ACTIVE</span>
          </div>

          {/* Python AI Core Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                settings.pythonCore?.connected ? 'bg-[#10b981]' : 'bg-zinc-600'
              }`}
            />
            <span>
              PYTHON CORE:{' '}
              <strong
                className={
                  settings.pythonCore?.connected ? 'text-[#10b981]' : 'text-[rgba(228,228,231,0.4)]'
                }
              >
                {settings.pythonCore?.connected ? 'ONLINE' : 'STANDBY'}
              </strong>
            </span>
          </div>

          {/* Target Scope */}
          <div className="flex items-center gap-2">
            <span className="text-[rgba(228,228,231,0.4)]">SCOPE:</span>
            <span className="text-[#10b981] font-semibold">{settings.targetScope}</span>
          </div>

          {/* Action Budget */}
          <div className="flex items-center gap-2">
            <span className="text-[rgba(228,228,231,0.4)]">BUDGET:</span>
            <span
              className={
                settings.actionsUsed >= settings.maxActions
                  ? 'text-red-400 font-bold'
                  : 'text-[#e4e4e7]'
              }
            >
              {settings.actionsUsed}/{settings.maxActions}
            </span>
            {settings.actionsUsed > 0 && (
              <button
                onClick={onResetActions}
                title="Reset Action Counter"
                className="hover:text-white transition-colors text-[rgba(228,228,231,0.4)]"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions, Target Dropdown & Language Switch */}
      <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
        {/* Target Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTargetDropdown(!showTargetDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#111113] border border-[rgba(228,228,231,0.1)] hover:border-[rgba(228,228,231,0.25)] transition-colors text-[#e4e4e7]"
            title="Target System"
          >
            <Target className="w-3.5 h-3.5 text-[#10b981]" />
            <span className="font-mono text-[11px] truncate max-w-[110px] sm:max-w-[140px]">
              {settings.activeTarget || '127.0.0.1'}
            </span>
            <span
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[3px] border hidden sm:inline-block ${
                scopeColorMap[settings.targetScope]
              }`}
            >
              {settings.targetScope}
            </span>
            <ChevronDown className="w-3 h-3 text-[rgba(228,228,231,0.5)]" />
          </button>

          {/* Target Dropdown Menu */}
          {showTargetDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-[#111113] border border-[rgba(228,228,231,0.15)] rounded-[6px] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="font-mono text-[10px] font-semibold text-[rgba(228,228,231,0.5)] uppercase tracking-wider mb-2">
                {isBengali ? 'অনুমোদিত টার্গেট নির্বাচন করুন' : 'Select Authorized Target'}
              </div>
              <div className="space-y-1 mb-3">
                {commonTargets.map((item) => (
                  <button
                    key={item.target}
                    onClick={() => {
                      onUpdateSettings({ activeTarget: item.target, targetScope: item.scope });
                      setShowTargetDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs hover:bg-[rgba(228,228,231,0.08)] text-[rgba(228,228,231,0.8)] hover:text-white flex items-center justify-between"
                  >
                    <span className="truncate">{item.label}</span>
                    {settings.activeTarget === item.target && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981] shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-[rgba(228,228,231,0.1)]">
                <label className="font-mono text-[10px] text-[rgba(228,228,231,0.5)] mb-1 block">
                  {isBengali ? 'কাস্টম টার্গেট লিখুন:' : 'Custom Target (Lab / Host):'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.10"
                    value={customTargetInput}
                    onChange={(e) => setCustomTargetInput(e.target.value)}
                    className="flex-1 bg-[#0c0c0e] border border-[rgba(228,228,231,0.15)] rounded-[4px] px-2.5 py-1 text-xs text-[#e4e4e7] font-mono focus:outline-none focus:border-[#10b981]"
                  />
                  <button
                    onClick={() => {
                      if (customTargetInput.trim()) {
                        onUpdateSettings({
                          activeTarget: customTargetInput.trim(),
                          targetScope: 'USER_AUTHORIZED_TARGET',
                        });
                        setShowTargetDropdown(false);
                        setCustomTargetInput('');
                      }
                    }}
                    className="px-2.5 py-1 bg-[#10b981] hover:bg-emerald-400 text-[#0c0c0e] rounded-[4px] text-xs font-semibold"
                  >
                    {isBengali ? 'সেট' : 'Set'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Permission Level Gauge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#111113] border border-[rgba(228,228,231,0.1)]"
          title={`Permission Level: ${settings.permissionLevel}/100`}
        >
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[11px] text-[#e4e4e7]">
            {settings.permissionLevel}%
          </span>
          <div className="w-8 h-1 bg-[rgba(228,228,231,0.1)] rounded-[1px] overflow-hidden hidden sm:block">
            <div
              className={`h-full transition-all duration-300 ${
                settings.permissionLevel > 80
                  ? 'bg-red-500'
                  : settings.permissionLevel > 40
                  ? 'bg-amber-400'
                  : 'bg-[#10b981]'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, settings.permissionLevel))}%` }}
            />
          </div>
        </div>

        {/* Systematic Language Switch Button */}
        <button
          onClick={onToggleLanguage}
          className="font-mono text-[0.7rem] px-3 py-1.5 border border-[rgba(228,228,231,0.1)] rounded-[4px] hover:bg-[rgba(228,228,231,0.08)] cursor-pointer flex items-center gap-2 text-[#e4e4e7] transition-colors"
          title="Switch Language (English / বাংলা)"
        >
          <Globe className="w-3.5 h-3.5 text-[#10b981]" />
          <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
        </button>
      </div>
    </header>
  );
};
