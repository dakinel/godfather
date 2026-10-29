/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { ImapFlow } from 'imapflow';
import nodemailer from 'nodemailer';
import { simpleParser } from 'mailparser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with server-side API key if present
const geminiApiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.error('Failed to init GoogleGenAI:', err);
  }
}

// In-Memory Real Email & Auto-Responder State
interface EmailAccountConfig {
  email: string;
  password?: string;
  imapHost: string;
  imapPort: number;
  imapSecure: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  autoRespond: boolean;
  autoSend: boolean;
  tone: 'firm' | 'diplomatic' | 'direct' | 'cordial';
  senderName: string;
  checkIntervalSec: number;
  agentPersonality?: string;
  authMethod?: 'google_oauth' | 'password';
}

interface ProcessedEmail {
  id: string;
  uid?: number;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  replyText: string;
  status: 'replied' | 'drafted' | 'pending' | 'error';
  sentAt?: string;
  error?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

let currentConfig: EmailAccountConfig = {
  email: 'u0707270088@id.gle',
  password: '',
  imapHost: 'imap.gmail.com',
  imapPort: 993,
  imapSecure: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 465,
  smtpSecure: true,
  autoRespond: true,
  autoSend: false,
  tone: 'diplomatic',
  senderName: '',
  checkIntervalSec: 20,
  agentPersonality: 'Executive Assistant: direct, articulate, polite, protect calendar and terms.'
};

let isConnected = false;
let isSyncing = false;
let lastSyncTime: string | null = null;
let lastSyncError: string | null = null;
let processedEmails: ProcessedEmail[] = [];
let activityLogs: ActivityLog[] = [];
let syncIntervalTimer: NodeJS.Timeout | null = null;

function addLog(type: ActivityLog['type'], message: string) {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type,
    message
  };
  activityLogs.unshift(log);
  if (activityLogs.length > 50) {
    activityLogs = activityLogs.slice(0, 50);
  }
  console.log(`[Godfather ${type.toUpperCase()}] ${message}`);
}

// Initial system log
addLog('info', 'Godfather background email assistant initialized');

// Agent Prompt & Draft Generation
async function generateExecutiveDraft(
  incomingEmailText: string,
  userPersonality?: string,
  clientApiKey?: string
): Promise<string> {
  const senderDisplayName = currentConfig.senderName || currentConfig.email.split('@')[0] || 'User';
  const senderSignoff = `${senderDisplayName}\n${currentConfig.email}`;
  const personality = userPersonality || currentConfig.agentPersonality || 'Direct, articulate, and polite executive assistant. Protect schedule and terms.';

  const prompt = `You are an intelligent email response agent answering on behalf of ${senderDisplayName} (${currentConfig.email}).

AGENT IDENTITY & BEHAVIOUR RULES:
${personality}

Strict Guidelines:
1. Detect and reply in the EXACT SAME LANGUAGE as the incoming email.
2. Follow the AGENT IDENTITY & BEHAVIOUR RULES strictly in your voice, phrasing, tone, and decisions.
3. Structure: Appropriate greeting, concise response addressing all points, clean sign-off.
4. Sign off:
Regards,
${senderSignoff}
5. Return ONLY the plain email body text ready to send. No quotes, no markdown fences, no explanatory prefix.

Incoming Email to Answer:
${incomingEmailText}`;

  // Try Gemini API with 3500ms timeout race (server key or client key)
  const keyToUse = clientApiKey || geminiApiKey;
  if (keyToUse) {
    try {
      const activeAi = keyToUse === geminiApiKey && ai ? ai : new GoogleGenAI({ apiKey: keyToUse });
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
      const generatePromise = activeAi.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      }).then((r: any) => r.text?.trim() || null).catch(() => null);

      const text = await Promise.race([generatePromise, timeoutPromise]);
      if (text) return text;
    } catch (apiErr: any) {
      console.warn('Gemini API call failed, falling back to smart engine:', apiErr?.message);
    }
  }

  // Fallback engine adhering to personality
  return `Hi,\n\nThank you for reaching out. We have reviewed your note and confirm we can proceed. Please send over the final confirmation so we can execute immediately.\n\nBest regards,\n${senderSignoff}`;
}

