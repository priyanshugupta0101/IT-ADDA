import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database In-Memory Cache
interface CampusVibeOption {
  id: string;
  label: string;
  icon: string;
  count: number;
}

interface CampusVibeConfig {
  title: string;
  subtitle: string;
  options: CampusVibeOption[];
}

const DEFAULT_VIBE_CONFIG: CampusVibeConfig = {
  title: "Today's Campus Vibe",
  subtitle: "Tap what describes your study mood today",
  options: [
    { id: 'grind', label: 'Midsem / Exam Grind', icon: '📚', count: 28 },
    { id: 'hack', label: 'Coding & Projects', icon: '💻', count: 19 },
    { id: 'canteen', label: 'Canteen & Chill', icon: '☕', count: 14 },
    { id: 'lab', label: 'Lab Submissions', icon: '⚡', count: 23 },
  ],
};

interface DatabaseState {
  students: any[];
  noteRequests: any[];
  resources: any[];
  notices: any[];
  chatMessages: any[];
  campusStreak?: number;
  campusVibeConfig?: CampusVibeConfig;
  adminCredentials?: { username: string; password: string };
}

let dbState: DatabaseState = {
  students: [],
  noteRequests: [],
  resources: [],
  notices: [],
  chatMessages: [],
  campusStreak: 0,
  campusVibeConfig: DEFAULT_VIBE_CONFIG,
  adminCredentials: { username: 'admin', password: 'admin' },
};

// Load database from file
function loadDatabase(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        students: Array.isArray(parsed.students) ? parsed.students : [],
        noteRequests: Array.isArray(parsed.noteRequests) ? parsed.noteRequests : [],
        resources: Array.isArray(parsed.resources) ? parsed.resources : [],
        notices: Array.isArray(parsed.notices) ? parsed.notices : [],
        chatMessages: Array.isArray(parsed.chatMessages) ? parsed.chatMessages : [],
        campusStreak: typeof parsed.campusStreak === 'number' ? parsed.campusStreak : 0,
        campusVibeConfig: parsed.campusVibeConfig && Array.isArray(parsed.campusVibeConfig.options)
          ? parsed.campusVibeConfig
          : DEFAULT_VIBE_CONFIG,
        adminCredentials: parsed.adminCredentials && parsed.adminCredentials.username
          ? parsed.adminCredentials
          : { username: 'admin', password: 'admin' },
      };
    }
  } catch (err) {
    console.error('Failed to load database.json:', err);
  }
  return {
    students: [],
    noteRequests: [],
    resources: [],
    notices: [],
    chatMessages: [],
    campusStreak: 0,
    campusVibeConfig: DEFAULT_VIBE_CONFIG,
    adminCredentials: { username: 'admin', password: 'admin' },
  };
}

// Save database to disk
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database.json:', err);
  }
}

dbState = loadDatabase();

// SSE Clients Registry
const sseClients = new Set<express.Response>();

function broadcast(event: string, payload: any) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.use(express.json({ limit: '20mb' }));

// CORS headers for flexibility
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// SSE Real-Time Stream
app.get('/api/realtime/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  // Initial handshake
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', timestamp: Date.now() })}\n\n`);
  sseClients.add(res);

  // Keep-alive ping
  const interval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(interval);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
    sseClients.delete(res);
  });
});

// GET entire state
app.get('/api/database', (_req, res) => {
  res.json(dbState);
});

