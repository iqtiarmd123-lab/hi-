import { TargetScope, ToolDefinition, UserSettings, AuditEvent, ToolRequest } from '../types';

export interface ValidationResult {
  allowed: boolean;
  code?:
    | 'VALIDATED'
    | 'INVALID_TARGET'
    | 'UNAUTHORIZED_SCOPE'
    | 'PERMISSION_LIMIT'
    | 'ACTION_LIMIT'
    | 'REQUIRES_CONFIRMATION'
    | 'PROHIBITED_COMMAND'
    | 'TOOL_NOT_INSTALLED';
  message: string;
  messageBn?: string;
  requiresModalConfirmation?: boolean;
}

// Check if IP is within private RFC 1918 or link-local range
export function isPrivateIp(ip: string): boolean {
  const clean = ip.trim();
  if (clean === 'localhost' || clean === '127.0.0.1' || clean === '::1') return true;

  const parts = clean.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return false;

  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.0.0/16 (Link local)
  if (parts[0] === 169 && parts[1] === 254) return true;

  return false;
}

// Detect and classify target scope
export function detectScope(target: string): TargetScope {
  const t = target.toLowerCase().trim();
  if (t === 'localhost' || t === '127.0.0.1' || t === '::1' || t === '0.0.0.0') {
    return 'LOCALHOST';
  }

  if (isPrivateIp(t)) {
    return 'PRIVATE_NETWORK';
  }

  if (
    t.endsWith('.lab') ||
    t.endsWith('.local') ||
    t.endsWith('.test') ||
    t.includes('dvwa') ||
    t.includes('juiceshop') ||
    t.includes('metasploitable') ||
    t.includes('docker')
  ) {
    return 'AUTHORIZED_LAB';
  }

  return 'USER_AUTHORIZED_TARGET';
}

// Core Security Engine Validation
export function validateToolRequest(
  tool: ToolDefinition,
  target: string,
  parameters: Record<string, any>,
  settings: UserSettings,
  userConfirmed: boolean = false
): ValidationResult {
  // 1. Prohibited command / safety check
  const rawParams = JSON.stringify(parameters).toLowerCase();
  const dangerousPatterns = [
    'rm -rf /',
    ':(){ :|:& };:',
    '> /dev/sda',
    'mkfs',
    'drop database',
    'powershell -enc',
    'curl | bash',
    'wget | bash',
    'miner',
    'ransomware',
  ];

  for (const pattern of dangerousPatterns) {
    if (rawParams.includes(pattern)) {
      return {
        allowed: false,
        code: 'PROHIBITED_COMMAND',
        message: `Safety Engine Block: Prohibited destructive payload detected ('${pattern}'). Only defensive and lab diagnostics are permitted.`,
        messageBn: `নিরাপত্তা ইঞ্জিন ব্লক: বিপজ্জনক পে-লোড শনাক্ত হয়েছে ('${pattern}')। শুধুমাত্র ডিফেন্সিভ ও ল্যাব পরীক্ষার অনুমতি আছে।`,
      };
    }
  }

  // 2. Action Limit Check
  if (settings.actionsUsed >= settings.maxActions) {
    return {
      allowed: false,
      code: 'ACTION_LIMIT',
      message: `ACTION LIMIT REACHED: You have used ${settings.actionsUsed} of ${settings.maxActions} planned actions. Workflow stopped to prevent unintended resource consumption.`,
      messageBn: `অ্যাকশন লিমিট শেষ: আপনি ${settings.maxActions} টির মধ্যে ${settings.actionsUsed} টি অ্যাকশন ব্যবহার করেছেন। অপ্রত্যাশিত রিসোর্স ব্যবহার রোধে কার্যক্রম থামানো হয়েছে।`,
    };
  }

  // 3. Permission Level Check (0-100)
  if (settings.permissionLevel < tool.minPermissionRequired) {
    return {
      allowed: false,
      code: 'PERMISSION_LIMIT',
      message: `PERMISSION LEVEL INSUFFICIENT: Tool '${tool.name}' requires permission level ${tool.minPermissionRequired}/100. Current level is ${settings.permissionLevel}/100. Adjust your permission level in HUD or Settings if authorized.`,
      messageBn: `অনুমতি অপর্যাপ্ত: '${tool.name}' টুলের জন্য ${tool.minPermissionRequired}/100 পারমিশন প্রয়োজন। বর্তমান লেভেল ${settings.permissionLevel}/100।`,
    };
  }

  // 4. Target & Scope Validation
  const effectiveScope = detectScope(target);

  // If tool does not support this scope
  if (!tool.supportedScopes.includes(effectiveScope)) {
    return {
      allowed: false,
      code: 'UNAUTHORIZED_SCOPE',
      message: `SCOPE MISMATCH: Tool '${tool.name}' supports scopes [${tool.supportedScopes.join(', ')}], but target '${target}' was classified as '${effectiveScope}'.`,
      messageBn: `টার্গেট স্কোপ অসামঞ্জস্য: '${tool.name}' টুলটি [${tool.supportedScopes.join(', ')}] সাপোর্ট করে, কিন্তু আপনার টার্গেট '${effectiveScope}'।`,
    };
  }

  // If public or user-defined target, verify explicit authorization
  if (effectiveScope === 'USER_AUTHORIZED_TARGET' && !settings.isTargetAuthorized && !userConfirmed) {
    return {
      allowed: false,
      code: 'REQUIRES_CONFIRMATION',
      message: `EXPLICIT AUTHORIZATION REQUIRED: Target '${target}' is an external or non-localhost system. You must explicitly verify ownership or written permission.`,
      messageBn: `স্পষ্ট অনুমোদন আবশ্যক: টার্গেট '${target}' একটি বহিরাগত সিস্টেম। আপনার অনুমতিপত্র বা মালিকানা নিশ্চিত করতে হবে।`,
      requiresModalConfirmation: true,
    };
  }

  // 5. Tool Specific High-Risk Confirmation
  if (tool.requiresConfirmation && !userConfirmed) {
    return {
      allowed: false,
      code: 'REQUIRES_CONFIRMATION',
      message: `CONFIRMATION REQUIRED: Tool '${tool.name}' has risk level '${tool.riskLevel}'. Explicit confirmation is required before execution.`,
      messageBn: `অনুমোদন নিশ্চিতকরণ প্রয়োজন: '${tool.name}' টুলের ঝুঁকি মাত্রা '${tool.riskLevel}'। চালানোর আগে সম্মতি দিন।`,
      requiresModalConfirmation: true,
    };
  }

  return {
    allowed: true,
    code: 'VALIDATED',
    message: `Validation successful. Action authorized under scope ${effectiveScope} and permission level ${settings.permissionLevel}.`,
    messageBn: `ভ্যালিডেশন সফল। স্কোপ ${effectiveScope} এবং পারমিশন লেভেল ${settings.permissionLevel} এর অধীনে অনুমোদন দেওয়া হয়েছে।`,
  };
}

// Audit Logger Helper (Local Storage with privacy guarantee)
const AUDIT_STORAGE_KEY = 'ethical_security_audit_log_v1';

export function getAuditLogs(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const newEvent: AuditEvent = {
    ...event,
    id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = getAuditLogs();
    const updated = [newEvent, ...existing].slice(0, 100); // keep recent 100 events
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Audit log write error:', e);
  }

  return newEvent;
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear audit logs:', e);
  }
}
