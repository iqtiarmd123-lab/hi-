import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { ToolDefinition, TargetScope } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  tool: ToolDefinition | null;
  target: string;
  scope: TargetScope;
  command: string;
  onConfirm: () => void;
  onCancel: () => void;
  language: 'auto' | 'en' | 'bn';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  tool,
  target,
  scope,
  command,
  onConfirm,
  onCancel,
  language,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen || !tool) return null;

  const isBengali = language === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#111113] border border-[rgba(228,228,231,0.2)] rounded-[4px] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#0c0c0e] border-b border-[rgba(228,228,231,0.1)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-[4px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-syne text-base font-bold text-[#e4e4e7] uppercase tracking-tight">
                {isBengali ? 'নিরাপত্তা ও আইনি অনুমোদন যাচাই' : 'Security & Authorization Check'}
              </h3>
              <p className="font-mono text-[10px] text-amber-400/90 uppercase tracking-wider">
                {isBengali ? 'অনুমোদিত ল্যাব বা মালিকানাধীন সিস্টেম নিশ্চিত করুন' : 'Verify ownership or explicit authorization'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-[4px] hover:bg-[rgba(228,228,231,0.1)] text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm text-[rgba(228,228,231,0.8)]">
          <div className="p-4 rounded-[4px] bg-[#0c0c0e] border border-[rgba(228,228,231,0.1)] space-y-2.5">
            <div className="flex justify-between font-mono text-xs text-[rgba(228,228,231,0.5)]">
              <span>{isBengali ? 'টুল:' : 'TOOL:'} <strong className="text-[#e4e4e7]">{tool.name}</strong></span>
              <span>{isBengali ? 'ঝুঁকি:' : 'RISK:'} <strong className="text-amber-400">{tool.riskLevel}</strong></span>
            </div>
            <div className="flex justify-between font-mono text-xs text-[rgba(228,228,231,0.5)]">
              <span>{isBengali ? 'টার্গেট:' : 'TARGET:'} <strong className="text-[#10b981]">{target}</strong></span>
              <span>{isBengali ? 'স্কোপ:' : 'SCOPE:'} <strong className="text-purple-400">{scope}</strong></span>
            </div>
            <div className="mt-2 pt-2 border-t border-[rgba(228,228,231,0.1)]">
              <span className="font-mono text-[10px] text-[rgba(228,228,231,0.4)] block mb-1 uppercase tracking-wider">
                {isBengali ? 'আসেম্বল্ড কমান্ড:' : 'ASSEMBLED COMMAND:'}
              </span>
              <code className="text-xs font-mono text-[#10b981] bg-[#111113] p-2.5 rounded-[3px] border border-[rgba(228,228,231,0.1)] block break-all">
                {command}
              </code>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[rgba(228,228,231,0.6)] font-sans">
            {isBengali
              ? 'সাইবার সিকিউরিটি নীতি অনুসারে, কোনো সিস্টেমের অনুমতি ছাড়া স্ক্যানিং বা ডায়াগনস্টিক চালানো সম্পূর্ণ নিষিদ্ধ। এই প্ল্যাটফর্মটি শুধুমাত্র অনুমোদিত ল্যাব, সিটিএফ এবং আপনার মালিকানাধীন সিস্টেমের জন্য।'
              : 'Under cybersecurity policies, performing diagnostics or scans without prior written authorization is strictly prohibited. This platform operates solely for authorized educational labs, local testbenches, and systems you legally own.'}
          </p>

          <label className="flex items-start gap-3 p-3.5 rounded-[4px] bg-amber-500/10 border border-amber-500/30 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#10b981] bg-[#0c0c0e] border-[rgba(228,228,231,0.3)] focus:ring-[#10b981]"
            />
            <span className="text-xs text-amber-200 font-medium leading-tight">
              {isBengali
                ? 'আমি নিশ্চিত করছি যে আমি এই টার্গেটটির (Target) মালিক অথবা এটি পরীক্ষা করার জন্য আমার সুস্পষ্ট লিখিত অনুমতি আছে।'
                : 'I confirm that I legally own or have explicit written authorization to test this target.'}
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0c0c0e] border-t border-[rgba(228,228,231,0.1)] flex justify-end gap-3 font-mono text-xs">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-[rgba(228,228,231,0.6)] hover:text-[#e4e4e7] hover:bg-[rgba(228,228,231,0.08)] rounded-[4px] transition-colors"
          >
            {isBengali ? 'বাতিল' : 'CANCEL'}
          </button>
          <button
            onClick={onConfirm}
            disabled={!isChecked}
            className={`px-5 py-2 font-bold rounded-[4px] flex items-center gap-2 transition-all ${
              isChecked
                ? 'bg-[#10b981] hover:bg-emerald-400 text-[#0c0c0e]'
                : 'bg-[rgba(228,228,231,0.1)] text-[rgba(228,228,231,0.3)] cursor-not-allowed'
            }`}
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            {isBengali ? 'অনুমোদন দিন ও চালান' : 'AUTHORIZE & EXECUTE'}
          </button>
        </div>
      </div>
    </div>
  );
};
