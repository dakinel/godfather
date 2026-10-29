/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Bot,
  Sparkles,
  Check,
  CheckCircle2,
  Lock,
  Power,
  RefreshCw,
  Terminal,
  Sun,
  Moon,
  Zap,
  Inbox,
  ArrowRight,
  ShieldCheck,
  Mail,
  Sliders,
  Send,
  PlayCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { GoogleWidget } from './components/GoogleWidget';
import { IdentityIllustration, IdentityType } from './components/IdentityIllustrations';
import { StackedIdentityCards } from './components/StackedIdentityCards';
import { Scroll3DLetterJourney } from './components/Scroll3DLetterJourney';
import { PERSONA_IDENTITIES, PersonaIdentity } from './lib/identities';

interface ProcessedEmail {
  id: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  replyText: string;
  status: 'replied' | 'drafted' | 'pending' | 'error';
  sentAt?: string;
}

interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export default function App() {
  // Account
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('godfather_email') || 'marthafanour@gmail.com';
  });
  const [userPassword, setUserPassword] = useState(() => {
    return localStorage.getItem('godfather_password') || '';
  });
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('godfather_name') || 'Martha';
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // 3 SIGNATURE EXECUTIVE IDENTITIES
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityType>(() => {
    return (localStorage.getItem('godfather_identity') as IdentityType) || 'builder';
  });
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);

  // BOT PERSONALITY & RESPONSE BEHAVIOUR
  const [botPersonality, setBotPersonality] = useState(() => {
    return (
      localStorage.getItem('bot_personality') ||
      PERSONA_IDENTITIES.builder.personalityPrompt
    );
  });
  const [isSaved, setIsSaved] = useState(false);

  // Autonomous Agent State
  const [agentActive, setAgentActive] = useState(true);
  const [autoSend, setAutoSend] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [processedEmails, setProcessedEmails] = useState<ProcessedEmail[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Google Widget & Modals
  const [isGoogleWidgetModalOpen, setIsGoogleWidgetModalOpen] = useState(false);
  const [dismissInlineWidget, setDismissInlineWidget] = useState(false);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [connectingServer, setConnectingServer] = useState(false);

  // Test simulation
  const [isTesting, setIsTesting] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Sync server status
  const fetchServerStatus = async () => {
    try {
      const res = await fetch('/api/email/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.isConnected);
        setIsSyncing(data.isSyncing);
        setProcessedEmails(data.processedEmails || []);
        setActivityLogs(data.activityLogs || []);
        if (data.config) {
          setAgentActive(data.config.autoRespond);
          setAutoSend(data.config.autoSend);
          if (data.config.agentPersonality && !localStorage.getItem('bot_personality')) {
            setBotPersonality(data.config.agentPersonality);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save Bot Personality
  const handleSavePersonality = async (newVal = botPersonality) => {
    setBotPersonality(newVal);
    localStorage.setItem('bot_personality', newVal);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);

    try {
      await fetch('/api/email/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentPersonality: newVal,
          autoRespond: agentActive,
          autoSend
        })
      });
      showToast('Bot personality saved & live! ⚡');
    } catch {
      showToast('Saved locally');
    }
  };

  // Toggle Autonomous Mode
  const handleToggleAgent = async () => {
    const nextVal = !agentActive;
    setAgentActive(nextVal);
    try {
      await fetch('/api/email/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoRespond: nextVal,
          autoSend,
          agentPersonality: botPersonality
        })
      });
      showToast(nextVal ? '🟢 Autonomous Agent Active' : '⏸ Agent Paused');
      fetchServerStatus();
    } catch {}
  };

  // Toggle Auto-Send vs Auto-Draft
  const handleToggleAutoSend = async () => {
    const nextVal = !autoSend;
    setAutoSend(nextVal);
    try {
      await fetch('/api/email/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoRespond: agentActive,
          autoSend: nextVal,
          agentPersonality: botPersonality
        })
      });
      showToast(nextVal ? 'Mode: Direct Auto-Reply' : 'Mode: Save as Drafts');
      fetchServerStatus();
    } catch {}
  };

  // Run a quick simulation of an incoming email being handled autonomously by the bot
  const handleSimulateEmail = async () => {
    setIsTesting(true);
    showToast('Simulating incoming email to bot...');
    try {
      const res = await fetch('/api/email/inbound-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'alex.partner@acme.com',
          subject: 'Reschedule Q4 Sync & Timeline',
          text: 'Hi, can we reschedule our review from Thursday to Friday 11:00 AM? Please confirm if that slot works.'
        })
      });
      if (res.ok) {
        try {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
          });
        } catch {}
        showToast('Bot processed & auto-replied! 🤖✨');
        fetchServerStatus();
      }
    } catch {
      showToast('Simulation error');
    } finally {
      setIsTesting(false);
    }
  };

  // Save Credentials
  const handleConnectCredentials = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setConnectingServer(true);
    try {
      localStorage.setItem('godfather_email', userEmail.trim());
      if (userPassword) localStorage.setItem('godfather_password', userPassword.trim());
      if (userName) localStorage.setItem('godfather_name', userName.trim());

      const res = await fetch('/api/email/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.trim(),
          password: userPassword.trim(),
          imapHost: 'imap.gmail.com',
          smtpHost: 'smtp.gmail.com',
          autoRespond: agentActive,
          autoSend,
          agentPersonality: botPersonality,
          senderName: userName.trim() || userEmail.split('@')[0]
        })
      });

      if (res.ok) {
        setIsConnected(true);
        showToast('Gmail linked to autonomous agent!');
        setIsCredentialsModalOpen(false);
        fetchServerStatus();
      } else {
        const d = await res.json();
        showToast(d.error || 'Connection error');
      }
    } catch {
      showToast('Failed to connect');
    } finally {
      setConnectingServer(false);
    }
  };

  // Connect & Authenticate via Google Widget
  const handleConnectGoogle = async (
    email: string,
    authMethod: 'google_oauth' | 'password',
    password?: string
  ) => {
    const cleanEmail = email.trim();
    setUserEmail(cleanEmail);
    localStorage.setItem('godfather_email', cleanEmail);
    if (password) {
      setUserPassword(password.trim());
      localStorage.setItem('godfather_password', password.trim());
    }

    try {
      const res = await fetch('/api/email/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password ? password.trim() : '',
          authMethod,
          autoRespond: agentActive,
          autoSend,
          agentPersonality: botPersonality,
          senderName: userName.trim() || cleanEmail.split('@')[0]
        })
      });

      if (res.ok) {
        setIsConnected(true);
        showToast(`Google Account ${cleanEmail} wired & authenticated! 🚀`);
        fetchServerStatus();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Failed to authenticate Google account');
      }
    } catch {
      showToast('Failed to connect with server');
    }
  };

  // Disconnect Google Account
  const handleDisconnectGoogle = async () => {
    try {
      const res = await fetch('/api/email/disconnect', { method: 'POST' });
      if (res.ok) {
        setIsConnected(false);
        showToast('Google account unlinked.');
        fetchServerStatus();
      }
    } catch {
      showToast('Error disconnecting account');
    }
  };

  // Manual Inbox Sync
  const handleSyncInbox = async () => {
    setIsSyncing(true);
    showToast('Synchronizing mailbox messages...');
    try {
      const res = await fetch('/api/email/sync', { method: 'POST' });
      if (res.ok) {
        showToast('Mailbox synchronized successfully! 📬');
        fetchServerStatus();
      } else {
        showToast('Sync completed');
      }
    } catch {
      showToast('Sync error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch Active Signature Executive Identity
  const handleSelectIdentity = async (identity: PersonaIdentity) => {
    setSelectedIdentity(identity.id);
    setBotPersonality(identity.personalityPrompt);
    localStorage.setItem('godfather_identity', identity.id);
    localStorage.setItem('bot_personality', identity.personalityPrompt);

    try {
      await fetch('/api/email/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentPersonality: identity.personalityPrompt,
          autoRespond: agentActive,
          autoSend,
          tone: identity.tone
        })
      });

      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.6 },
          colors: [identity.themeColor, '#4285F4', '#34A853']
        });
      } catch {}

      showToast(`Activated ${identity.title} persona! ✨`);
      fetchServerStatus();
    } catch {
      showToast(`Switched to ${identity.title}`);
    }
  };

  // Run Test Simulation with Persona-Tailored Email
  const handleTestIdentity = async (identity: PersonaIdentity) => {
    setIsTesting(true);
    showToast(`Sending incoming test email to ${identity.title}...`);
    try {
      const res = await fetch('/api/email/inbound-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: identity.sampleTestEmail.from,
          subject: identity.sampleTestEmail.subject,
          text: identity.sampleTestEmail.text
        })
      });
      if (res.ok) {
        try {
          confetti({
            particleCount: 40,
            spread: 70,
            origin: { y: 0.6 },
            colors: [identity.themeColor, '#4285F4', '#FBBC05', '#EA4335']
          });
        } catch {}
        showToast(`${identity.title} processed & replied! 🤖✨`);
        fetchServerStatus();
      }
    } catch {
      showToast('Simulation error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] dark:bg-[#18191b] text-neutral-800 dark:text-neutral-100 flex flex-col font-['Outfit','Lexend',sans-serif] selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-950 dark:selection:text-blue-200">
      {/* Google Extension Style Minimal Header */}
      <header className="border-b border-[#e1e3e6] dark:border-[#2d2f31] bg-white/95 dark:bg-[#1f2023]/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white font-['Lexend',sans-serif]">
                Quick<span className="text-[#1a73e8] dark:text-[#8ab4f8]">Reply</span>
              </span>
              <span className="ml-2 text-[10px] font-semibold text-[#1a73e8] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                Autonomous Agent
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border border-[#e1e3e6] dark:border-[#383a3e] bg-white dark:bg-[#28292c] text-neutral-600 dark:text-neutral-300 hover:bg-[#f1f3f4]"
              title="Live Activity Logs"
            >
              <Terminal className="w-3.5 h-3.5 text-[#34a853]" />
              <span className="hidden sm:inline">Logs</span>
            </button>

            <button
              onClick={() => setIsGoogleWidgetModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition shadow-2xs ${
                isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-[#1e8e3e]'
                  : 'bg-white dark:bg-[#28292c] border-[#dadce0] dark:border-[#5f6368] text-neutral-800 dark:text-neutral-100 hover:bg-[#f8fafd] hover:border-blue-400'
              }`}
              title="Google Account Connection"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.97 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isConnected ? `${userEmail.split('@')[0]} (Linked)` : 'Link Google Account'}</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-white hover:bg-[#f1f3f4] transition"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#fbbc04]" /> : <Moon className="w-4 h-4 text-neutral-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Single-Focused Agent Panel */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        
        {/* 3D SCROLLABLE GOOGLE INTEGRATION WIDGET (Travels down in 3D into Archive Folder as you scroll) */}
        <Scroll3DLetterJourney
          userEmail={userEmail}
          isConnected={isConnected}
          onConnect={handleConnectGoogle}
          onDisconnect={handleDisconnectGoogle}
          onSync={handleSyncInbox}
          isSyncing={isSyncing}
          senderName={userName}
          activePersonaTitle={PERSONA_IDENTITIES[selectedIdentity]?.title || 'The Executive Builder'}
        />

        {/* Agent Status Bar with Active Identity Badge */}
        <div className="w-full bg-white dark:bg-[#242528] border border-[#e1e3e6] dark:border-[#333538] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Active Identity Mini Avatar */}
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
              <IdentityIllustration type={selectedIdentity} size="sm" />
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white font-['Lexend',sans-serif] flex items-center gap-2">
                <span>{PERSONA_IDENTITIES[selectedIdentity]?.title}</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${agentActive ? 'bg-emerald-50 text-[#1e8e3e] border border-emerald-200' : 'bg-neutral-100 text-neutral-500'}`}>
                  {agentActive ? 'Active 24/7' : 'Paused'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Responding for <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">{userEmail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleToggleAutoSend}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                autoSend
                  ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                  : 'bg-white dark:bg-[#28292c] border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {autoSend ? '⚡ Auto-Reply Direct' : '📋 Create Drafts'}
            </button>

            <button
              onClick={handleToggleAgent}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                agentActive
                  ? 'bg-[#34a853] text-white border-[#34a853]'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{agentActive ? 'Agent On' : 'Agent Off'}</span>
            </button>
          </div>
        </div>

        {/* 3 SIGNATURE EXECUTIVE IDENTITIES FROM ID.HTML - GAMIFIED STACKED CARDS */}
        <section className="w-full bg-white dark:bg-[#242528] border border-[#e1e3e6] dark:border-[#333538] rounded-3xl p-5 shadow-xs flex flex-col gap-4">
          <StackedIdentityCards
            selectedIdentity={selectedIdentity}
            onSelectIdentity={handleSelectIdentity}
            onTestIdentity={handleTestIdentity}
            isTesting={isTesting}
          />

          {/* Minimalist Prompt Customizer (Collapsible) */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
              className="w-full flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 py-1"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Fine-tune Prompt Rules for {PERSONA_IDENTITIES[selectedIdentity]?.title}</span>
              </span>
              {showAdvancedPrompt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvancedPrompt && (
              <div className="mt-3 flex flex-col gap-2.5 animate-fadeIn">
                <textarea
                  value={botPersonality}
                  onChange={(e) => setBotPersonality(e.target.value)}
                  rows={3}
                  className="w-full bg-[#f8fafd] dark:bg-[#1a1b1d] border border-[#e1e3e6] dark:border-[#333538] rounded-xl p-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden focus:border-[#1a73e8] leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      const defaultPrompt = PERSONA_IDENTITIES[selectedIdentity]?.personalityPrompt;
                      if (defaultPrompt) {
                        setBotPersonality(defaultPrompt);
                        handleSavePersonality(defaultPrompt);
                      }
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-700 underline"
                  >
                    Reset to default {PERSONA_IDENTITIES[selectedIdentity]?.title} rules
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePersonality(botPersonality)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-2xs transition flex items-center gap-1"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Rules Saved' : 'Save Rules'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* AUTONOMOUS AGENT ACTIVITY (WHAT THE BOT HAS DONE) */}
        <section className="w-full bg-white dark:bg-[#242528] border border-[#e1e3e6] dark:border-[#333538] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#e1e3e6] dark:border-[#333538]">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8]" />
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-['Lexend',sans-serif]">
                Agent Live Activity
              </h3>
              <span className="text-[11px] text-neutral-400">
                ({processedEmails.length} emails handled)
              </span>
            </div>

            <button
              onClick={handleSimulateEmail}
              className="text-xs text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-semibold flex items-center gap-1"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Simulate Incoming Email</span>
            </button>
          </div>

          {processedEmails.length === 0 ? (
            <div className="py-7 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-[#1a73e8] mb-2.5">
                <Bot className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1">
                Bot is listening in the background
              </h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-3">
                Whenever an email arrives in <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold">{userEmail}</span>, your bot answers automatically using your custom personality rules.
              </p>
              <button
                onClick={handleSimulateEmail}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e8f0fe] dark:bg-blue-950/60 text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-blue-100 transition border border-blue-200 dark:border-blue-900"
              >
                Test with a sample email now
              </button>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {processedEmails.map((item) => (
                <div key={item.id} className="py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {item.fromName || item.from}
                    </span>
                    <span className="text-[10px] font-bold text-[#1e8e3e] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Auto-Replied
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {item.subject}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 bg-[#f8fafd] dark:bg-[#1a1b1d] p-2 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    Incoming: "{item.body}"
                  </div>
                  <div className="bg-[#eef4fe] dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl p-2.5 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    <span className="font-semibold text-[#1a73e8] dark:text-[#8ab4f8] block mb-1">
                      Bot Response:
                    </span>
                    {item.replyText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Live Terminal Log Drawer */}
        {isLogsOpen && (
          <section className="bg-white dark:bg-[#1c1d1f] border border-[#e1e3e6] dark:border-[#333538] rounded-2xl p-4 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="font-bold text-[#1a73e8] dark:text-[#8ab4f8] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#34a853]" />
                <span>Agent Background Activity Log</span>
              </span>
              <button
                onClick={() => setIsLogsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-xs"
              >
                Close ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-[11px] leading-relaxed">
                  <span className="text-neutral-400 shrink-0">[{log.timestamp}]</span>
                  <span className="text-neutral-700 dark:text-neutral-300 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Interactive Google Widget Modal (Matching User's Screenshot) */}
      {isGoogleWidgetModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <GoogleWidget
            userEmail={userEmail}
            isConnected={isConnected}
            onConnect={handleConnectGoogle}
            onDisconnect={handleDisconnectGoogle}
            onSync={handleSyncInbox}
            isSyncing={isSyncing}
            onClose={() => setIsGoogleWidgetModalOpen(false)}
            isModal={true}
          />
        </div>
      )}

      {/* Credentials Modal */}
      {isCredentialsModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#28292c] border border-neutral-200 dark:border-neutral-700 rounded-3xl max-w-md w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setIsCredentialsModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-full"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-['Lexend',sans-serif] mb-1">
              Connect Google Mailbox
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Allows the bot to listen and auto-reply to incoming emails 24/7
            </p>

            <form onSubmit={handleConnectCredentials} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Google Email:
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full bg-[#f8fafd] dark:bg-[#1a1b1d] border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-[#1a73e8] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Google App Password:
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Paste 16-character App Password"
                  className="w-full bg-[#f8fafd] dark:bg-[#1a1b1d] border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setIsCredentialsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connectingServer}
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1a73e8] text-white hover:bg-[#1557b0] transition flex items-center gap-1.5"
                >
                  {connectingServer && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{connectingServer ? 'Connecting...' : 'Save & Connect'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#323232] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#fbbc04]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
