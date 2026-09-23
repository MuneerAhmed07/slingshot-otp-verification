import React from 'react';
import { sounds } from '../utils/audio';

interface AmmoBarProps {
  onSelectAmmo: (digit: string) => void;
  selectedAmmo: string | null;
  targetCode: string;
  activeSlotIndex: number;
}

export const AmmoBar: React.FC<AmmoBarProps> = ({
  onSelectAmmo,
  selectedAmmo,
  activeSlotIndex,
}) => {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const handleSelect = (digit: string) => {
    sounds.playReload();
    onSelectAmmo(digit);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 mt-0.5">
      <div className="bg-white/75 backdrop-blur-md border border-white/80 rounded-xl p-2 sm:p-2.5 shadow-md shadow-teal-900/5">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Ammo Reload (0–9)
          </span>
          <span className="text-[10px] text-slate-500">
            Tap to load slingshot · then pull to shoot
          </span>
        </div>

        {/* 10 ammo pellets in a single row */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {digits.map((digit) => {
            const isSelected = selectedAmmo === digit;

            return (
              <button
                key={digit}
                type="button"
                onClick={() => handleSelect(digit)}
                className={`group relative aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-150 transform active:scale-90 focus:outline-hidden ${
                  isSelected
                    ? 'ring-3 ring-amber-500 ring-offset-1 ring-offset-white scale-105 z-10 shadow-md shadow-amber-600/30'
                    : 'hover:-translate-y-0.5 hover:shadow-xs'
                }`}
                style={{
                  background: isSelected
                    ? 'radial-gradient(circle at 35% 30%, #fff0b3 0%, #ffbe42 50%, #d46500 100%)'
                    : 'radial-gradient(circle at 35% 30%, #ffd89b 0%, #ffaa42 50%, #c86800 100%)',
                  boxShadow: isSelected
                    ? '0 4px 8px -1px rgba(212, 101, 0, 0.45), inset 0 1.5px 2px rgba(255, 255, 255, 0.8), inset 0 -1.5px 3px rgba(0, 0, 0, 0.3)'
                    : '0 2px 4px -1px rgba(180, 80, 0, 0.3), inset 0 1.5px 2px rgba(255, 255, 255, 0.6), inset 0 -1.5px 3px rgba(0, 0, 0, 0.25)',
                }}
              >
                {/* 3D Highlight specular reflection */}
                <div className="absolute top-0.5 left-1 w-2.5 h-1.5 bg-white/65 rounded-full blur-[0.4px] pointer-events-none" />

                {/* Digit Text */}
                <span className={`text-base sm:text-lg font-black font-fredoka leading-none group-hover:scale-105 transition-transform ${
                  isSelected ? 'text-amber-950 scale-105' : 'text-amber-950'
                }`}>
                  {digit}
                </span>

                {/* Tag */}
                {isSelected ? (
                  <span className="absolute -bottom-1 px-1 text-[7px] font-black uppercase tracking-wider bg-amber-900 text-amber-100 rounded-xs leading-none shadow-2xs whitespace-nowrap pointer-events-none">
                    Load
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-1.5 pt-1 border-t border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500">
          <span>Loaded: <strong className="text-amber-900 font-bold font-mono">Ball #{selectedAmmo}</strong></span>
          <span>Targeting: <strong className="text-teal-800 font-bold">Box #{activeSlotIndex + 1}</strong></span>
        </div>
      </div>
    </div>
  );
};