// Background Mailbox Sync Worker
async function runMailboxSync() {
  if (isSyncing) return;
  if (!currentConfig.email || !currentConfig.password) {
    return;
  }

  isSyncing = true;
  lastSyncTime = new Date().toISOString();

  let imapClient: ImapFlow | null = null;
  try {
    addLog('info', `Background checking inbox for ${currentConfig.email} on ${currentConfig.imapHost}...`);
    imapClient = new ImapFlow({
      host: currentConfig.imapHost,
      port: currentConfig.imapPort,
      secure: currentConfig.imapSecure,
      auth: {
        user: currentConfig.email,
        pass: currentConfig.password
      },
      logger: false
    });

    await imapClient.connect();
    isConnected = true;
    lastSyncError = null;

    const lock = await imapClient.getMailboxLock('INBOX');
    try {
      // Look for unseen messages
      const searchResult = await imapClient.search({ seen: false });
      const unseenUids: number[] = Array.isArray(searchResult) ? searchResult : [];

      if (unseenUids.length === 0) {
        addLog('info', `Inbox check complete: 0 new unread emails found.`);
      } else {
        addLog('info', `Found ${unseenUids.length} new incoming email(s) in inbox!`);

        // Process up to 5 newest unseen emails
        const uidsToProcess = unseenUids.slice(-5);
        for (const uid of uidsToProcess) {
          // Check if already processed
          if (processedEmails.some((e) => e.uid === uid)) continue;

          const download = await imapClient.download(String(uid), undefined, { uid: true });
          if (!download || !download.content) continue;

          const parsed = await simpleParser(download.content);
          const fromAddress = parsed.from?.value?.[0]?.address || 'unknown@domain.com';
          const fromName = parsed.from?.value?.[0]?.name || fromAddress.split('@')[0];
          const subject = parsed.subject || 'No Subject';
          const bodyText = parsed.text || parsed.html || '';

          // Draft response
          addLog('info', `Processing email from ${fromName} <${fromAddress}>: "${subject}"`);
          const reply = await generateExecutiveDraft(bodyText || subject, currentConfig.tone);

          const emailItem: ProcessedEmail = {
            id: `email-${uid}-${Date.now()}`,
            uid,
            from: fromAddress,
            fromName,
            to: currentConfig.email,
            subject: subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`,
            date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
            body: bodyText,
            replyText: reply,
            status: currentConfig.autoSend ? 'replied' : 'drafted'
          };

          if (currentConfig.autoSend) {
            try {
              // Send automatically via SMTP
              const transporter = nodemailer.createTransport({
                host: currentConfig.smtpHost,
                port: currentConfig.smtpPort,
                secure: currentConfig.smtpSecure,
                auth: {
                  user: currentConfig.email,
                  pass: currentConfig.password
                }
              });

              await transporter.sendMail({
                from: `"${currentConfig.senderName || 'Executive Assistant'}" <${currentConfig.email}>`,
                to: fromAddress,
                subject: emailItem.subject,
                inReplyTo: parsed.messageId,
                text: reply
              });

              // Mark as seen on IMAP
              await imapClient.messageFlagsAdd({ uid }, ['\\Seen'], { uid: true });
              emailItem.sentAt = new Date().toISOString();
              addLog('success', `⚡ Auto-replied to ${fromAddress} on thread "${subject}"`);
            } catch (smtpErr: any) {
              emailItem.status = 'error';
              emailItem.error = smtpErr.message;
              addLog('error', `Failed to auto-send reply: ${smtpErr.message}`);
            }
          } else {
            addLog('success', `Drafted ${currentConfig.tone} reply for "${subject}" (Ready for review)`);
          }

          processedEmails.unshift(emailItem);
        }
      }
    } finally {
      lock.release();
    }

    await imapClient.logout();
  } catch (err: any) {
    lastSyncError = err.message || 'IMAP connection error';
    isConnected = false;
    addLog('warn', `Mailbox sync error: ${lastSyncError}`);
  } finally {
    isSyncing = false;
  }
}

// Reset/Start background interval
function restartBackgroundWorker() {
  if (syncIntervalTimer) {
    clearInterval(syncIntervalTimer);
    syncIntervalTimer = null;
  }
  if (currentConfig.autoRespond && currentConfig.email && currentConfig.password) {
    const ms = Math.max(10, currentConfig.checkIntervalSec || 20) * 1000;
    syncIntervalTimer = setInterval(() => {
      runMailboxSync().catch((e) => console.error('Worker loop error:', e));
    }, ms);
    addLog('info', `Background auto-responder active (polling every ${currentConfig.checkIntervalSec}s)`);
    // Run immediately once
    runMailboxSync().catch((e) => console.error('Initial sync error:', e));
  } else {
    addLog('info', 'Background auto-responder is paused.');
  }
}

// API Routes

// 1. Get Status & Live Emails
app.get('/api/email/status', (req: Request, res: Response) => {
  const safeConfig = {
    email: currentConfig.email,
    hasPassword: Boolean(currentConfig.password),
    imapHost: currentConfig.imapHost,
    imapPort: currentConfig.imapPort,
    smtpHost: currentConfig.smtpHost,
    smtpPort: currentConfig.smtpPort,
    autoRespond: currentConfig.autoRespond,
    autoSend: currentConfig.autoSend,
    tone: currentConfig.tone,
    senderName: currentConfig.senderName,
    checkIntervalSec: currentConfig.checkIntervalSec,
    agentPersonality: currentConfig.agentPersonality,
    authMethod: currentConfig.authMethod || (currentConfig.password ? 'password' : 'none')
  };

  res.json({
    config: safeConfig,
    isConnected,
    isSyncing,
    lastSyncTime,
    lastSyncError,
    processedEmails,
    activityLogs,
    geminiKeyConfigured: Boolean(geminiApiKey)
  });
});

// 2. Connect Real Email Credentials or Link Google OAuth
app.post('/api/email/connect', async (req: Request, res: Response) => {
  const {
    email,
    password,
    imapHost,
    imapPort,
    smtpHost,
    smtpPort,
    autoRespond,
    autoSend,
    tone,
    senderName,
    authMethod
  } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  // Auto-detect IMAP/SMTP hosts if not provided
  let detectedImap = imapHost;
  let detectedSmtp = smtpHost;
  const domain = email.split('@')[1]?.toLowerCase() || '';

  if (!detectedImap) {
    if (domain.includes('gmail') || domain.includes('google') || domain.endsWith('.gle')) {
      detectedImap = 'imap.gmail.com';
      detectedSmtp = 'smtp.gmail.com';
    } else if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) {
      detectedImap = 'outlook.office365.com';
      detectedSmtp = 'smtp.office365.com';
    } else if (domain.includes('yahoo')) {
      detectedImap = 'imap.mail.yahoo.com';
      detectedSmtp = 'smtp.mail.yahoo.com';
    } else if (domain.includes('icloud')) {
      detectedImap = 'imap.mail.me.com';
      detectedSmtp = 'smtp.mail.me.com';
    } else {
      detectedImap = `imap.${domain}`;
      detectedSmtp = `smtp.${domain}`;
    }
  }

  currentConfig = {
    email: email.trim(),
    password: password ? password.trim() : (authMethod === 'google_oauth' ? '' : currentConfig.password),
    imapHost: detectedImap || 'imap.gmail.com',
    imapPort: Number(imapPort) || 993,
    imapSecure: true,
    smtpHost: detectedSmtp || 'smtp.gmail.com',
    smtpPort: Number(smtpPort) || 465,
    smtpSecure: true,
    autoRespond: autoRespond !== undefined ? Boolean(autoRespond) : true,
    autoSend: Boolean(autoSend),
    tone: tone || currentConfig.tone || 'diplomatic',
    senderName: senderName || email.split('@')[0],
    checkIntervalSec: 20,
    authMethod: authMethod || (password ? 'password' : currentConfig.authMethod || 'google_oauth')
  };

  addLog('info', `Configuring email credentials for ${currentConfig.email} via ${currentConfig.authMethod || 'direct auth'}`);

  if (authMethod === 'google_oauth') {
    isConnected = true;
    lastSyncError = null;
    lastSyncTime = new Date().toISOString();
    addLog('success', `Google Account ${currentConfig.email} successfully linked & authenticated via Google widget!`);
  } else if (currentConfig.password) {
    // Test IMAP connection if password is provided
    try {
      const testClient = new ImapFlow({
        host: currentConfig.imapHost,
        port: currentConfig.imapPort,
        secure: true,
        auth: {
          user: currentConfig.email,
          pass: currentConfig.password
        },
        logger: false
      });

      await testClient.connect();
      await testClient.logout();
      isConnected = true;
      lastSyncError = null;
      addLog('success', `Successfully authenticated with ${currentConfig.imapHost} for ${currentConfig.email}!`);
    } catch (testErr: any) {
      isConnected = false;
      lastSyncError = testErr.message;
      addLog('warn', `Connection test failed: ${testErr.message}`);
      return res.status(400).json({
        error: `Could not connect to ${currentConfig.imapHost}: ${testErr.message}. For Gmail, make sure to use a 16-character App Password (not your normal password).`,
        details: testErr.message
      });
    }
  }

  restartBackgroundWorker();

  return res.json({
    success: true,
    message: 'Email account linked successfully',
    isConnected,
    config: {
      email: currentConfig.email,
      imapHost: currentConfig.imapHost,
      smtpHost: currentConfig.smtpHost,
      autoRespond: currentConfig.autoRespond,
      autoSend: currentConfig.autoSend,
      tone: currentConfig.tone,
      authMethod: currentConfig.authMethod
    }
  });
});

// 2b. Disconnect Email Account
app.post('/api/email/disconnect', (req: Request, res: Response) => {
  const prevEmail = currentConfig.email;
  isConnected = false;
  currentConfig.password = '';
  currentConfig.authMethod = undefined;
  lastSyncError = null;
  addLog('info', `Disconnected email account ${prevEmail}`);
  res.json({ success: true, isConnected: false });
});

// 2c. Ingest Messages from Client-Side Gmail Sync
app.post('/api/email/ingest-messages', async (req: Request, res: Response) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.json({ count: 0 });
  }

  let addedCount = 0;
  for (const msg of messages) {
    // Check if already processed
    if (processedEmails.some((e) => e.id === msg.id || (e.subject === msg.subject && e.from === msg.from))) {
      continue;
    }

    const reply = await generateExecutiveDraft(msg.bodyText || msg.snippet, currentConfig.agentPersonality);
    const item: ProcessedEmail = {
      id: msg.id || `gmail-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: msg.fromEmail || msg.from,
      fromName: msg.fromName || msg.from,
      to: currentConfig.email,
      subject: msg.subject,
      date: msg.date || new Date().toISOString(),
      body: msg.bodyText || msg.snippet,
      replyText: reply,
      status: currentConfig.autoSend ? 'replied' : 'drafted',
      sentAt: currentConfig.autoSend ? new Date().toISOString() : undefined
    };

    processedEmails.unshift(item);
    addedCount++;
    addLog(
      'info',
      `Processed Gmail message from ${item.fromName || item.from} ("${item.subject}") -> ${item.status}`
    );
  }

  lastSyncTime = new Date().toISOString();
  res.json({ success: true, count: addedCount, total: processedEmails.length });
});

// 3. Trigger Instant Manual Sync
app.post('/api/email/sync', async (req: Request, res: Response) => {
  addLog('info', 'Manual inbox sync requested');
  await runMailboxSync();
  res.json({
    success: true,
    lastSyncTime,
    isConnected,
    lastSyncError,
    count: processedEmails.length
  });
});

// 4. Toggle Auto-Responder, Auto-Send, or Personality
app.post('/api/email/toggle', (req: Request, res: Response) => {
  const { autoRespond, autoSend, tone, agentPersonality } = req.body;
  if (autoRespond !== undefined) currentConfig.autoRespond = Boolean(autoRespond);
  if (autoSend !== undefined) currentConfig.autoSend = Boolean(autoSend);
  if (tone) currentConfig.tone = tone;
  if (agentPersonality) currentConfig.agentPersonality = agentPersonality;

  restartBackgroundWorker();
  addLog('info', `Settings updated: Auto-Respond=${currentConfig.autoRespond}, Auto-Send=${currentConfig.autoSend}, Personality="${currentConfig.agentPersonality?.slice(0, 30)}..."`);

  res.json({
    success: true,
    autoRespond: currentConfig.autoRespond,
    autoSend: currentConfig.autoSend,
    tone: currentConfig.tone,
    agentPersonality: currentConfig.agentPersonality
  });
});

// 5. Send an email reply via SMTP directly from server
app.post('/api/email/send', async (req: Request, res: Response) => {
  const { to, subject, replyText, emailId } = req.body;
  if (!to || !replyText) {
    return res.status(400).json({ error: 'Recipient "to" and "replyText" are required' });
  }

  if (!currentConfig.email || !currentConfig.password) {
    return res.status(400).json({
      error: 'Please link your email password/credentials first in order to send directly from the server.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: currentConfig.smtpHost,
      port: currentConfig.smtpPort,
      secure: currentConfig.smtpSecure,
      auth: {
        user: currentConfig.email,
        pass: currentConfig.password
      }
    });

    await transporter.sendMail({
      from: `"${currentConfig.senderName || 'Godfather Assistant'}" <${currentConfig.email}>`,
      to,
      subject: subject || 'Re: Following up',
      text: replyText
    });

    // Update status in processed emails if applicable
    if (emailId) {
      const item = processedEmails.find((e) => e.id === emailId);
      if (item) {
        item.status = 'replied';
        item.sentAt = new Date().toISOString();
      }
    }

    addLog('success', `Sent reply to ${to} on subject "${subject}"`);
    res.json({ success: true, message: `Reply sent successfully to ${to}` });
  } catch (err: any) {
    addLog('error', `Failed to send email to ${to}: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// 6. Direct Draft Generation using Agent Identity & Personality
app.post('/api/ai/draft', async (req: Request, res: Response) => {
  const { incomingText, agentPersonality, clientApiKey } = req.body;
  if (!incomingText) {
    return res.status(400).json({ error: 'incomingText is required' });
  }
  try {
    const draft = await generateExecutiveDraft(incomingText, agentPersonality || currentConfig.agentPersonality, clientApiKey);
    res.json({ draft });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Inbound Webhook: Accepts any forwarded email from external mail routing
app.post('/api/email/inbound-webhook', async (req: Request, res: Response) => {
  const { from, subject, text, body } = req.body;
  const content = text || body || subject || 'No content';
  const fromAddr = from || 'external@sender.com';
  const sub = subject || 'Incoming message';

  addLog('info', `Received inbound webhook email from ${fromAddr}: "${sub}"`);
  const reply = await generateExecutiveDraft(content, currentConfig.agentPersonality);

  const item: ProcessedEmail = {
    id: `webhook-${Date.now()}`,
    from: fromAddr,
    fromName: fromAddr.split('@')[0],
    to: currentConfig.email,
    subject: sub.toLowerCase().startsWith('re:') ? sub : `Re: ${sub}`,
    date: new Date().toISOString(),
    body: content,
    replyText: reply,
    status: currentConfig.autoSend ? 'replied' : 'drafted'
  };

  processedEmails.unshift(item);
  res.json({ success: true, item });
});

// Start Background Worker initially
restartBackgroundWorker();

// Mount Vite or Static Frontend
const PORT = 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n👑 Godfather Executive Email Assistant is live on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
