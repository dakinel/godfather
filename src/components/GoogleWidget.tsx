import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Shield,
  Zap,
  ArrowRight,
  Settings,
  Mail,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronLeft,
  KeyRound,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface GoogleWidgetProps {
  userEmail: string;
  isConnected: boolean;
  onConnect: (email: string, authMethod: 'google_oauth' | 'password', password?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync: () => Promise<void>;
  isSyncing?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const GoogleWidget: React.FC<GoogleWidgetProps> = ({
  userEmail,
  isConnected,
  onConnect,
  onDisconnect,
  onSync,
  isSyncing = false,
  onClose,
  isModal = false
}) => {
  const [activeStep, setActiveStep] = useState<number>(isConnected ? 2 : 0);
  const [selectedEmail, setSelectedEmail] = useState<string>(
    userEmail && userEmail !== 'u0707270088@id.gle' ? userEmail : 'marthafanour@gmail.com'
  );
  const [customEmail, setCustomEmail] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [appPassword, setAppPassword] = useState<string>('');
  const [useAppPasswordOption, setUseAppPasswordOption] = useState<boolean>(false);

  const emailToWire = isCustom && customEmail ? customEmail.trim() : selectedEmail;

  const handleStartAuth = async () => {
    setIsAuthenticating(true);
    try {
      if (useAppPasswordOption && appPassword) {
        await onConnect(emailToWire, 'password', appPassword);
      } else {
        // Direct Google OAuth Authentication & Linking
        await onConnect(emailToWire, 'google_oauth');
      }

      try {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335']
        });
      } catch {}

      setActiveStep(2);
    } catch (err) {
      console.error('Authentication error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div
      className={`relative w-full ${isModal ? 'max-w-xl' : ''} mx-auto bg-white dark:bg-[#202124] rounded-3xl border border-[#dadce0] dark:border-[#333538] shadow-sm overflow-hidden flex flex-col font-['Outfit','Lexend',sans-serif] transition-all duration-300 ${
        isModal ? '' : 'my-1'
      }`}
    >
      {/* Top Header matching Google Workspace Style */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#f1f3f4] dark:border-[#303134]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Use Gmail to read and send emails
          </span>
        </div>
        <button
          onClick={onClose || (() => setActiveStep(0))}
          aria-label="Close widget"
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition text-sm font-medium"
        >
          ✕
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative px-6 py-8 flex-1 flex flex-col justify-center items-center text-center min-h-[330px] overflow-hidden">
        {/* Soft Holographic / Aurora Pastel Gradient Backdrop (Matches User's Screenshot) */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-blue-200/50 via-purple-100/30 to-transparent dark:from-blue-900/30 dark:via-purple-900/20 dark:to-transparent pointer-events-none blur-2xl" />
        <div className="absolute -bottom-8 -left-10 w-44 h-44 rounded-full bg-blue-300/30 dark:bg-blue-600/15 pointer-events-none blur-3xl" />
        <div className="absolute -bottom-8 -right-10 w-44 h-44 rounded-full bg-amber-200/35 dark:bg-amber-500/15 pointer-events-none blur-3xl" />
        <div className="absolute bottom-2 left-1/3 w-36 h-28 rounded-full bg-pink-200/25 dark:bg-pink-600/15 pointer-events-none blur-2xl" />

        {/* STEP 0: Exact match to User's Screenshot */}
        {activeStep === 0 && (
          <div className="relative z-10 w-full flex flex-col items-center animate-fadeIn">
            {/* Clean Gmail Multi-Color "M" Logo (Direct on ambient background as in screenshot) */}
            <div className="relative mb-5 flex items-center justify-center">
              <svg
                className="w-14 h-14 drop-shadow-sm transition-transform duration-300 hover:scale-105"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="#EA4335"
                />
                <path
                  d="M4 6L12 11L20 6V4L12 9L4 4V6Z"
                  fill="#FBBC05"
                />
                <path
                  d="M2 6V18C2 19.1 2.9 20 4 20H8V11L2 6Z"
                  fill="#4285F4"
                />
                <path
                  d="M22 6L16 11V20H20C21.1 20 22 19.1 22 18V6Z"
                  fill="#34A853"
                />
              </svg>
            </div>

            {/* Headline & Description */}
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mb-2 font-['Lexend',sans-serif]">
              Supercharge your inbox
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-md leading-relaxed mb-7 font-normal">
              Automatically organize your messages and prepare your replies
            </p>

            {/* Primary Action Button (White Pill with Soft Border) */}
            <button
              type="button"
              onClick={() => setActiveStep(1)}
              className="px-8 py-2.5 rounded-full text-sm font-semibold bg-white dark:bg-[#28292c] border border-[#dadce0] dark:border-[#5f6368] text-neutral-800 dark:text-neutral-100 hover:bg-[#f8fafd] dark:hover:bg-[#323438] hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer shadow-xs"
            >
              Sounds great, continue
            </button>
          </div>
        )}

        {/* STEP 1: Link & Authenticate Account Widget */}
        {activeStep === 1 && (
          <div className="w-full flex flex-col items-center animate-fadeIn text-left">
            <div className="w-full flex items-center justify-between mb-4">
              <button
                onClick={() => setActiveStep(0)}
                className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1 font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
              <span className="text-[11px] font-semibold text-[#1a73e8] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                Step 2 of 3 • Select & Authorize Account
              </span>
            </div>

            <div className="w-full mb-4">
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-1 font-['Lexend',sans-serif]">
                Link your Google Account
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Choose the Google Workspace or Gmail account for the autonomous assistant:
              </p>
            </div>

            {/* FULL-WIDTH ACCOUNTS TABLE */}
            <div className="w-full overflow-hidden border border-[#dadce0] dark:border-[#3c4043] rounded-2xl bg-white dark:bg-[#28292c] mb-4 shadow-2xs">
              <div className="grid grid-cols-12 bg-[#f8fafd] dark:bg-[#1e2023] px-4 py-2.5 border-b border-[#dadce0] dark:border-[#3c4043] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                <div className="col-span-5 sm:col-span-5">Google Account</div>
                <div className="col-span-3 sm:col-span-3">Provider</div>
                <div className="col-span-2 sm:col-span-2">Sync Mode</div>
                <div className="col-span-2 sm:col-span-2 text-right">Select</div>
              </div>

              {/* Primary Account Row */}
              <div
                onClick={() => {
                  setSelectedEmail('marthafanour@gmail.com');
                  setIsCustom(false);
                }}
                className={`grid grid-cols-12 items-center px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 cursor-pointer transition ${
                  !isCustom && selectedEmail === 'marthafanour@gmail.com'
                    ? 'bg-[#e8f0fe]/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#2d2f31]'
                }`}
              >
                <div className="col-span-5 sm:col-span-5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    M
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate flex items-center gap-1.5">
                      <span>marthafanour@gmail.com</span>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                        Primary
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-400">Google AI Studio Profile</div>
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-3 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                  <span>Google Mail</span>
                </div>

                <div className="col-span-2 sm:col-span-2 text-[11px] text-neutral-500">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Auto-Listen
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-2 text-right">
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${
                      !isCustom && selectedEmail === 'marthafanour@gmail.com'
                        ? 'border-[#1a73e8] bg-[#1a73e8] text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    {!isCustom && selectedEmail === 'marthafanour@gmail.com' && '✓'}
                  </span>
                </div>
              </div>

              {/* Custom / Alternative Account Row */}
              <div
                onClick={() => setIsCustom(true)}
                className={`px-4 py-3 cursor-pointer transition ${
                  isCustom
                    ? 'bg-[#e8f0fe]/50 dark:bg-blue-950/30'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#2d2f31]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        Connect a different email
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Custom Gmail, Google Workspace, or SMTP address
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${
                      isCustom
                        ? 'border-[#1a73e8] bg-[#1a73e8] text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    {isCustom && '✓'}
                  </span>
                </div>

                {isCustom && (
                  <div className="mt-2.5 pl-10.5">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="e.g. executive@yourcompany.com"
                      className="w-full bg-white dark:bg-[#1a1b1d] border border-neutral-300 dark:border-neutral-600 rounded-xl px-3 py-1.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-hidden focus:border-[#1a73e8]"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>

            {/* FULL-WIDTH PERMISSION MATRIX */}
            <div className="w-full bg-[#f8fafd] dark:bg-[#1f2023] rounded-2xl p-4 border border-[#e1e3e6] dark:border-[#333538] mb-5 text-[11px] space-y-2 text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100 text-xs">
                <Shield className="w-4 h-4 text-[#34a853]" />
                <span>Authorized Security & Privacy Matrix</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="flex items-start gap-2 bg-white dark:bg-[#28292c] p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-[#34a853] font-bold">✓</span>
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">Read Incoming Mail</span>
                    <span>Extracts questions, context, and tone requests in real time</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white dark:bg-[#28292c] p-2.5 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80">
                  <span className="text-[#34a853] font-bold">✓</span>
                  <div>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">Draft & Reply</span>
                    <span>Generates executive persona responses or prepares drafts for review</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Official Google Sign-in / Wire Button - FULL WIDTH */}
            <button
              onClick={handleStartAuth}
              disabled={isAuthenticating || !emailToWire}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-[#28292c] hover:bg-neutral-50 dark:hover:bg-[#323438] text-neutral-800 dark:text-neutral-100 font-semibold py-3 px-6 rounded-full border border-[#dadce0] dark:border-[#5f6368] shadow-xs transition active:scale-[0.99] disabled:opacity-50"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#1a73e8]" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              )}
              <span className="text-sm">
                {isAuthenticating
                  ? 'Authenticating with Google...'
                  : `Link & Authenticate ${emailToWire ? `(${emailToWire})` : ''}`}
              </span>
            </button>
          </div>
        )}

        {/* STEP 2: Connected Status Card - FULL WIDTH */}
        {activeStep === 2 && (
          <div className="w-full flex flex-col items-center animate-fadeIn text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#1e8e3e] mb-3 shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1 font-['Lexend',sans-serif]">
              Google Mailbox Authenticated & Wired
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 max-w-md">
              Your Godfather AI autonomous auto-responder is synchronized and processing incoming correspondence.
            </p>

            {/* FULL-WIDTH CONNECTED METRICS TABLE */}
            <div className="bg-[#f8fafd] dark:bg-[#1f2023] border border-[#e1e3e6] dark:border-[#333538] rounded-2xl p-4 mb-5 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  {userEmail.charAt(0).toUpperCase() || 'G'}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>{userEmail}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.2 rounded font-bold">
                      Connected
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Listening for incoming mail • Auto-reply active
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSync}
                  disabled={isSyncing}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#e8f0fe] dark:bg-blue-950/60 text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-blue-100 flex items-center gap-1.5 border border-blue-200 dark:border-blue-900"
                  title="Sync inbox now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Mailbox'}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="w-full flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="px-8 py-2.5 rounded-full text-xs font-bold bg-[#1a73e8] text-white hover:bg-[#1557b0] transition shadow-xs"
              >
                Done
              </button>
              <button
                onClick={async () => {
                  await onDisconnect();
                  setActiveStep(0);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Drawer for Settings / IMAP option */}
      {showSettingsDrawer && (
        <div className="p-4 bg-[#f8fafd] dark:bg-[#1c1d1f] border-t border-[#e1e3e6] dark:border-[#333538] text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Advanced Connection Options</span>
            </span>
            <button
              onClick={() => setShowSettingsDrawer(false)}
              className="text-neutral-400 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <input
                type="checkbox"
                checked={useAppPasswordOption}
                onChange={(e) => setUseAppPasswordOption(e.target.checked)}
                className="rounded text-[#1a73e8]"
              />
              <span>Use Google 16-character App Password (Direct IMAP/SMTP)</span>
            </label>
            {useAppPasswordOption && (
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full bg-white dark:bg-[#28292c] border border-neutral-300 dark:border-neutral-600 rounded-xl px-3 py-1.5 text-xs font-mono"
              />
            )}
          </div>
        </div>
      )}

      {/* Bottom Footer with Settings Cog & 3 Navigation Dots (as in screenshot) */}
      <div className="relative pt-4 pb-4 px-6 flex items-center justify-between border-t border-[#f1f3f4] dark:border-[#303134] overflow-hidden">
        {/* Subtle iridescent pastel ambient aura matching Google modern design */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-blue-100/40 via-purple-100/20 to-transparent dark:from-blue-950/20 dark:via-purple-950/10 pointer-events-none" />

        {/* Gear icon on bottom-left */}
        <button
          onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
          aria-label="Connection settings"
          className="relative z-10 p-1.5 rounded-full text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="Connection Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Stepper Navigation Dots (active blue pill + two dots) */}
        <div className="relative z-10 flex items-center gap-1.5">
          <button
            onClick={() => setActiveStep(0)}
            aria-label="Step 1"
            className={`transition-all duration-200 ${
              activeStep === 0
                ? 'w-7 h-2 rounded-full bg-[#1a73e8]'
                : 'w-2 h-2 rounded-full bg-[#dadce0] dark:bg-[#5f6368] hover:bg-neutral-400'
            }`}
          />
          <button
            onClick={() => setActiveStep(1)}
            aria-label="Step 2"
            className={`transition-all duration-200 ${
              activeStep === 1
                ? 'w-7 h-2 rounded-full bg-[#1a73e8]'
                : 'w-2 h-2 rounded-full bg-[#dadce0] dark:bg-[#5f6368] hover:bg-neutral-400'
            }`}
          />
          <button
            onClick={() => setActiveStep(2)}
            aria-label="Step 3"
            className={`transition-all duration-200 ${
              activeStep === 2
                ? 'w-7 h-2 rounded-full bg-[#1a73e8]'
                : 'w-2 h-2 rounded-full bg-[#dadce0] dark:bg-[#5f6368] hover:bg-neutral-400'
            }`}
          />
        </div>

        {/* Right side spacer for balance */}
        <div className="w-6 h-6" />
      </div>
    </div>
  );
};
