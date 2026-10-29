import React, { useState, useEffect, useRef } from 'react';
import {
  FolderCheck,
  Send,
  CheckCircle2,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown,
  Check
} from 'lucide-react';
import { GoogleWidget } from './GoogleWidget';

interface Scroll3DLetterJourneyProps {
  userEmail: string;
  isConnected: boolean;
  onConnect: (email: string, authMethod: 'google_oauth' | 'password', password?: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onSync: () => Promise<void>;
  isSyncing?: boolean;
  senderName: string;
  activePersonaTitle: string;
}

export const Scroll3DLetterJourney: React.FC<Scroll3DLetterJourneyProps> = ({
  userEmail,
  isConnected,
  onConnect,
  onDisconnect,
  onSync,
  isSyncing = false,
  senderName,
  activePersonaTitle
}) => {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isAutoFlying, setIsAutoFlying] = useState<boolean>(false);
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor window scroll and compute 3D altitude progress through container
  useEffect(() => {
    if (isDocked) {
      setScrollProgress(0);
      return;
    }

    const handleScroll = () => {
      if (isAutoFlying) return;
      if (!containerRef.current) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          const raw = window.scrollY / maxScroll;
          setScrollProgress(Math.min(Math.max(raw, 0), 1));
        }
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const totalDistance = Math.max(rect.height - 100, 200);
      const currentPassed = Math.max(0, -rect.top + 60);
      const ratio = Math.min(Math.max(currentPassed / totalDistance, 0), 1);
      setScrollProgress(ratio);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAutoFlying, isDocked]);

