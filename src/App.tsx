import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BackgroundSky } from './components/BackgroundSky';
import { HeaderCard } from './components/HeaderCard';
import { SlingshotArena } from './components/SlingshotArena';
import { AmmoBar } from './components/AmmoBar';
import { SuccessModal } from './components/SuccessModal';
import { DashboardView } from './components/DashboardView';
import { sounds } from './utils/audio';

export default function App() {
  const TARGET_OTP = '150787';

  // 6 digit slots state
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [aimedSlotIndex, setAimedSlotIndex] = useState<number | null>(null);
  const [selectedAmmo, setSelectedAmmo] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);
  const [lastHitSlot, setLastHitSlot] = useState<number | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [isSystemEntered, setIsSystemEntered] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // References to the 6 slot DOM elements for accurate trajectory aiming
  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null, null]);

  // Sync sound toggle with sound engine
  const handleToggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    sounds.enabled = next;
  };

  // When a digit projectile hits a slot after user pulls & releases
  const handleDigitFired = useCallback((digit: string, slotIndex: number) => {
    setError(null);
    setLastHitSlot(slotIndex);

    setSlots((prev) => {
      const updated = [...prev];
      updated[slotIndex] = digit;

      // Find next empty slot
      const nextEmpty = updated.findIndex((s) => s === null);
      if (nextEmpty !== -1) {
        setActiveSlotIndex(nextEmpty);
        // Pre-load next target code digit into slingshot for convenience
        if (nextEmpty < TARGET_OTP.length) {
          setSelectedAmmo(TARGET_OTP[nextEmpty]);
        }
      }

      return updated;
    });

    // Reset last hit animation trigger after brief delay
    setTimeout(() => {
      setLastHitSlot(null);
    }, 400);
  }, [TARGET_OTP]);

  // Select/Reload ammo into slingshot
  const handleSelectAmmo = useCallback((digit: string) => {
    setSelectedAmmo(digit);
    setError(null);
  }, []);

  // Clear single slot
  const handleClearSlot = (index: number) => {
    setError(null);
    setSlots((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setActiveSlotIndex(index);
  };

  // Reset all slots
  const handleResetAll = () => {
    sounds.playClick();
    setSlots([null, null, null, null, null, null]);
    setActiveSlotIndex(0);
    setAimedSlotIndex(null);
    setSelectedAmmo(TARGET_OTP[0]);
    setError(null);
    setIsSuccessModalOpen(false);
    setIsSystemEntered(false);
  };

  // Validate OTP code on "Connect" click
  const handleSubmit = () => {
    sounds.playClick();
    const enteredCode = slots.map((s) => (s !== null ? s : '')).join('');

    if (enteredCode.length < 6) {
      setError('Please shoot all 6 digits to complete the code!');
      sounds.playError();
      return;
    }

    if (enteredCode === TARGET_OTP) {
      setError(null);
      setIsSuccessModalOpen(true);
    } else {
      setError('Incorrect, try again!');
      sounds.playError();
    }
  };

  // Keyboard shortcut support (0-9 to reload into slingshot, Backspace to delete, Enter to connect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccessModalOpen || isSystemEntered) return;

      if (/^[0-9]$/.test(e.key)) {
        sounds.playReload();
        handleSelectAmmo(e.key);
      } else if (e.key === 'Backspace') {
        if (slots[activeSlotIndex] !== null) {
          handleClearSlot(activeSlotIndex);
        } else {
          for (let i = activeSlotIndex - 1; i >= 0; i--) {
            if (slots[i] !== null) {
              handleClearSlot(i);
              break;
            }
          }
        }
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlotIndex, slots, isSuccessModalOpen, isSystemEntered, handleSelectAmmo]);

  return (
    <div className="relative h-screen h-dvh max-h-screen w-full flex flex-col justify-between py-1 px-2 select-none overflow-hidden">
      {/* Sky background with subtle airplane silhouette and floating clouds */}
      <BackgroundSky />

      {/* Main Content Area - zero scroll layout */}
      <main className="w-full flex-1 flex flex-col items-center justify-between max-w-lg mx-auto overflow-hidden z-10">
        {isSystemEntered ? (
          <DashboardView
            otpCode={slots.join('') || TARGET_OTP}
            onBackToVerification={handleResetAll}
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-between items-center py-0.5">
            {/* 1. Header Card with Sub-header, Title, Subtitle, 6 slots & Connect button */}
            <HeaderCard
              slots={slots}
              activeSlotIndex={activeSlotIndex}
              aimedSlotIndex={aimedSlotIndex}
              onSelectSlot={setActiveSlotIndex}
              onClearSlot={handleClearSlot}
              onResetAll={handleResetAll}
              onSubmit={handleSubmit}
              error={error}
              targetCode={TARGET_OTP}
              isSoundEnabled={isSoundEnabled}
              onToggleSound={handleToggleSound}
              slotRefs={slotRefs}
              lastHitSlot={lastHitSlot}
            />

            {/* 2. Slingshot Arena with rubber band physics, trajectory, and ammo in pouch */}
            <SlingshotArena
              loadedDigit={selectedAmmo}
              onDigitFired={handleDigitFired}
              activeSlotIndex={activeSlotIndex}
              aimedSlotIndex={aimedSlotIndex}
              onAimSlotChange={setAimedSlotIndex}
              slotRefs={slotRefs}
              onSelectSlot={setActiveSlotIndex}
            />

            {/* 3. Horizontal ammo bar with 0-9 digits for reloading slingshot */}
            <AmmoBar
              onSelectAmmo={handleSelectAmmo}
              selectedAmmo={selectedAmmo}
              targetCode={TARGET_OTP}
              activeSlotIndex={activeSlotIndex}
            />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-lg mx-auto py-0.5 text-center text-[10px] text-slate-500/80 leading-none z-10">
        <span>Slingshot Ballistic OTP · Angry Birds Physics Simulation</span>
      </footer>

      {/* Success Modal Overlay */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        code={slots.join('') || TARGET_OTP}
        onEnterSystem={() => {
          setIsSuccessModalOpen(false);
          setIsSystemEntered(true);
        }}
        onReset={handleResetAll}
      />
    </div>
  );
}
