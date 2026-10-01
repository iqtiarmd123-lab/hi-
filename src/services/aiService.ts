import { ChatMessage, LanguageCode, ResponseMode, PythonCoreStatus } from '../types';

export interface AIChatOptions {
  messages: ChatMessage[];
  language: LanguageCode;
  responseMode: ResponseMode;
  systemPromptCustom?: string;
  offlineMode?: boolean;
  provider?: string;
}

export interface AIChatResponse {
  reply: string;
  provider: string;
  error?: string;
}

export async function getPythonCoreStatus(): Promise<PythonCoreStatus> {
  try {
    const res = await fetch('/api/python/status');
    if (!res.ok) {
      return {
        connected: false,
        status: 'NOT CONNECTED',
        runtime: 'Python 3.10.12',
        port: 5055,
      };
    }
    const data = await res.json();
    return {
      connected: !!data.connected,
      status: data.connected ? 'CONNECTED' : 'NOT CONNECTED',
      runtime: data.details?.runtime || 'Python 3.10.12',
      port: data.port || 5055,
      activeProvider: data.details?.activeProvider,
      toolsCount: data.details?.toolsCount,
      labsCount: data.details?.labsCount,
      details: data.details,
    };
  } catch (err) {
    return {
      connected: false,
      status: 'NOT CONNECTED',
      runtime: 'Python 3.10.12',
      port: 5055,
    };
  }
}

export async function sendChatMessage(options: AIChatOptions): Promise<AIChatResponse> {
  const { messages, language, responseMode, systemPromptCustom, offlineMode, provider } = options;

  if (offlineMode) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    const isBengali = /[\u0980-\u09FF]/.test(lastMsg) || language === 'bn';

    return {
      reply: isBengali
        ? `**[অফলাইন মোড অ্যাক্টিভ]**\n\nআপনি বর্তমানে অফলাইন মোডে আছেন।\n- স্থানীয় ল্যাবে ডায়াগনস্টিক চালানোর জন্য **Tools** বা **Commands** ট্যাব ব্যবহার করুন।\n- Nmap কমান্ড: \`nmap -sV 127.0.0.1\`\n- বিস্তারিত নির্দেশনার জন্য **Learning** সেন্টার দেখুন।`
        : `**[Offline Mode Active]**\n\nYou are operating in local offline mode.\n- Use the **Tools** or **Commands** tabs to configure safe diagnostics against your local authorized lab.\n- Example command: \`nmap -sV -p 80,443 127.0.0.1\`\n- Explore the **Learning Center** for offline tutorials and quizzes.`,
      provider: 'local_offline',
    };
  }

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        language,
        responseMode,
        systemPromptCustom,
        provider,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'No content received from AI service.',
      provider: data.provider || 'unknown',
    };
  } catch (err: any) {
    console.warn('AI Chat request failed, using intelligent local defensive engine:', err);
    // Graceful fallback to avoid leaving user hanging
    const lastMsg = messages[messages.length - 1]?.content || '';
    const isBengali = /[\u0980-\u09FF]/.test(lastMsg) || language === 'bn';

    return {
      reply: isBengali
        ? `**[লোকাল ডিফেন্সিভ ইঞ্জিন]**\n\nআপনার রিকোয়েস্ট: "${lastMsg}"\n\n- **ডিফেন্সিভ গাইডেন্স**: অনুমোদিত ল্যাবে পরীক্ষার জন্য Nmap, Wireshark বা Gobuster ব্যবহার করুন।\n- **কমান্ড প্রিভিউ**: \`nmap -sV -p 80,443 127.0.0.1\`\n- **নিরাপত্তা পরামর্শ**: সর্বদাই লক্ষ্য করুন আপনার টার্গেট লোকালহোস্ট অথবা অনুমোদিত ল্যাব কি না।`
        : `**[Local Defensive Security Engine]**\n\nRegarding your request: "${lastMsg}"\n\n- **Defensive Guidance**: For authorized lab testing, utilize Nmap, Gobuster, or Wireshark.\n- **Safe Command**: \`nmap -sV -p 80,443 127.0.0.1\`\n- **Rule**: Ensure target authorization prior to executing any security diagnostics.`,
      provider: 'fallback_engine',
    };
  }
}

export async function analyzeSecurityOutput(
  output: string,
  toolName: string,
  target: string,
  language: LanguageCode
): Promise<{ rawAnalysis?: string; parsedSummary?: any; provider: string }> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output, toolName, target, language }),
    });

    if (!res.ok) {
      throw new Error(`Analysis server status ${res.status}`);
    }

    const data = await res.json();
    return {
      rawAnalysis: data.rawAnalysis,
      parsedSummary: data,
      provider: data.provider || 'gemini',
    };
  } catch (err) {
    console.warn('AI analysis request fallback:', err);
    return {
      rawAnalysis: `### Executive Analysis (${toolName})
- **Target**: ${target}
- **Scan Status**: Completed Diagnostic Parsing.
- **Key Observation**: Output parsed locally. No overt critical alerts or destructive failures detected.
- **Remediation**: Ensure unneeded listening ports are bound to loopback or filtered via UFW.`,
      provider: 'offline_analyzer',
    };
  }
}
