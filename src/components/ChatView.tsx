import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Terminal,
  Play,
  Shield,
  Search,
  Sparkles,
  Info,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage, UserSettings, ResponseMode, LanguageCode } from '../types';
import { sendChatMessage } from '../services/aiService';

interface ChatViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRunCommand: (commandStr: string, toolId?: string) => void;
  language: LanguageCode;
}

export const ChatView: React.FC<ChatViewProps> = ({
  settings,
  onUpdateSettings,
  onRunCommand,
  language,
}) => {
  const isBengali = language === 'bn';

  const defaultMessages: ChatMessage[] = [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: isBengali
        ? `স্বাগতম! আমি আপনার **এথিক্যাল সিকিউরিটি এআই সহকারী** (Ethical Security AI Assistant)।\n\nআমি আপনাকে সাইবার সিকিউরিটি শিক্ষা, ডিফেন্সিভ হার্ডেনিং, এনম্যাপ কমান্ড প্রস্তুতকরণ, লগ অ্যানালাইসিস এবং অনুমোদিত ল্যাব ব্যবস্থাপনায় সহায়তা করতে পারি।\n\n- আপনি বাংলায় বা ইংরেজিতে প্রশ্ন করতে পারেন।\n- সকল কমান্ড এবং কোড প্রমিত ইংরেজিতে থাকবে।\n- **নতুন ভয়েস কমান্ড**: মাইক্রোফোন বাটনে ক্লিক করে সরাসরি কথা বলুন!`
        : `Welcome! I am your **Ethical Security AI Assistant**.\n\nI can assist you with cybersecurity learning, defensive system hardening, building safe Nmap commands, analyzing security logs, and managing authorized labs (DVWA, Juice Shop, etc.).\n\n- Feel free to ask questions in English or Bengali (বাংলা).\n- All commands, code, and tool configurations are maintained strictly in English.\n- **Voice Recognition Enabled**: Tap the microphone icon to speak security queries or commands!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ethical_security_chat_history');
      return saved ? JSON.parse(saved) : defaultMessages;
    } catch {
      return defaultMessages;
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------
  // Web Speech API: Speech Recognition State & Refs
  // -------------------------------------------------------------
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechLang, setSpeechLang] = useState<'bn-BD' | 'en-US'>(isBengali ? 'bn-BD' : 'en-US');
  const [liveInterim, setLiveInterim] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Web Speech API: Text-to-Speech (SpeechSynthesis)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Sync speech language when interface language changes
  useEffect(() => {
    setSpeechLang(isBengali ? 'bn-BD' : 'en-US');
  }, [isBengali]);

  useEffect(() => {
    try {
      localStorage.setItem('ethical_security_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up speech recognition & synthesis on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // -------------------------------------------------------------
  // Speech Recognition Control Functions
  // -------------------------------------------------------------
  const startListening = () => {
    setSpeechError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        isBengali
          ? 'আপনার ব্রাউজারে Web Speech API সমর্থিত নয়। Chrome, Edge বা Safari ব্যবহার করুন।'
          : 'Web Speech API is not supported in this browser. Try Chrome, Edge, or Safari.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += text;
          } else {
            interim += text;
          }
        }

        if (finalChunk) {
          const trimmedFinal = finalChunk.trim();

          // Check for quick voice commands
          const lowerCmd = trimmedFinal.toLowerCase();
          if (
            lowerCmd === 'clear chat' ||
            lowerCmd === 'clear history' ||
            trimmedFinal === 'চ্যাট মুছুন'
          ) {
            handleClear();
            stopListening();
            return;
          }

          setInput((prev) => {
            const separator = prev && !prev.endsWith(' ') ? ' ' : '';
            return prev + separator + trimmedFinal;
          });
          setLiveInterim('');
        } else {
          setLiveInterim(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError(
            isBengali
              ? 'মাইক্রোফোনের অনুমতি প্রদান করা হয়নি। অনুগ্রহ করে ব্রাউজার সেটিংসে অনুমতি দিন।'
              : 'Microphone access denied. Please grant microphone permissions in browser.'
          );
        } else if (event.error === 'no-speech') {
          // Silent timeout
        } else if (event.error === 'network') {
          setSpeechError(
            isBengali
              ? 'নেটওয়ার্ক সংযোগের কারণে ভয়েস রিকগনিশন ব্যর্থ হয়েছে।'
              : 'Voice recognition network error.'
          );
        } else {
          setSpeechError(
            isBengali ? `ভয়েস সনাক্তকরণ ত্রুটি: ${event.error}` : `Speech error: ${event.error}`
          );
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setLiveInterim('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError(err.message || 'Failed to initialize microphone.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        recognitionRef.current.abort();
      }
    }
    setIsListening(false);
    setLiveInterim('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeechLang = () => {
    const nextLang = speechLang === 'bn-BD' ? 'en-US' : 'bn-BD';
    setSpeechLang(nextLang);
    if (isListening) {
      stopListening();
      setTimeout(() => {
        // Will restart with new lang
        setSpeechLang(nextLang);
      }, 100);
    }
  };

  // -------------------------------------------------------------
  // Text-To-Speech (TTS) Read Aloud Handler
  // -------------------------------------------------------------
  const handleToggleSpeak = (messageId: string, content: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text from markdown syntax, code snippets, and symbols for natural audio readout
    const cleanText = content
      .replace(/```[\s\S]*?```/g, ' [Code snippet] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#>-]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const hasBengaliCharacters = /[\u0980-\u09FF]/.test(cleanText);
    utterance.lang = hasBengaliCharacters ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // -------------------------------------------------------------
  // Suggestions & Handlers
  // -------------------------------------------------------------
  const promptSuggestions = isBengali
    ? [
        'Nmap এর -sV এবং -sT ফ্ল্যাগের পার্থক্য কী?',
        'আমার লোকালহোস্টে ৩০০০ পোর্ট ওপেন, এটা কীভাবে সিকিউর করব?',
        'TCP 3-Way Handshake কীভাবে কাজ করে সহজ ভাষায় বুঝিয়ে বলো।',
        'DVWA ল্যাবের জন্য একটি নিরাপদ ডিরেক্টরি স্ক্যান কমান্ড দাও।',
        'এসকিউএল ইনজেকশন প্রতিরোধের সেরা উপায় কী?',
      ]
    : [
        'Explain the difference between Nmap -sV and -sT flags.',
        'How do I secure an open port 3000 on my localhost?',
        'Explain the TCP 3-Way Handshake step by step.',
        'Build a safe Nmap command for my authorized lab.',
        'What is the primary defensive fix for SQL Injection?',
      ];

  const handleSend = async (textToSend?: string) => {
    if (isListening) {
      stopListening();
    }

    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLiveInterim('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        messages: newMessages,
        language: settings.language,
        responseMode: settings.responseStyle,
        offlineMode: settings.offlineMode,
        provider: settings.aiProvider,
      });

      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'assistant',
        content: isBengali
          ? 'দুঃখিত, সংযোগে ত্রুটি ঘটেছে। লোকাল নিরাপত্তা ইঞ্জিন ব্যবহার করে পুনরায় চেষ্টা করুন।'
          : 'Apologies, a communication error occurred. The local defensive security engine is available.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
    setMessages([defaultMessages[0]]);
    localStorage.removeItem('ethical_security_chat_history');
  };

  const handleExport = () => {
    const markdown = messages
      .map(
        (m) =>
          `### ${m.role === 'user' ? 'User' : 'Ethical Security Assistant'} (${m.timestamp})\n\n${
            m.content
          }\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_chat_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper to extract shell commands from message content
  const extractCommands = (content: string): string[] => {
    const codeBlockRegex = /```(?:bash|sh|zsh)?\n([\s\S]*?)```/g;
    const commands: string[] = [];
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const lines = match[1].trim().split('\n');
      lines.forEach((line) => {
        const clean = line.replace(/^\$\s*/, '').trim();
        if (
          clean &&
          !clean.startsWith('#') &&
          (clean.startsWith('nmap') ||
            clean.startsWith('ping') ||
            clean.startsWith('traceroute') ||
            clean.startsWith('gobuster') ||
            clean.startsWith('curl') ||
            clean.startsWith('tshark') ||
            clean.startsWith('openssl') ||
            clean.startsWith('nikto') ||
            clean.startsWith('lynis') ||
            clean.startsWith('whois') ||
            clean.startsWith('docker'))
        ) {
          commands.push(clean);
        }
      });
    }
    return commands;
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)] max-w-5xl mx-auto">
      {/* Chat Sub-Header Controls */}
      <div className="flex items-center justify-between gap-2 p-2 sm:p-3 bg-[#111113] rounded-[4px] border border-[rgba(228,228,231,0.1)] mb-3 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[3px] bg-[#10b981] text-[#0c0c0e] flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-syne font-bold text-xs sm:text-sm text-[#e4e4e7]">
                {isBengali ? 'এআই নিরাপত্তা বিশেষজ্ঞ' : 'AI Security Assistant'}
              </span>
              <span className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono bg-[#0c0c0e] text-[#10b981] border border-[rgba(228,228,231,0.15)] hidden sm:inline-block">
                {settings.aiModel}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-[rgba(228,228,231,0.45)]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse-subtle" />
                {settings.offlineMode ? 'Local Engine' : 'Online'}
              </span>
              <span>·</span>
              <span>Scope: {settings.targetScope}</span>
            </div>
          </div>
        </div>

        {/* Response Mode Selector */}
        <div className="flex items-center gap-1.5">
          <label className="text-[11px] font-mono text-[rgba(228,228,231,0.5)] hidden md:block uppercase">
            {isBengali ? 'মোড:' : 'Mode:'}
          </label>
          <select
            value={settings.responseStyle}
            onChange={(e) => onUpdateSettings({ responseStyle: e.target.value as ResponseMode })}
            className="bg-[#0c0c0e] border border-[rgba(228,228,231,0.15)] rounded-[3px] px-2 py-1 text-xs text-[#e4e4e7] font-mono focus:outline-none focus:border-[#10b981]"
          >
            <option value="beginner">Beginner (সহজ)</option>
            <option value="normal">Normal (প্রমিত)</option>
            <option value="advanced">Advanced (উন্নত)</option>
            <option value="expert">Expert (গভীর)</option>
          </select>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-1.5">
          <div className="relative hidden sm:block">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[rgba(228,228,231,0.4)]" />
            <input
              type="text"
              placeholder={isBengali ? 'মেসেজ খুঁজুন...' : 'Search chat...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0c0c0e] border border-[rgba(228,228,231,0.15)] rounded-[3px] pl-8 pr-2.5 py-1 text-xs text-[#e4e4e7] w-32 focus:w-44 transition-all focus:outline-none focus:border-[#10b981] font-mono"
            />
          </div>

          <button
            onClick={handleExport}
            className="p-1.5 rounded-[3px] hover:bg-[rgba(228,228,231,0.08)] text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7] text-xs flex items-center gap-1"
            title="Export conversation as Markdown"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-[3px] hover:bg-[rgba(228,228,231,0.08)] text-[rgba(228,228,231,0.5)] hover:text-red-400 text-xs flex items-center gap-1"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2 pb-4">
        {filteredMessages.map((msg) => {
          const isUser = msg.role === 'user';
          const commands = !isUser ? extractCommands(msg.content) : [];
          const isSpeakingThis = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-[3px] bg-[#10b981] text-[#0c0c0e] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-2xl rounded-[4px] p-4 space-y-2 leading-relaxed ${
                  isUser
                    ? 'bg-[#10b981] text-[#0c0c0e] font-medium'
                    : 'bg-[#111113] border border-[rgba(228,228,231,0.1)] text-[#e4e4e7] shadow-sm'
                } ${msg.isError ? 'border-red-500/50 bg-[#180a0a] text-red-200' : ''}`}
              >
                {/* Message Header */}
                <div className={`flex items-center justify-between gap-2 text-[10px] mb-1 border-b pb-1 font-mono ${
                  isUser ? 'border-[rgba(12,12,14,0.2)] text-[#0c0c0e]/80' : 'border-[rgba(228,228,231,0.08)] text-[rgba(228,228,231,0.45)]'
                }`}>
                  <span className={isUser ? 'text-[#0c0c0e] font-bold' : 'text-[#10b981] font-semibold'}>
                    {isUser ? 'OPERATOR' : 'ETHICAL ASSISTANT'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.provider && (
                      <span className="font-mono text-[9px] uppercase px-1 rounded-[2px] bg-[#0c0c0e] text-[#10b981] border border-[rgba(228,228,231,0.1)]">
                        {msg.provider}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>

                    {/* Text-To-Speech Listen Button */}
                    {!isUser && 'speechSynthesis' in window && (
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        className={`p-0.5 transition-colors ${
                          isSpeakingThis
                            ? 'text-[#10b981] animate-pulse'
                            : 'text-[rgba(228,228,231,0.5)] hover:text-[#e4e4e7]'
                        }`}
                        title={
                          isSpeakingThis
                            ? isBengali
                              ? 'পড়া বন্ধ করুন'
                              : 'Stop speaking'
                            : isBengali
                            ? 'ভয়েসে শুনুন'
                            : 'Read aloud (TTS)'
                        }
                      >
                        {isSpeakingThis ? (
                          <VolumeX className="w-3.5 h-3.5" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white p-0.5"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-[#10b981]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Message Content formatted */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {msg.content}
                </div>

                {/* Action Cards for detected executable commands */}
                {commands.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#10b981] block">
                      {isBengali ? 'সনাক্তকৃত কমান্ড অ্যাকশন:' : 'COMMAND ACTION CARDS:'}
                    </span>
                    {commands.map((cmd, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-[3px] bg-[#0c0c0e] border border-[rgba(228,228,231,0.1)] flex flex-wrap items-center justify-between gap-2"
                      >
                        <code className="text-xs font-mono text-[#10b981] break-all">{cmd}</code>
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => handleCopy('cmd_' + i, cmd)}
                            className="px-2 py-1 bg-[#111113] hover:bg-zinc-800 text-[rgba(228,228,231,0.8)] text-[11px] font-mono rounded-[2px] flex items-center gap-1 border border-[rgba(228,228,231,0.1)]"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={() => onRunCommand(cmd)}
                            className="px-2.5 py-1 bg-[#10b981]/15 hover:bg-[#10b981]/25 text-[#10b981] border border-[#10b981]/40 text-[11px] font-mono rounded-[2px] font-medium flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>{isBengali ? 'ল্যাবে চালান' : 'Run in Lab'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-[3px] bg-[#111113] border border-[rgba(228,228,231,0.15)] text-[#e4e4e7] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 text-xs sm:text-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{isBengali ? 'এআই চিন্তা করছে ও উত্তর প্রস্তুত করছে...' : 'Analyzing security query...'}</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length <= 3 && !isListening && (
        <div className="py-2 overflow-x-auto flex gap-2 shrink-0 no-scrollbar">
          {promptSuggestions.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSend(item)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:text-emerald-300 text-zinc-400 transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}

      {/* Live Voice Recording HUD Panel */}
      {isListening && (
        <div className="mb-2 p-3 bg-[#111113] border border-red-500/50 rounded-[4px] animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-5 h-5">
                <span className="absolute w-full h-full rounded-full bg-red-500/30 animate-ping" />
                <Radio className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase">
                {isBengali ? 'ভয়েস শুনছি...' : 'LISTENING TO VOICE QUERY...'}
              </span>
              {/* Equalizer animation bars */}
              <div className="flex items-center gap-1 ml-2">
                <span className="w-0.5 h-3 bg-red-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-0.5 h-4 bg-red-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-0.5 h-2 bg-red-400 animate-bounce [animation-delay:-0.45s]" />
                <span className="w-0.5 h-4 bg-[#10b981] animate-bounce [animation-delay:-0.2s]" />
                <span className="w-0.5 h-3 bg-[#10b981] animate-bounce" />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice recognition language switch */}
              <button
                type="button"
                onClick={toggleSpeechLang}
                className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-bold bg-[#0c0c0e] hover:bg-zinc-800 text-[#e4e4e7] border border-[rgba(228,228,231,0.2)] transition-colors"
                title="Toggle Voice Recognition Language (Bengali / English)"
              >
                {speechLang === 'bn-BD' ? 'বাংলা (BD)' : 'English (US)'}
              </button>
              <button
                type="button"
                onClick={stopListening}
                className="px-2.5 py-0.5 rounded-[2px] bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-mono uppercase transition-colors"
              >
                {isBengali ? 'থামুন' : 'STOP'}
              </button>
            </div>
          </div>

          {/* Live text transcription preview */}
          <div className="bg-[#0c0c0e] border border-[rgba(228,228,231,0.1)] rounded-[3px] p-2.5 text-xs font-mono text-[#e4e4e7] min-h-[36px] flex items-center">
            {liveInterim || input ? (
              <p className="break-words">
                <span className="text-[rgba(228,228,231,0.9)]">{input}</span>{' '}
                <span className="text-[#10b981] italic underline decoration-dotted">
                  {liveInterim}
                </span>
              </p>
            ) : (
              <p className="text-[rgba(228,228,231,0.4)] italic">
                {speechLang === 'bn-BD'
                  ? 'কথা বলুন... যেমন: "এনম্যাপ দিয়ে স্ক্যান করার নিয়ম কী?"'
                  : 'Speak now... e.g. "Explain the TCP handshake" or "How to run Nmap in Termux?"'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 p-2.5 bg-red-950/40 border border-red-500/40 rounded-[3px] flex items-center justify-between text-xs text-red-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-[rgba(228,228,231,0.5)] hover:text-white text-[10px] ml-2 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="pt-2 border-t border-[rgba(228,228,231,0.1)] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-[#111113] border border-[rgba(228,228,231,0.15)] rounded-[4px] p-2 focus-within:border-[#10b981] transition-colors"
        >
          <input
            type="text"
            placeholder={
              isListening
                ? isBengali
                  ? 'শুনছি... কথা বলুন অথবা টাইপ করুন...'
                  : 'Listening... speak your security query...'
                : isBengali
                ? 'সাইবার সিকিউরিটি বা কমান্ড সম্পর্কে জিজ্ঞাসা করুন...'
                : 'Ask a cybersecurity question or request a command...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-[#e4e4e7] placeholder-[rgba(228,228,231,0.4)] focus:outline-none font-sans"
          />

          {/* Voice Microphone Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-[3px] transition-all relative flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse'
                  : 'bg-[#0c0c0e] hover:bg-zinc-800 text-[rgba(228,228,231,0.7)] hover:text-[#10b981] border border-[rgba(228,228,231,0.1)]'
              }`}
              title={
                isListening
                  ? isBengali
                    ? 'ভয়েস রেকর্ডিং বন্ধ করুন'
                    : 'Stop Voice Input'
                  : isBengali
                  ? `ভয়েস ইনপুট শুরু করুন (${speechLang === 'bn-BD' ? 'বাংলা' : 'EN'})`
                  : `Start Voice Command (${speechLang === 'bn-BD' ? 'Bengali' : 'English'})`
              }
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-[3px] transition-all cursor-pointer ${
              input.trim() && !isLoading
                ? 'bg-[#10b981] text-[#0c0c0e] hover:bg-emerald-400 font-bold'
                : 'bg-[rgba(228,228,231,0.08)] text-[rgba(228,228,231,0.3)] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-[rgba(228,228,231,0.45)] mt-1.5 px-2 font-mono">
          <span>
            {isBengali
              ? 'শুধুমাত্র অনুমোদিত ল্যাব ও ডিফেন্সিভ সিকিউরিটি বিশ্লেষণের জন্য।'
              : 'For authorized security learning & defensive research only.'}
          </span>
          {speechSupported && (
            <span className="hidden sm:inline text-[#10b981]">
              {isBengali ? 'ওয়েব স্পিচ এপিআই সক্রিয়' : 'Web Speech API Active'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
