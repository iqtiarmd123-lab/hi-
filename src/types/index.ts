export type TargetScope =
  | 'LOCALHOST'
  | 'PRIVATE_NETWORK'
  | 'AUTHORIZED_LAB'
  | 'USER_AUTHORIZED_TARGET';

export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ResponseMode = 'beginner' | 'normal' | 'advanced' | 'expert';

export type LanguageCode = 'auto' | 'en' | 'bn';

export type ToolPlatform = 'linux' | 'android' | 'multi' | 'docker';

export type ToolAvailability =
  | 'AVAILABLE'
  | 'NOT_INSTALLED'
  | 'NOT_SUPPORTED'
  | 'DISABLED'
  | 'REQUIRES_CONFIGURATION'
  | 'REQUIRES_TERMUX'
  | 'DOCUMENTATION_ONLY'
  | 'EXTERNAL_APPLICATION';

export type ExecutorType =
  | 'safe_simulation'
  | 'termux_bridge'
  | 'docker_lab'
  | 'doc_only';

export interface ToolParameter {
  name: string;
  flag: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  descriptionBn?: string;
  defaultValue?: string | number | boolean;
  options?: string[];
  required?: boolean;
}

export interface ToolExample {
  title: string;
  command: string;
  description: string;
  descriptionBn?: string;
  expectedOutput: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: string;
  categoryLetter: string; // 'A' through 'Z'
  description: string;
  descriptionBn?: string;
  purpose: string;
  platform: ToolPlatform;
  version: string;
  installMethod: string;
  termuxInstallCommand?: string;
  debianInstallCommand?: string;
  versionCommand: string;
  helpCommand: string;
  parameters: ToolParameter[];
  examples: ToolExample[];
  riskLevel: RiskLevel;
  minPermissionRequired: number; // 0-100
  requiresAuthorization: boolean;
  requiresConfirmation: boolean;
  supportsDryRun: boolean;
  supportsAnalysis: boolean;
  documentationUrl: string;
  enabled: boolean;
  installed: boolean;
  available: ToolAvailability;
  executorType: ExecutorType;
  supportedScopes: TargetScope[];
}

export interface ToolRequest {
  id: string;
  toolId: string;
  command: string;
  target: string;
  scope: TargetScope;
  parameters: Record<string, any>;
  timestamp: string;
  status:
    | 'PENDING_VALIDATION'
    | 'VALIDATED'
    | 'AWAITING_CONFIRMATION'
    | 'EXECUTING'
    | 'COMPLETED'
    | 'BLOCKED'
    | 'ERROR';
  blockReason?: string;
  confirmed?: boolean;
}

export interface ToolResult {
  id: string;
  requestId: string;
  toolId: string;
  toolName: string;
  command: string;
  target: string;
  scope: TargetScope;
  timestamp: string;
  executionTimeMs: number;
  stdout: string;
  stderr: string;
  exitCode: number;
  isSimulation: boolean;
  executor: ExecutorType;
  parsedData?: Record<string, any>;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  toolId: string;
  toolName: string;
  target: string;
  scope: TargetScope;
  actionCount: number;
  permissionLevel: number;
  resultStatus: 'SUCCESS' | 'BLOCKED' | 'ERROR' | 'SIMULATED';
  details?: string;
}

export interface PythonCoreStatus {
  connected: boolean;
  status: 'CONNECTED' | 'NOT CONNECTED' | 'CHECKING';
  runtime: string;
  port: number;
  activeProvider?: string;
  toolsCount?: number;
  labsCount?: number;
  details?: any;
}

export interface UserSettings {
  aiProvider: 'gemini' | 'openai' | 'local' | 'mock';
  aiModel: string;
  language: LanguageCode;
  responseStyle: ResponseMode;
  temperature: number;
  permissionLevel: number; // 0 - 100
  maxActions: number; // e.g. 10
  actionsUsed: number;
  targetScope: TargetScope;
  activeTarget: string;
  isTargetAuthorized: boolean;
  requireConfirmationForScans: boolean;
  termuxBridge: {
    connected: boolean;
    host: string;
    port: number;
    token?: string;
    status: 'DISCONNECTED' | 'CONNECTED' | 'ERROR';
  };
  pythonCore?: PythonCoreStatus;
  offlineMode: boolean;
  theme: 'dark' | 'light';
  favorites: {
    tools: string[];
    commands: string[];
    lessons: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolRequest?: ToolRequest;
  toolResult?: ToolResult;
  isError?: boolean;
  provider?: string;
}

export interface WorkflowNode {
  id: string;
  toolId: string;
  name: string;
  parameters: Record<string, any>;
  timeoutSec: number;
  actionCost: number;
  permissionRequired: number;
  confirmationRequired: boolean;
  stopOnError: boolean;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'SKIPPED' | 'FAILED';
  result?: ToolResult;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  target: string;
  scope: TargetScope;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'STOPPED_ERROR' | 'ACTION_LIMIT_REACHED';
}

export interface QuizQuestion {
  question: string;
  questionBn?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationBn?: string;
}

export interface LearningLesson {
  id: string;
  courseId: string;
  title: string;
  titleBn?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  readTimeMin: number;
  summary: string;
  summaryBn?: string;
  content: string;
  contentBn?: string;
  commandExamples: {
    command: string;
    description: string;
    descriptionBn?: string;
  }[];
  quiz: QuizQuestion[];
  safeExercise: {
    objective: string;
    objectiveBn?: string;
    hint: string;
    solution: string;
  };
  glossary: {
    term: string;
    definition: string;
    definitionBn?: string;
  }[];
}

export interface LearningCourse {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  icon: string;
  description: string;
  descriptionBn: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons: LearningLesson[];
  completedLessonIds: string[];
}

export interface Lab {
  id: string;
  name: string;
  type: 'web_vuln' | 'network' | 'phishing_awareness' | 'ctf' | 'docker';
  description: string;
  descriptionBn?: string;
  targetHost: string;
  targetPort: number;
  network: string;
  status: 'IDLE' | 'RUNNING' | 'STOPPED';
  dockerCommand?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tasks: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    verificationTool?: string;
  }[];
}

export interface SecurityReport {
  id: string;
  title: string;
  date: string;
  target: string;
  scope: TargetScope;
  executiveSummary: string;
  authorizationStatement: string;
  toolsUsed: string[];
  findings: {
    title: string;
    severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    target: string;
    evidence: string;
    technicalDetails: string;
    remediation: string;
    cve?: string;
  }[];
  timeline: {
    time: string;
    event: string;
  }[];
}