// POST safe bidirectional sync: Never lose student or portal data
app.post('/api/database/sync', (req, res) => {
  const clientData = req.body;
  let hasChanges = false;

  if (Array.isArray(clientData.students)) {
    for (const cStudent of clientData.students) {
      if (!cStudent || !cStudent.id) continue;
      const sIdx = dbState.students.findIndex(
        (s) => s.id === cStudent.id || s.rollNumber === cStudent.rollNumber
      );
      if (sIdx === -1) {
        dbState.students.push(cStudent);
        hasChanges = true;
      }
    }
  }

  if (Array.isArray(clientData.noteRequests)) {
    for (const cReq of clientData.noteRequests) {
      if (!cReq || !cReq.id) continue;
      if (!dbState.noteRequests.some((r) => r.id === cReq.id)) {
        dbState.noteRequests.push(cReq);
        hasChanges = true;
      }
    }
  }

  if (Array.isArray(clientData.resources)) {
    for (const cRes of clientData.resources) {
      if (!cRes || !cRes.id) continue;
      if (!dbState.resources.some((r) => r.id === cRes.id)) {
        dbState.resources.push(cRes);
        hasChanges = true;
      }
    }
  }

  if (Array.isArray(clientData.notices)) {
    for (const cNotice of clientData.notices) {
      if (!cNotice || !cNotice.id) continue;
      if (!dbState.notices.some((n) => n.id === cNotice.id)) {
        dbState.notices.push(cNotice);
        hasChanges = true;
      }
    }
  }

  if (hasChanges) {
    saveDatabase();
    broadcast('DATABASE_SYNCED', { database: dbState });
  }

  res.json({ success: true, database: dbState });
});

// POST register student
app.post('/api/students', (req, res) => {
  const student = req.body;
  if (!student || !student.id) {
    return res.status(400).json({ error: 'Invalid student data' });
  }

  // Prevent duplicate roll number or email
  const existingIdx = dbState.students.findIndex(
    (s) => s.id === student.id || s.rollNumber === student.rollNumber
  );

  if (existingIdx >= 0) {
    dbState.students[existingIdx] = { ...dbState.students[existingIdx], ...student };
  } else {
    dbState.students.unshift(student);
  }

  saveDatabase();
  broadcast('STUDENT_UPDATED', { student, database: dbState });
  res.json({ success: true, student });
});

// PUT update student
app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = dbState.students.findIndex((s) => s.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }

  dbState.students[idx] = { ...dbState.students[idx], ...updates };
  saveDatabase();
  broadcast('STUDENT_UPDATED', { student: dbState.students[idx], database: dbState });
  res.json({ success: true, student: dbState.students[idx] });
});

// DELETE student
app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  dbState.students = dbState.students.filter((s) => s.id !== id);
  saveDatabase();
  broadcast('STUDENT_DELETED', { id, database: dbState });
  res.json({ success: true });
});

// POST notice
app.post('/api/notices', (req, res) => {
  const notice = req.body;
  if (!notice || !notice.id) {
    return res.status(400).json({ error: 'Invalid notice' });
  }

  dbState.notices.unshift(notice);
  saveDatabase();
  broadcast('NOTICE_CREATED', { notice, database: dbState });
  res.json({ success: true, notice });
});

// PUT notice (approve/dismiss)
app.put('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const idx = dbState.notices.findIndex((n) => n.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Notice not found' });
  }

  dbState.notices[idx] = { ...dbState.notices[idx], ...updates };
  saveDatabase();
  broadcast('NOTICE_UPDATED', { notice: dbState.notices[idx], database: dbState });
  res.json({ success: true, notice: dbState.notices[idx] });
});

// DELETE notice
app.delete('/api/notices/:id', (req, res) => {
  const { id } = req.params;
  dbState.notices = dbState.notices.filter((n) => n.id !== id);
  saveDatabase();
  broadcast('NOTICE_DELETED', { id, database: dbState });
  res.json({ success: true });
});

// POST resource
app.post('/api/resources', (req, res) => {
  const resource = req.body;
  if (!resource || !resource.id) {
    return res.status(400).json({ error: 'Invalid resource' });
  }

  dbState.resources.unshift(resource);
  saveDatabase();
  broadcast('RESOURCE_CREATED', { resource, database: dbState });
  res.json({ success: true, resource });
});

// DELETE resource
app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;
  dbState.resources = dbState.resources.filter((r) => r.id !== id);
  saveDatabase();
  broadcast('RESOURCE_DELETED', { id, database: dbState });
  res.json({ success: true });
});

// POST note request
app.post('/api/notes/requests', (req, res) => {
  const noteReq = req.body;
  if (!noteReq || !noteReq.id) {
    return res.status(400).json({ error: 'Invalid note request' });
  }

  dbState.noteRequests.unshift(noteReq);
  saveDatabase();
  broadcast('NOTE_REQUEST_CREATED', { noteRequest: noteReq, database: dbState });
  res.json({ success: true, noteRequest: noteReq });
});

