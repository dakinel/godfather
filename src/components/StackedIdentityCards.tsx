import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Check,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { IdentityIllustration, IdentityType } from './IdentityIllustrations';
import { PERSONA_IDENTITIES, PersonaIdentity } from '../lib/identities';

interface StackedIdentityCardsProps {
  selectedIdentity: IdentityType;
  onSelectIdentity: (identity: PersonaIdentity) => void;
  onTestIdentity: (identity: PersonaIdentity) => void;
  isTesting?: boolean;
}

export const StackedIdentityCards: React.FC<StackedIdentityCardsProps> = ({
  selectedIdentity,
  onSelectIdentity,
  onTestIdentity,
  isTesting = false
}) => {
  const cardKeys: IdentityType[] = ['builder', 'doctor', 'teacher'];

  // Track rotational angle
  const [rotationAngle, setRotationAngle] = useState<number>(() => {
    const idx = cardKeys.indexOf(selectedIdentity);
    return idx >= 0 ? -idx * 120 : 0;
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number>(0);
  const dragStartAngle = useRef<number>(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Active card index closest to 0 degrees
  const normalizedAngle = ((rotationAngle % 360) + 360) % 360;
  const activeIndex = Math.round((360 - normalizedAngle) / 120) % 3;
  const activeCardId = cardKeys[activeIndex];

  // Snap to nearest 120 deg increment
  const snapToNearest = useCallback((targetAngle: number) => {
    const nearestMultiple = Math.round(targetAngle / 120) * 120;
    setRotationAngle(nearestMultiple);
  }, []);

  // Handle Mouse Wheel Scroll
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const sensitivity = 0.4;

    setRotationAngle((prev) => prev - delta * sensitivity);

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setRotationAngle((curr) => Math.round(curr / 120) * 120);
    }, 160);
  };

  const rotateNext = () => {
    setRotationAngle((prev) => Math.round(prev / 120) * 120 - 120);
  };

  const rotatePrev = () => {
    setRotationAngle((prev) => Math.round(prev / 120) * 120 + 120);
  };

  const rotateToCard = (id: IdentityType) => {
    const targetIdx = cardKeys.indexOf(id);
    if (targetIdx === -1) return;

    setRotationAngle((prev) => {
      const currentSnap = Math.round(prev / 120) * 120;
      const currentNormalized = ((currentSnap % 360) + 360) % 360;
      const currentIdx = Math.round((360 - currentNormalized) / 120) % 3;

      let diff = targetIdx - currentIdx;
      if (diff > 1) diff -= 3;
      if (diff < -1) diff += 3;

      return currentSnap - diff * 120;
    });
  };

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartAngle.current = rotationAngle;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    setRotationAngle(dragStartAngle.current + dx * 0.55);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      snapToNearest(rotationAngle);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartAngle.current = rotationAngle;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - dragStartX.current;
    setRotationAngle(dragStartAngle.current + dx * 0.55);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      snapToNearest(rotationAngle);
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center font-['Outfit','Lexend',sans-serif] select-none">
      {/* 3D Scrollable Rotational Card Stage */}
      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full py-6 flex flex-col items-center justify-center min-h-[460px] cursor-grab active:cursor-grabbing overflow-hidden"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative w-[300px] sm:w-[320px] h-[410px] flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {cardKeys.map((id, index) => {
            const identity = PERSONA_IDENTITIES[id];
            const isEquipped = selectedIdentity === id;

            // Compute angle on cylinder
            const baseAngle = index * 120;
            let relAngle = (baseAngle + rotationAngle) % 360;
            if (relAngle > 180) relAngle -= 360;
            if (relAngle < -180) relAngle += 360;

            const radius = 230;
            const rad = (relAngle * Math.PI) / 180;
            const xPos = Math.sin(rad) * radius;
            const zPos = Math.cos(rad) * radius - radius;
            const scale = 0.84 + 0.16 * ((Math.cos(rad) + 1) / 2);
            const opacity = 0.4 + 0.6 * Math.max(0, Math.cos(rad));
            const rotateY = relAngle * 0.7;
            const zIndex = Math.round(100 + 100 * Math.cos(rad));
            const isFacingFront = Math.abs(relAngle) < 55;

            return (
              <div
                key={id}
                onClick={() => {
                  if (!isFacingFront) rotateToCard(id);
                }}
                className="absolute inset-0 transition-transform duration-150 ease-out will-change-transform"
                style={{
                  transform: `translate3d(${xPos}px, 0px, ${zPos}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  filter: isFacingFront ? 'none' : 'blur(0.5px)',
                  cursor: isFacingFront ? 'default' : 'pointer'
                }}
              >
                {/* Ultra-Clean Minimal Premium Card */}
                <div
                  className={`relative w-full h-full rounded-3xl p-5 flex flex-col justify-between border transition-all duration-300 backdrop-blur-xl ${
                    isEquipped
                      ? 'border-amber-400/70 bg-[#16171a] dark:bg-[#141518] shadow-[0_20px_50px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/40'
                      : isFacingFront
                      ? 'border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-[#18191c]/95 shadow-xl'
                      : 'border-neutral-200/50 dark:border-neutral-800/60 bg-white/70 dark:bg-[#141517]/80 shadow-md'
                  }`}
                >
                  {/* Subtle top header: Minimal Tag & Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border"
                      style={{
                        backgroundColor: `${identity.themeColor}15`,
                        borderColor: `${identity.themeColor}35`,
                        color: identity.themeColor
                      }}
                    >
                      {identity.subtitle}
                    </span>

                    {isEquipped ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Persona
                      </span>
                    )}
                  </div>

                  {/* Clean Illustration Art Window */}
                  <div className="relative my-auto flex flex-col items-center justify-center py-2">
                    {/* Ambient Glow */}
                    <div
                      className="absolute w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
                      style={{ backgroundColor: identity.themeColor }}
                    />
                    <div className="relative z-10 scale-[0.88] origin-center">
                      <IdentityIllustration type={identity.id} size="sm" />
                    </div>
                  </div>

                  {/* Typography & Distilled Persona Statement */}
                  <div className="text-center my-1">
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white font-['Lexend',sans-serif]">
                      {identity.title}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed px-1">
                      {identity.tagline}
                    </p>
                  </div>

                  {/* Refined Minimal Action Bar */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIdentity(identity);
                      }}
                      className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                        isEquipped
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'hover:opacity-95 text-white active:scale-[0.98]'
                      }`}
                      style={
                        !isEquipped
                          ? { backgroundColor: identity.themeColor }
                          : {}
                      }
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Equipped</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Equip {identity.title}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestIdentity(identity);
                      }}
                      disabled={isTesting}
                      title={`Simulate an email with ${identity.title}`}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition active:scale-95"
                    >
                      <PlayCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Minimal Footer: Refined Stepper Dots & Soft Arrow Controls */}
      <div className="flex items-center gap-4 mt-1">
        <button
          onClick={rotatePrev}
          aria-label="Previous identity"
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 3 Minimal Carousel Dots */}
        <div className="flex items-center gap-2">
          {cardKeys.map((id, index) => {
            const isFront = activeIndex === index;
            return (
              <button
                key={id}
                onClick={() => rotateToCard(id)}
                aria-label={`Switch to card ${index + 1}`}
                className={`transition-all duration-200 rounded-full ${
                  isFront
                    ? 'w-6 h-1.5 bg-neutral-900 dark:bg-white'
                    : 'w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                }`}
              />
            );
          })}
        </div>

        <button
          onClick={rotateNext}
          aria-label="Next identity"
          className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
        Scroll or drag to rotate personas
      </div>
    </div>
  );
};
