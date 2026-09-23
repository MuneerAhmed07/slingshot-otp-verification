import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Delete } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderCardProps {
  slots: (string | null)[];
  activeSlotIndex: number;
  aimedSlotIndex: number | null;
  onSelectSlot: (index: number) => void;
  onClearSlot: (index: number) => void;
  onResetAll: () => void;
  onSubmit: () => void;
  error: string | null;
  targetCode: string;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  lastHitSlot: number | null;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  slots,
  activeSlotIndex,
  aimedSlotIndex,
  onSelectSlot,
  onClearSlot,
  onResetAll,
  onSubmit,
  error,
  targetCode,
  isSoundEnabled,
  onToggleSound,
  slotRefs,
  lastHitSlot,
}) => {
  const [showHint, setShowHint] = React.useState<boolean>(false);

  return (
    <div className="w-full max-w-lg mx-auto px-2">
      {/* Top action bar: Hint & Sound toggle */}
      <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/70 backdrop-blur-md border border-white/60 rounded-full shadow-2xs text-slate-700 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verification Portal
          </span>
          <button
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 hover:bg-white/80 rounded-md text-slate-600 hover:text-slate-900 transition-colors text-[10px]"
            title="Toggle OTP code hint"
          >
            <HelpCircle className="w-3 h-3 text-teal-700" />
            <span>{showHint ? `Target: ${targetCode}` : 'Show Hint'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onResetAll}
            className="p-1 bg-white/60 hover:bg-white/90 text-slate-600 hover:text-slate-900 rounded-md transition-colors"
            title="Reset all slots"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleSound}
            className="p-1 bg-white/60 hover:bg-white/90 text-slate-600 hover:text-slate-900 rounded-md transition-colors"
            title={isSoundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {isSoundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-teal-700" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Card (Compact Viewport Fit) */}
      <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl p-3 sm:p-4 shadow-lg shadow-teal-900/5 text-center relative transition-all">
        {/* Sub-header */}
        <p className="text-[10px] font-bold tracking-wider text-teal-800 uppercase mb-0.5">
          GET PASSWORD
        </p>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-black text-[#0d2149] tracking-tight mb-0.5 font-fredoka">
          OTP Verification
        </h1>

        {/* Subtitle */}
        <p className="text-[11px] sm:text-xs text-slate-600 max-w-sm mx-auto leading-snug mb-2 font-normal line-clamp-1 sm:line-clamp-none">
          Hi <span className="font-semibold text-slate-900">Drake Le</span>, shoot each digit slot to complete the code.
        </p>

        {/* 6 Input Boxes */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
          {slots.map((digit, idx) => {
            const isFilled = digit !== null;
            const isAimed = aimedSlotIndex === idx;
            const isActive = !aimedSlotIndex && activeSlotIndex === idx;
            const isLastHit = lastHitSlot === idx;

            return (
              <div
                key={idx}
                ref={(el) => {
                  slotRefs.current[idx] = el;
                }}
                onClick={() => {
                  sounds.playClick();
                  onSelectSlot(idx);
                }}
                className={`group relative w-10 h-12 sm:w-11 sm:h-13 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 select-none ${
                  isAimed
                    ? 'bg-amber-50 text-amber-950 border-2 border-amber-500 shadow-md shadow-amber-500/30 ring-3 ring-amber-400/40 scale-105 z-20'
                    : isFilled
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-xs shadow-emerald-500/25 border border-emerald-400'
                    : isActive
                    ? 'bg-white text-slate-800 border-2 border-teal-500 shadow-xs shadow-teal-500/20 ring-3 ring-teal-400/20'
                    : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-400 border border-slate-200/80 hover:border-slate-300'
                } ${isLastHit ? 'animate-pop-in' : ''}`}
              >
                {/* Aiming Reticle Badge */}
                {isAimed && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1 py-0.1 bg-amber-500 text-white text-[8px] font-black rounded-full uppercase tracking-wider shadow-xs flex items-center gap-0.5 whitespace-nowrap animate-bounce pointer-events-none">
                    🎯 Aim
                  </span>
                )}

                {/* Slot index indicator in top corner */}
                <span className={`absolute top-0.5 left-1 text-[9px] font-mono leading-none ${
                  isAimed ? 'text-amber-700 font-bold' : isFilled ? 'text-emerald-200/80' : 'text-slate-400'
                }`}>
                  #{idx + 1}
                </span>

                {/* Digit content */}
                {isFilled ? (
                  <span className={`text-xl sm:text-2xl font-black tracking-tight font-fredoka leading-none ${isAimed ? 'text-amber-900' : ''}`}>
                    {digit}
                  </span>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    {isAimed ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    ) : isActive ? (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    ) : (
                      <span className="text-base font-bold leading-none text-slate-300">
                        •
                      </span>
                    )}
                  </div>
                )}

                {/* Hover clear button if filled */}
                {isFilled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      onClearSlot(idx);
                    }}
                    title="Clear digit"
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-xs hover:scale-110"
                  >
                    <span className="text-[10px] leading-none font-bold">×</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Error Badge */}
        {error && (
          <div className="animate-shake mb-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {error}
          </div>
        )}

        {/* Submit & Backspace Row */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onSubmit}
            className="w-44 sm:w-56 py-2 px-4 rounded-xl bg-[#0d2149] hover:bg-[#163066] active:scale-[0.98] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-blue-950/20 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Connect</span>
            <svg
              className="w-3.5 h-3.5 text-teal-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              for (let i = slots.length - 1; i >= 0; i--) {
                if (slots[i] !== null) {
                  onClearSlot(i);
                  onSelectSlot(i);
                  return;
                }
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-[11px] font-semibold transition-colors flex items-center gap-1"
            title="Backspace previous digit"
          >
            <Delete className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Active Target Helper Tip */}
        <div className="mt-1.5 text-[10px] text-slate-500 flex items-center justify-center gap-1">
          {aimedSlotIndex !== null ? (
            <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
              <span>🎯 Aiming:</span>
              <span className="font-extrabold text-amber-900">Box #{aimedSlotIndex + 1}</span>
            </span>
          ) : (
            <>
              <span>Targeting:</span>
              <span className="font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200">
                Box {activeSlotIndex + 1}
              </span>
              <span className="text-slate-300">·</span>
              <span>Pull slingshot to aim</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
