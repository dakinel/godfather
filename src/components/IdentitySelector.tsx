import React from 'react';
import { Sparkles, Check, PlayCircle, ShieldCheck } from 'lucide-react';
import { IdentityIllustration, IdentityType } from './IdentityIllustrations';
import { PERSONA_IDENTITIES, PersonaIdentity } from '../lib/identities';

interface IdentitySelectorProps {
  selectedIdentity: IdentityType;
  onSelectIdentity: (identity: PersonaIdentity) => void;
  onTestIdentity: (identity: PersonaIdentity) => void;
  isTesting?: boolean;
}

export const IdentitySelector: React.FC<IdentitySelectorProps> = ({
  selectedIdentity,
  onSelectIdentity,
  onTestIdentity,
  isTesting = false
}) => {
  const identitiesList = Object.values(PERSONA_IDENTITIES);

  return (
    <div className="w-full flex flex-col gap-3 font-['Outfit','Lexend',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-['Lexend',sans-serif] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fbbc04]" />
            <span>3 Signature Executive Identities</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Select your agent's persona. Your bot immediately adopts their visual identity, tone, and decision rules.
          </p>
        </div>
        <div className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 self-start sm:self-auto">
          Minimal & Zero Filler
        </div>
      </div>

      {/* 3 Identity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {identitiesList.map((identity) => {
          const isSelected = selectedIdentity === identity.id;

          return (
            <div
              key={identity.id}
              onClick={() => onSelectIdentity(identity)}
              className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-white dark:bg-[#202124] shadow-md ring-2 ring-blue-500/20 ' + identity.accentBorder
                  : 'bg-white/70 dark:bg-[#222427]/70 border-[#e1e3e6] dark:border-[#333538] hover:bg-white dark:hover:bg-[#26282b] hover:border-neutral-300 dark:hover:border-neutral-600'
              }`}
            >
              {/* Active Badge */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${identity.badgeBg}`}
                >
                  {identity.subtitle}
                </span>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-[#1a73e8] text-white shadow-xs'
                      : 'border border-neutral-300 dark:border-neutral-600 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Character Illustration Visual */}
              <div className="h-[120px] w-full flex items-center justify-center my-1 select-none pointer-events-none">
                <IdentityIllustration type={identity.id} size="sm" />
              </div>

              {/* Title & Tagline */}
              <div className="mt-2 text-center">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-['Lexend',sans-serif]">
                  {identity.title}
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                  {identity.tagline}
                </p>
              </div>

              {/* Voice Sample Quote */}
              <div className="mt-3 p-2 rounded-xl bg-neutral-50 dark:bg-[#1a1b1d] border border-neutral-200/80 dark:border-neutral-800 text-[10.5px] italic text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-snug text-center">
                {identity.voiceSample}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIdentity(identity);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition text-center ${
                    isSelected
                      ? 'bg-[#1a73e8] text-white shadow-2xs'
                      : 'bg-[#f1f3f4] dark:bg-[#2d2f31] text-neutral-700 dark:text-neutral-200 hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
                  }`}
                >
                  {isSelected ? 'Active Persona' : 'Choose Persona'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTestIdentity(identity);
                  }}
                  disabled={isTesting}
                  title={`Test ${identity.title} with a sample email`}
                  className="p-1.5 rounded-full text-neutral-500 hover:text-[#1a73e8] hover:bg-[#e8f0fe] dark:hover:bg-blue-950/50 border border-neutral-200 dark:border-neutral-700 transition"
                >
                  <PlayCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