  // Cinematic Auto-Flight Simulation
  const triggerAutoFlight = () => {
    if (isAutoFlying) return;
    setIsDocked(false);
    setIsAutoFlying(true);
    setScrollProgress(0);
    const startTime = performance.now();
    const duration = 2200; // 2.2s flight

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth easeInOutCubic
      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setScrollProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => setIsAutoFlying(false), 600);
      }
    };

    requestAnimationFrame(animate);
  };

  // Interpolate 3D Transformations based on progress (0 to 1)
  const p = isDocked ? 0 : scrollProgress;

  // Track height and vertical glide
  const trackHeight = 520;
  const targetFolderMouth = 155; // Travels down toward folder pocket
  const translateY = p * targetFolderMouth;

  // 3D Rotations (Euler angles)
  const rotateX = p < 0.5 ? p * 22 : 11 + (p - 0.5) * 44; // Gentle lift to 33deg tilt into pocket
  const rotateY = Math.sin(p * Math.PI) * 12; // Subtle banking -12 to +12 deg
  const rotateZ = Math.sin(p * Math.PI * 1.4) * -6 * (1 - p * 0.6); // Aerodynamic drift
  const scale = 1 - p * 0.14; // 1.0 -> 0.86

  // Shadow depth
  const shadowBlur = Math.round(12 + Math.sin(p * Math.PI) * 28);
  const shadowY = Math.round(8 + Math.sin(p * Math.PI) * 22);
  const shadowOpacity = 0.18 - p * 0.08;

  // Folder insertion state
  const isInsideFolder = p >= 0.82;

  return (
    <div
      ref={containerRef}
      className="w-full bg-white dark:bg-[#242528] border border-[#e1e3e6] dark:border-[#333538] rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col gap-3.5 relative overflow-hidden font-['Outfit','Lexend',sans-serif]"
    >
      {/* Top Header Bar: Google Integration Widget + 3D Flight Controls */}
      <div className="flex items-center justify-between border-b border-[#f1f3f4] dark:border-[#333538] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8]">
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
          </div>
          <div>
            <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider font-['Lexend',sans-serif] flex items-center gap-2">
              <span>Google Integration Widget</span>
              <span className="text-[10px] font-normal lowercase tracking-normal text-neutral-400">
                (Scroll 3D to Archive Folder)
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Interactive Google Workspace connector • Managed by {activePersonaTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dock / 3D Mode Toggle */}
          <button
            onClick={() => setIsDocked(!isDocked)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition ${
              isDocked
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900'
                : 'bg-white dark:bg-[#28292c] text-neutral-600 dark:text-neutral-300 border-[#dadce0] dark:border-[#3c4043] hover:bg-neutral-50'
            }`}
            title="Toggle between 3D scrollable flight and stationary docked view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDocked ? 'Docked' : '3D Flight'}</span>
          </button>

          {/* Quick Cinematic Flight Preview Button */}
          {!isDocked && (
            <button
              onClick={triggerAutoFlight}
              disabled={isAutoFlying}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f0fe] dark:bg-blue-950/60 text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-blue-100 transition border border-blue-200 dark:border-blue-900 shadow-2xs active:scale-95 disabled:opacity-50"
              title="Watch Google Widget glide in 3D into archive folder"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isAutoFlying ? 'Flying...' : 'Fly to Folder'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Flight Altitude Scrubber (when in 3D mode) */}
      {!isDocked && (
        <div className="flex items-center gap-3 px-1">
          <span className="text-[11px] font-semibold text-neutral-400 shrink-0">Scroll Depth:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={scrollProgress}
            onChange={(e) => {
              setIsAutoFlying(false);
              setScrollProgress(parseFloat(e.target.value));
            }}
            className="w-full accent-[#1a73e8] cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
          />
          <span className="text-[11px] font-mono font-bold text-[#1a73e8] dark:text-[#8ab4f8] w-12 text-right">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      )}

      {/* 3D SCENE STAGE (Holds the Google Integration Widget at the top & Folder at the bottom) */}
      <div
        className="relative w-full rounded-2xl bg-gradient-to-b from-blue-50/30 via-white to-amber-50/20 dark:from-[#1b1c1e] dark:via-[#1e1f21] dark:to-[#17181a] border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden flex flex-col items-center justify-between"
        style={{
          minHeight: `${trackHeight}px`,
          perspective: isDocked ? 'none' : '1100px'
        }}
      >
        {/* Ambient grid lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 bg-[radial-gradient(#1a73e8_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* --- THE GOOGLE INTEGRATION WIDGET (BEHAVES AS 3D AND REACHES INTO FOLDER) --- */}
        <div
          className="absolute z-10 transition-transform duration-75 ease-out w-full flex justify-center px-2"
          style={{
            top: '14px',
            transform: isDocked
              ? 'none'
              : `translateY(${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
            transformOrigin: 'top center',
            boxShadow: isDocked
              ? 'none'
              : `0 ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`,
            willChange: 'transform'
          }}
        >
          {/* Google Integration Widget Container (Matches User Screenshot & Wire Logic) */}
          <div className="w-full max-w-[500px]">
            <GoogleWidget
              userEmail={userEmail}
              isConnected={isConnected}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onSync={onSync}
              isSyncing={isSyncing}
              isModal={false}
            />
          </div>
        </div>

        {/* --- THE 3D EXECUTIVE ARCHIVE FOLDER (Bottom Receptacle) --- */}
        <div
          className="absolute bottom-3 w-[360px] sm:w-[520px] h-[120px] select-none pointer-events-none"
          style={{ perspective: '800px' }}
        >
          {/* FOLDER BACK FLAP & TAB (z-index 0) */}
          <div className="absolute inset-0 bg-[#3b2d1d] dark:bg-[#1e160e] rounded-2xl border border-amber-900/60 shadow-lg flex flex-col justify-between overflow-hidden">
            {/* Top Index Tab */}
            <div className="absolute top-0 left-6 -translate-y-full bg-[#523d26] dark:bg-[#2d2115] text-amber-200 px-4 py-1 rounded-t-lg text-[9px] font-bold font-mono tracking-widest uppercase border-t border-x border-amber-800">
              📁 GOOGLE WORKSPACE ARCHIVE // ACTIVE
            </div>

            <div className="h-full w-full bg-gradient-to-b from-black/60 via-black/20 to-transparent p-3 text-[10px] font-mono text-amber-200/40">
              [CLASSIFIED DOSSIER RECEPTACLE]
            </div>
          </div>

          {/* FOLDER FRONT POCKET (z-index 20 - sits physically in front of widget when it descends) */}
          <div
            className={`absolute bottom-0 inset-x-0 h-[82px] bg-gradient-to-t from-[#4a3926] via-[#5c4630] to-[#6d543b] dark:from-[#241b12] dark:via-[#332519] dark:to-[#3e2e20] rounded-b-2xl rounded-t-lg border-t-2 border-amber-400/50 border-x border-b border-amber-950/80 shadow-2xl p-3 flex items-center justify-between z-20 transition-all duration-300 ${
              isInsideFolder ? 'ring-2 ring-emerald-500/50 shadow-emerald-900/30' : ''
            }`}
          >
            {/* Folder Front Detailing */}
            <div className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-[10px] font-bold font-mono text-amber-200 tracking-wider">
                  GODFATHER ARCHIVES • BOX #01
                </span>
              </div>
              <div className="text-[9px] font-mono text-amber-300/80 flex items-center gap-1.5">
                {isInsideFolder ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-3 h-3" /> GOOGLE MAILBOX WIRED & ARCHIVED // 24/7 ACTIVE
                  </span>
                ) : (
                  <span>Awaiting scroll descent to file into archive...</span>
                )}
              </div>
            </div>

            {/* Folder Golden Seal */}
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm font-bold border transition-all duration-300 ${
                  isInsideFolder
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 border-emerald-300 text-white shadow-md'
                    : 'bg-gradient-to-tr from-[#785429] to-[#b38241] border-amber-300/60 text-amber-100 shadow-sm'
                }`}
              >
                {isInsideFolder ? '✓' : 'G'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