// POST fulfill note request
app.post('/api/notes/fulfill', (req, res) => {
  const { requestId, fulfillment } = req.body;
  const idx = dbState.noteRequests.findIndex((r) => r.id === requestId);

  if (idx === -1) {
    return res.status(404).json({ error: 'Note request not found' });
  }

  const existing = dbState.noteRequests[idx];
  const updatedFulfillments = [fulfillment, ...(existing.fulfillments || [])];
  dbState.noteRequests[idx] = {
    ...existing,
    fulfilled: true,
    fulfillments: updatedFulfillments,
  };

  saveDatabase();
  broadcast('NOTE_FULFILLED', { requestId, fulfillment, database: dbState });
  res.json({ success: true, noteRequest: dbState.noteRequests[idx] });
});

// DELETE note request
app.delete('/api/notes/requests/:id', (req, res) => {
  const { id } = req.params;
  dbState.noteRequests = dbState.noteRequests.filter((r) => r.id !== id);
  saveDatabase();
  broadcast('NOTE_DELETED', { id, database: dbState });
  res.json({ success: true });
});

// POST chat message
app.post('/api/chat', (req, res) => {
  const msg = req.body;
  if (!msg || !msg.id) {
    return res.status(400).json({ error: 'Invalid chat message' });
  }

  dbState.chatMessages.push(msg);
  // Keep last 300 messages to prevent uncontrolled memory growth
  if (dbState.chatMessages.length > 300) {
    dbState.chatMessages = dbState.chatMessages.slice(-300);
  }

  saveDatabase();
  broadcast('CHAT_MESSAGE_CREATED', { message: msg, database: dbState });
  res.json({ success: true, message: msg });
});

// POST chat reaction
app.post('/api/chat/react', (req, res) => {
  const { messageId, emoji } = req.body;
  const idx = dbState.chatMessages.findIndex((m) => m.id === messageId);

  if (idx !== -1) {
    const msg = dbState.chatMessages[idx];
    const reactions = { ...(msg.reactions || {}) };
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    dbState.chatMessages[idx] = { ...msg, reactions };
    saveDatabase();
    broadcast('CHAT_REACTION_UPDATED', { messageId, emoji, reactions, database: dbState });
    return res.json({ success: true, reactions });
  }
  res.status(404).json({ error: 'Message not found' });
});

// Campus Vibe Endpoints
app.get('/api/vibe', (_req, res) => {
  res.json(dbState.campusVibeConfig || DEFAULT_VIBE_CONFIG);
});

app.put('/api/vibe', (req, res) => {
  const { title, subtitle, options } = req.body;
  const current = dbState.campusVibeConfig || DEFAULT_VIBE_CONFIG;

  dbState.campusVibeConfig = {
    title: typeof title === 'string' && title.trim() ? title.trim() : current.title,
    subtitle: typeof subtitle === 'string' ? subtitle.trim() : current.subtitle,
    options: Array.isArray(options) && options.length > 0 ? options : current.options,
  };

  saveDatabase();
  broadcast('VIBE_CONFIG_UPDATED', { vibeConfig: dbState.campusVibeConfig, database: dbState });
  res.json({ success: true, vibeConfig: dbState.campusVibeConfig });
});

app.post('/api/vibe/vote', (req, res) => {
  const { optionId, previousOptionId } = req.body;
  if (!dbState.campusVibeConfig) {
    dbState.campusVibeConfig = { ...DEFAULT_VIBE_CONFIG };
  }

  dbState.campusVibeConfig.options = dbState.campusVibeConfig.options.map((opt) => {
    if (opt.id === optionId) {
      return { ...opt, count: opt.count + 1 };
    }
    if (previousOptionId && opt.id === previousOptionId) {
      return { ...opt, count: Math.max(0, opt.count - 1) };
    }
    return opt;
  });

  saveDatabase();
  broadcast('VIBE_VOTED', { vibeConfig: dbState.campusVibeConfig, database: dbState });
  res.json({ success: true, vibeConfig: dbState.campusVibeConfig });
});

