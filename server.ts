import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { spawn, execFile } from 'child_process';
import http from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PYTHON_PORT = Number(process.env.PYTHON_CORE_PORT) || 5055;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client as backup / optional direct binding
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Python Core Subprocess Management & IPC Client
// -------------------------------------------------------------
let pyProcess: any = null;
let isPythonProcessAlive = false;

function startPythonCoreServer() {
  try {
    console.log(`[Python Core] Spawning Python AI Core daemon on port ${PYTHON_PORT}...`);
    pyProcess = spawn('python3', ['-m', 'python_core.server', String(PYTHON_PORT)], {
      stdio: ['ignore', 'inherit', 'inherit'],
    });

    pyProcess.on('spawn', () => {
      isPythonProcessAlive = true;
      console.log(`[Python Core] Python process successfully started (PID: ${pyProcess.pid})`);
    });

    pyProcess.on('exit', (code: number, signal: string) => {
      isPythonProcessAlive = false;
      console.warn(`[Python Core] Python process exited with code ${code}, signal ${signal}. Will respawn on demand if needed.`);
    });

    pyProcess.on('error', (err: any) => {
      isPythonProcessAlive = false;
      console.error(`[Python Core] Failed to start Python process:`, err.message);
    });
  } catch (err: any) {
    console.error(`[Python Core] Exception spawning python3:`, err.message);
  }
}

// Helper to make HTTP request to Python Core daemon with timeout
function requestPythonDaemon(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options: http.RequestOptions = {
      hostname: '127.0.0.1',
      port: PYTHON_PORT,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ raw: body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Python daemon request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// CLI fallback if daemon is starting up or temporarily busy
function executePythonCli(cmd: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const payloadStr = JSON.stringify(payload);
    execFile('python3', ['-m', 'python_core.cli', cmd, payloadStr], { timeout: 6000 }, (error, stdout, stderr) => {
      if (error) {
        console.warn(`[Python CLI Fallback] Error running '${cmd}':`, error.message, stderr);
        return reject(error);
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        resolve({ raw: stdout });
      }
    });
  });
}

