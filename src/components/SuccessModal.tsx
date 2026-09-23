import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Check, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/audio';

interface SuccessModalProps {
  isOpen: boolean;
  code: string;
  onEnterSystem: () => void;
  onReset: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  code,
  onEnterSystem,
  onReset,
}) => {
  useEffect(() => {
    if (isOpen) {
      sounds.playSuccess();

      // Confetti burst
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.65 },
          zIndex: 1000,
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
          colors: ['#10b981', '#3b82f6', '#f59e0b'],
        });
        fire(0.2, {
          spread: 60,
          colors: ['#10b981', '#6ee7b7', '#ffffff'],
        });
        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          colors: ['#fbbf24', '#38bdf8'],
        });
        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch {
        // Ignore if confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-pop-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100 text-center">
        {/* Decorative Top Pill Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-5 animate-bounce">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2 font-fredoka">
          Verification successful!
        </h2>

        {/* Subtitle / Code Display */}
        <p className="text-sm sm:text-base text-slate-600 mb-6">
          You hit the correct OTP:{' '}
          <span className="inline-block px-3 py-1 font-mono font-bold tracking-widest text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 ml-1">
            {code}
          </span>
        </p>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Authenticated as Drake Le. All session tokens verified.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onEnterSystem();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0d2149] hover:bg-[#163066] active:scale-[0.98] text-white font-bold text-base shadow-lg shadow-blue-950/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Enter System</span>
            <ArrowRight className="w-4 h-4 text-teal-300" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onReset();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Shoot Again / Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