// Reset database
app.post('/api/admin/reset', (req, res) => {
  const mode = req.body?.mode || 'wipe'; // 'default' | 'likes' | 'vibe' | 'wipe'

  if (mode === 'likes') {
    dbState.students = dbState.students.map((s) => ({
      ...s,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    }));
    saveDatabase();
    broadcast('STUDENTS_UPDATED', { database: dbState, students: dbState.students });
    broadcast('LIKES_RESET', { database: dbState, students: dbState.students });
    return res.json({ success: true, message: 'All student likes & votes reset to 0.', database: dbState });
  }

  if (mode === 'vibe') {
    if (dbState.campusVibeConfig) {
      dbState.campusVibeConfig.options = dbState.campusVibeConfig.options.map((opt) => ({ ...opt, count: 0 }));
    } else {
      dbState.campusVibeConfig = {
        ...DEFAULT_VIBE_CONFIG,
        options: DEFAULT_VIBE_CONFIG.options.map((opt) => ({ ...opt, count: 0 })),
      };
    }
    saveDatabase();
    broadcast('VIBE_CONFIG_UPDATED', { vibeConfig: dbState.campusVibeConfig, database: dbState });
    broadcast('VIBE_RESET', { vibeConfig: dbState.campusVibeConfig, database: dbState });
    return res.json({ success: true, message: 'Campus vibe poll votes reset to 0.', vibeConfig: dbState.campusVibeConfig });
  }

  if (mode === 'default' || mode === 'wipe') {
    dbState = {
      students: [],
      noteRequests: [],
      resources: [],
      notices: [],
      chatMessages: [],
      campusStreak: 0,
      campusVibeConfig: DEFAULT_VIBE_CONFIG,
      adminCredentials: dbState.adminCredentials || { username: 'admin', password: 'password123' },
    };
    saveDatabase();
    broadcast('DATABASE_RESET', { mode: 'wipe', database: dbState });
    broadcast('VIBE_RESET', { vibeConfig: dbState.campusVibeConfig, database: dbState });
    return res.json({ success: true, message: 'All database records wiped clean successfully', database: dbState });
  }
});

// Campus Streak endpoints
app.get('/api/campus-streak', (_req, res) => {
  res.json({ success: true, campusStreak: dbState.campusStreak || 0 });
});

app.post('/api/campus-streak/increment', (req, res) => {
  const { studentId } = req.body || {};
  dbState.campusStreak = (dbState.campusStreak || 0) + 1;

  if (studentId) {
    const sIdx = dbState.students.findIndex((s) => s.id === studentId);
    if (sIdx !== -1) {
      const currentStreak = dbState.students[sIdx].streak || 0;
      const newStreak = currentStreak + 1;
      const longest = Math.max(dbState.students[sIdx].longestStreak || 0, newStreak);
      dbState.students[sIdx] = {
        ...dbState.students[sIdx],
        streak: newStreak,
        longestStreak: longest,
        lastActiveDate: new Date().toISOString().slice(0, 10),
      };
    }
  }

  saveDatabase();
  broadcast('CAMPUS_STREAK_UPDATED', { campusStreak: dbState.campusStreak, database: dbState });
  res.json({ success: true, campusStreak: dbState.campusStreak });
});

// Admin credentials endpoints
app.get('/api/admin/credentials', (_req, res) => {
  res.json({
    success: true,
    credentials: {
      username: dbState.adminCredentials?.username || 'admin',
    },
  });
});

app.post('/api/admin/credentials', (req, res) => {
  const { username, password } = req.body || {};
  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ success: false, message: 'Username and password cannot be empty' });
  }
  dbState.adminCredentials = {
    username: username.trim(),
    password: password.trim(),
  };
  saveDatabase();
  res.json({
    success: true,
    message: 'Admin credentials updated successfully',
    username: dbState.adminCredentials.username,
  });
});

// Vite & Static file handling
async function start() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`IT Adda Server running on http://0.0.0.0:${PORT} [${isProd ? 'PROD' : 'DEV'}]`);
  });
}

start().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