// Unified call to Python Core: Daemon preferred -> CLI fallback
async function callPythonCore(endpoint: string, cliCommand: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<any> {
  try {
    return await requestPythonDaemon(endpoint, method, data);
  } catch (daemonErr) {
    // Fallback to CLI
    return await executePythonCli(cliCommand, data || {});
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Python AI Core Status endpoint
app.get('/api/python/status', async (req, res) => {
  try {
    const status = await callPythonCore('/status', 'status', 'GET');
    res.json({
      connected: true,
      service: 'Python AI Core',
      port: PYTHON_PORT,
      details: status,
    });
  } catch (err: any) {
    res.json({
      connected: false,
      status: 'NOT CONNECTED',
      service: 'Python AI Core',
      error: 'Python core daemon not currently answering',
      port: PYTHON_PORT,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    pythonAlive: isPythonProcessAlive,
    aiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// AI Chat endpoint routed directly to Python AI Core
app.post('/api/chat', async (req, res) => {
  const { messages, language = 'auto', responseMode = 'normal', systemPromptCustom, provider } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const pyResponse = await callPythonCore('/chat', 'chat', 'POST', {
      messages,
      language,
      responseMode,
      systemPromptCustom,
      provider,
    });
    return res.json(pyResponse);
  } catch (err: any) {
    console.error('Python Chat call failed, using internal failover:', err.message);
    const lastMsg = messages[messages.length - 1]?.content || '';
    const isBengali = /[\u0980-\u09FF]/.test(lastMsg) || language === 'bn';

    return res.json({
      reply: isBengali
        ? `**[এথিক্যাল সিকিউরিটি এআই সহকারী]**\n\nআপনার বার্তা: "${lastMsg}"\n\nসাইবার সিকিউরিটি শিক্ষা ও ল্যাব নির্দেশিকা:\n- **টুল সাজেশন**: Nmap, Wireshark, Gobuster, Lynis\n- **কমান্ড উদাহরণ**: \`nmap -sV -p 80,443 127.0.0.1\`\n- **স্কোপ**: শুধুমাত্র নিজস্ব ল্যাব বা লোকালহোস্টে পরীক্ষা করুন।`
        : `**[Ethical Security AI Assistant]**\n\nRegarding: "${lastMsg}"\n\nFor authorized cybersecurity research:\n- **Recommended Tool**: Check the Tool Catalog for Nmap, Wireshark, Gobuster, or Lynis.\n- **Safe Diagnostic Command**: \`nmap -sV -p 80,443 127.0.0.1\`\n- **Scope**: Ensure target scope adheres to LOCALHOST or AUTHORIZED_LAB.`,
      provider: 'local_engine',
    });
  }
});

// AI Result Analyzer endpoint routed to Python AI Core
app.post('/api/analyze', async (req, res) => {
  const { output, toolName, target, language = 'auto', useLLM = false } = req.body;

  if (!output) {
    return res.status(400).json({ error: 'Output text is required for analysis' });
  }

  try {
    const pyAnalysis = await callPythonCore('/analyze', 'analyze', 'POST', {
      output,
      toolName,
      target,
      language,
      useLLM,
    });
    return res.json(pyAnalysis);
  } catch (err: any) {
    console.error('Python Analyzer failed:', err.message);
    return res.status(500).json({ error: 'Analysis failed in Python AI Core', details: err.message });
  }
});

// Pre-Execution Tool Validation endpoint routed to Python AI Core
app.post('/api/validate', async (req, res) => {
  try {
    const val = await callPythonCore('/validate', 'validate', 'POST', req.body);
    res.json(val);
  } catch (err: any) {
    res.status(500).json({ allowed: false, status: 'ERROR', reason: err.message });
  }
});

// Approved Tool Execution endpoint routed to Python AI Core
app.post('/api/execute', async (req, res) => {
  try {
    const execResult = await callPythonCore('/execute', 'execute', 'POST', req.body);
    res.json(execResult);
  } catch (err: any) {
    res.status(500).json({ allowed: false, status: 'ERROR', reason: err.message });
  }
});

// Tool Catalog endpoint from Python Tool Registry
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await callPythonCore('/tools', 'tools', 'GET');
    res.json(tools);
  } catch (err: any) {
    res.json({ tools: [], total: 0, error: err.message });
  }
});

// Labs Catalog endpoint from Python Lab Manager
app.get('/api/labs', async (req, res) => {
  try {
    const labs = await callPythonCore('/labs', 'labs', 'GET');
    res.json(labs);
  } catch (err: any) {
    res.json({ labs: [], total: 0, error: err.message });
  }
});

// Audit log endpoint from Python Audit Logger
app.get('/api/audit', async (req, res) => {
  try {
    const audit = await callPythonCore('/audit', 'audit', 'GET');
    res.json(audit);
  } catch (err: any) {
    res.json({ events: [], total: 0 });
  }
});

// Termux Bridge Status endpoint
app.get('/api/termux/status', async (req, res) => {
  try {
    const status = await callPythonCore('/termux/status', 'termux_status', 'GET');
    res.json(status);
  } catch (err: any) {
    res.json({
      connected: false,
      status: 'DISCONNECTED',
      message: 'Termux Bridge daemon is not running on localhost:8080.',
      supportedExecutors: ['safe_simulation', 'docker_lab', 'termux_bridge_future'],
    });
  }
});

// Vite Middleware for dev / static for prod
async function startServer() {
  // Start Python Core Daemon
  startPythonCoreServer();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ethical Security AI Server] Frontend/API running on http://0.0.0.0:${PORT}`);
  });

  const cleanup = () => {
    console.log('Shutting down server and Python AI Core...');
    if (pyProcess) {
      try {
        pyProcess.kill();
      } catch (e) {}
    }
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

startServer();
