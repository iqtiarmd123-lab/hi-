import React, { useState } from 'react';
import {
  Home,
  MessageSquareCode,
  Wrench,
  Terminal,
  FlaskConical,
  Cpu,
  FileSearch,
  GraduationCap,
  History,
  Settings,
  MoreHorizontal,
  X,
  Shield,
} from 'lucide-react';

export type NavTab =
  | 'home'
  | 'chat'
  | 'tools'
  | 'commands'
  | 'labs'
  | 'automation'
  | 'results'
  | 'learning'
  | 'history'
  | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  language: 'auto' | 'en' | 'bn';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  language,
}) => {
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const isBengali = language === 'bn';

  const navItems = [
    { id: 'home' as NavTab, label: isBengali ? 'হোমস' : 'Home', icon: Home },
    { id: 'chat' as NavTab, label: isBengali ? 'এআই চ্যাট' : 'AI Chat', icon: MessageSquareCode },
    { id: 'tools' as NavTab, label: isBengali ? 'টুলস' : 'Tools', icon: Wrench },
    { id: 'commands' as NavTab, label: isBengali ? 'এনম্যাপ' : 'Commands', icon: Terminal },
    { id: 'labs' as NavTab, label: isBengali ? 'ল্যাবস' : 'Labs', icon: FlaskConical },
    { id: 'automation' as NavTab, label: isBengali ? 'অটোমেশন' : 'Automation', icon: Cpu },
    { id: 'results' as NavTab, label: isBengali ? 'অ্যানালাইসিস' : 'Results', icon: FileSearch },
    { id: 'learning' as NavTab, label: isBengali ? 'লার্নিং' : 'Learning', icon: GraduationCap },
    { id: 'history' as NavTab, label: isBengali ? 'অডিট' : 'Audit Logs', icon: History },
    { id: 'settings' as NavTab, label: isBengali ? 'সেটিংস' : 'Settings', icon: Settings },
  ];

  const mobilePrimary = navItems.slice(0, 4);
  const mobileSecondary = navItems.slice(4);

  return (
    <>
      {/* Desktop Systematic Industrial Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] border-r border-[rgba(228,228,231,0.1)] bg-[#111113] p-4 shrink-0 justify-between select-none">
        <div>
          {/* Brand header */}
          <div className="px-3 pt-2 pb-7 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#10b981] flex items-center justify-center text-[#0c0c0e] shrink-0 font-bold shadow-sm">
              <Shield className="w-4 h-4 fill-current stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-syne font-extrabold text-[0.95rem] tracking-[-0.04em] text-[#e4e4e7] leading-tight">
                SECURITY AI
              </span>
              <span className="font-mono text-[9px] text-[rgba(228,228,231,0.45)] tracking-wider uppercase">
                SYSTEMATIC INDUSTRIAL
              </span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[0.85rem] font-medium transition-all text-left ${
                    isActive
                      ? 'bg-[rgba(228,228,231,0.1)] text-[#10b981] border-l-[3px] border-[#10b981]'
                      : 'text-[rgba(228,228,231,0.5)] hover:bg-[rgba(228,228,231,0.08)] hover:text-[#e4e4e7] border-l-[3px] border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#10b981]' : 'text-[rgba(228,228,231,0.5)]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.id === 'chat' && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-subtle" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Meta */}
        <div className="pt-4 border-t border-[rgba(228,228,231,0.1)] font-mono text-[0.65rem] text-[rgba(228,228,231,0.45)] uppercase tracking-[0.1em] space-y-1">
          <div className="flex items-center gap-2 text-[#10b981]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-subtle inline-block" />
            <span>ETHICAL SCOPE: LOCKED</span>
          </div>
          <div className="text-[rgba(228,228,231,0.35)]">LOCALHOST & LABS ONLY</div>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-lg border-t border-[rgba(228,228,231,0.1)] px-2 py-1.5">
        <div className="flex items-center justify-around">
          {mobilePrimary.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setShowMoreMobile(false);
                }}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
                  isActive ? 'text-[#10b981]' : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowMoreMobile(!showMoreMobile)}
            className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
              mobileSecondary.some((i) => i.id === activeTab)
                ? 'text-[#10b981]'
                : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
            }`}
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px] mt-0.5 font-medium">{isBengali ? 'আরও' : 'More'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Drawer */}
      {showMoreMobile && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#111113] border-t border-[rgba(228,228,231,0.15)] rounded-t-2xl p-4 animate-in slide-in-from-bottom duration-200 pb-20">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(228,228,231,0.1)] mb-3">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[rgba(228,228,231,0.6)]">
                {isBengali ? 'সকল মডিউল' : 'All Modules'}
              </span>
              <button
                onClick={() => setShowMoreMobile(false)}
                className="p-1 rounded-lg text-[rgba(228,228,231,0.5)] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {mobileSecondary.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setShowMoreMobile(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                      isActive
                        ? 'bg-[rgba(228,228,231,0.1)] border-[#10b981] text-[#10b981]'
                        : 'bg-[#0c0c0e] border-[rgba(228,228,231,0.1)] text-[rgba(228,228,231,0.7)] hover:bg-[#111113]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
