import React, { useState, useRef, useEffect, useCallback } from 'react';
import { sounds } from '../utils/audio';

interface SlingshotArenaProps {
  loadedDigit: string;
  onDigitFired: (digit: string, slotIndex: number) => void;
  activeSlotIndex: number;
  aimedSlotIndex: number | null;
  onAimSlotChange: (index: number | null) => void;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onSelectSlot: (index: number) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface FlyingProjectile {
  digit: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetSlot: number;
  startTime: number;
  duration: number;
  cpX: number;
  cpY: number;
}

export const SlingshotArena: React.FC<SlingshotArenaProps> = ({
  loadedDigit,
  onDigitFired,
  activeSlotIndex,
  aimedSlotIndex,
  onAimSlotChange,
  slotRefs,
  onSelectSlot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dimensions (optimized for zero scroll)
  const [arenaWidth, setArenaWidth] = useState<number>(460);
  const [arenaHeight, setArenaHeight] = useState<number>(200);

  // Scaled Slingshot Geometry
  const forkCenter = { x: arenaWidth / 2, y: Math.max(130, arenaHeight - 40) };
  const leftProng = { x: forkCenter.x - 38, y: forkCenter.y - 58 };
  const rightProng = { x: forkCenter.x + 38, y: forkCenter.y - 58 };
  const restY = forkCenter.y - 42;

  // Pouch & Pull State
  const [pouchPos, setPouchPos] = useState<{ x: number; y: number }>({
    x: arenaWidth / 2,
    y: restY,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeAmmoDigit, setActiveAmmoDigit] = useState<string>(loadedDigit || '1');
  const [isReloadAnimating, setIsReloadAnimating] = useState<boolean>(false);

  // Trajectory prediction points
  const [trajectoryDots, setTrajectoryDots] = useState<
    { x: number; y: number; opacity: number; isApex?: boolean }[]
  >([]);

  // Projectile state
  const [flyingProjectile, setFlyingProjectile] = useState<FlyingProjectile | null>(null);
  const [projectilePos, setProjectilePos] = useState<{
    x: number;
    y: number;
    scale: number;
    rotation: number;
  } | null>(null);

  // Particles
  const [particles, setParticles] = useState<Particle[]>([]);

  // Particle spawner
  const spawnParticles = useCallback(
    (
      x: number,
      y: number,
      count: number = 10,
      colors: string[] = ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8']
    ) => {
      const newParticles: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.6 + Math.random() * 3.8;
        newParticles.push({
          id: Math.random(),
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 3.5,
          alpha: 1,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    },
    []
  );

  // Reload bounce effect
  useEffect(() => {
    if (loadedDigit) {
      setActiveAmmoDigit(loadedDigit);
      setIsReloadAnimating(true);
      spawnParticles(arenaWidth / 2, restY, 5, ['#fbbf24', '#f59e0b', '#ffffff']);
      const timer = setTimeout(() => setIsReloadAnimating(false), 380);
      return () => clearTimeout(timer);
    }
  }, [loadedDigit, arenaWidth, restY, spawnParticles]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setArenaWidth(rect.width);
        setArenaHeight(Math.max(170, Math.min(230, rect.height)));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update rest position on resize
  useEffect(() => {
    if (!isDragging && !flyingProjectile) {
      setPouchPos({ x: arenaWidth / 2, y: restY });
    }
  }, [arenaWidth, isDragging, flyingProjectile, restY]);

  // Particle loop
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.2,
            alpha: p.alpha - 0.055,
          }))
          .filter((p) => p.alpha > 0)
      );
    }, 24);
    return () => clearInterval(interval);
  }, [particles]);

  // Get real target coordinates of slot
  const getSlotTargetCoordinates = useCallback(
    (slotIdx: number) => {
      const container = containerRef.current;
      const slotEl = slotRefs.current[slotIdx];
      if (container && slotEl) {
        const cRect = container.getBoundingClientRect();
        const sRect = slotEl.getBoundingClientRect();
        return {
          x: sRect.left + sRect.width / 2 - cRect.left,
          y: sRect.top + sRect.height / 2 - cRect.top,
        };
      }
      const totalSlots = 6;
      const slotSpacing = Math.min(50, arenaWidth / 7);
      const startX = arenaWidth / 2 - ((totalSlots - 1) * slotSpacing) / 2;
      return {
        x: startX + slotIdx * slotSpacing,
        y: -40,
      };
    },
    [arenaWidth, slotRefs]
  );

  // Aiming & Trajectory
  const calculateAimAndTrajectory = useCallback(
    (pX: number, pY: number) => {
      const currentRestX = arenaWidth / 2;
      const pullX = currentRestX - pX;
      const pullY = restY - pY;
      const pullDist = Math.hypot(pullX, pullY);

      if (pullDist < 10) {
        setTrajectoryDots([]);
        onAimSlotChange(null);
        return;
      }

      const launchAngle = Math.atan2(pullY, pullX);

      const slotCoords = [0, 1, 2, 3, 4, 5].map((i) => ({
        index: i,
        ...getSlotTargetCoordinates(i),
      }));

      let bestSlot = activeSlotIndex;
      let minDiff = Infinity;

      slotCoords.forEach((slot) => {
        const slotAngle = Math.atan2(slot.y - restY, slot.x - currentRestX);
        const diff = Math.abs(launchAngle - slotAngle);
        if (diff < minDiff) {
          minDiff = diff;
          bestSlot = slot.index;
        }
      });

      onAimSlotChange(bestSlot);

      const target = slotCoords[bestSlot];
      const apexY = Math.min(pY, target.y) - Math.min(70, pullDist * 0.85);
      const apexX = (pX + target.x) / 2;

      const dots: { x: number; y: number; opacity: number; isApex?: boolean }[] = [];
      const numDots = 11;

      for (let i = 1; i <= numDots; i++) {
        const t = i / numDots;
        const oneMinusT = 1 - t;
        const dotX =
          oneMinusT * oneMinusT * pX +
          2 * oneMinusT * t * apexX +
          t * t * target.x;
        const dotY =
          oneMinusT * oneMinusT * pY +
          2 * oneMinusT * t * apexY +
          t * t * target.y;

        dots.push({
          x: dotX,
          y: dotY,
          opacity: 0.25 + t * 0.75,
          isApex: i === numDots,
        });
      }

      setTrajectoryDots(dots);
    },
    [arenaWidth, restY, activeSlotIndex, getSlotTargetCoordinates, onAimSlotChange]
  );

  // Drag Start
  const handleStart = (clientX: number, clientY: number) => {
    if (flyingProjectile) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const currentRestX = arenaWidth / 2;
    const distToPouch = Math.hypot(x - currentRestX, y - restY);

    if (distToPouch < 75) {
      setIsDragging(true);
      sounds.playStretch(0.3);
    }
  };

  // Drag Move
  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;

      const currentRestX = arenaWidth / 2;
      const maxPull = 75;

      let dx = rawX - currentRestX;
      let dy = rawY - restY;

      if (dy < -8) dy = -8;

      const dist = Math.hypot(dx, dy);
      if (dist > maxPull) {
        const angle = Math.atan2(dy, dx);
        dx = Math.cos(angle) * maxPull;
        dy = Math.sin(angle) * maxPull;
      }

      const newX = currentRestX + dx;
      const newY = restY + dy;

      setPouchPos({ x: newX, y: newY });
      calculateAimAndTrajectory(newX, newY);

      if (Math.random() < 0.12) {
        sounds.playStretch(dist / maxPull);
      }
    },
    [isDragging, arenaWidth, restY, calculateAimAndTrajectory]
  );

  // Drag Release
  const handleRelease = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setTrajectoryDots([]);

    const currentRestX = arenaWidth / 2;
    const pullDist = Math.hypot(pouchPos.x - currentRestX, pouchPos.y - restY);

    if (pullDist < 14) {
      setPouchPos({ x: currentRestX, y: restY });
      onAimSlotChange(null);
      return;
    }

    const targetSlot = aimedSlotIndex !== null ? aimedSlotIndex : activeSlotIndex;
    onSelectSlot(targetSlot);
    onAimSlotChange(null);

    sounds.playTwang();
    sounds.playWhoosh();

    setPouchPos({ x: currentRestX, y: restY });
    spawnParticles(currentRestX, restY, 6, ['#ffffff', '#fef3c7', '#d97706']);

    const targetCoord = getSlotTargetCoordinates(targetSlot);
    const apexY = Math.min(pouchPos.y, targetCoord.y) - Math.min(75, pullDist * 0.85);
    const apexX = (pouchPos.x + targetCoord.x) / 2;

    setFlyingProjectile({
      digit: activeAmmoDigit,
      startX: pouchPos.x,
      startY: pouchPos.y,
      targetX: targetCoord.x,
      targetY: targetCoord.y,
      targetSlot,
      startTime: performance.now(),
      duration: 580,
      cpX: apexX,
      cpY: apexY,
    });
  }, [
    isDragging,
    pouchPos,
    arenaWidth,
    restY,
    aimedSlotIndex,
    activeSlotIndex,
    activeAmmoDigit,
    getSlotTargetCoordinates,
    onAimSlotChange,
    onSelectSlot,
    spawnParticles,
  ]);

  // Global listeners
  useEffect(() => {
    const onWindowMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY);
    };
    const onWindowMouseUp = () => {
      if (isDragging) handleRelease();
    };
    const onWindowTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onWindowTouchEnd = () => {
      if (isDragging) handleRelease();
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    window.addEventListener('touchmove', onWindowTouchMove, { passive: true });
    window.addEventListener('touchend', onWindowTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      window.removeEventListener('touchmove', onWindowTouchMove);
      window.removeEventListener('touchend', onWindowTouchEnd);
    };
  }, [isDragging, handleMove, handleRelease]);

  // Projectile Flight Loop
  useEffect(() => {
    if (!flyingProjectile) {
      setProjectilePos(null);
      return;
    }

    let animationFrameId: number;

    const updateFlight = () => {
      const now = performance.now();
      const elapsed = now - flyingProjectile.startTime;
      const progress = Math.min(1, elapsed / flyingProjectile.duration);

      const t = progress;
      const oneMinusT = 1 - t;

      const currentX =
        oneMinusT * oneMinusT * flyingProjectile.startX +
        2 * oneMinusT * t * flyingProjectile.cpX +
        t * t * flyingProjectile.targetX;

      const currentY =
        oneMinusT * oneMinusT * flyingProjectile.startY +
        2 * oneMinusT * t * flyingProjectile.cpY +
        t * t * flyingProjectile.targetY;

      const rotation = t * 450;
      const scale = 1.1 - t * 0.15;

      setProjectilePos({ x: currentX, y: currentY, scale, rotation });

      if (Math.random() < 0.4) {
        spawnParticles(currentX, currentY, 2, ['#fbbf24', '#ffffff', '#38bdf8']);
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateFlight);
      } else {
        sounds.playPop(1.1);
        spawnParticles(flyingProjectile.targetX, flyingProjectile.targetY, 14, [
          '#10b981',
          '#34d399',
          '#fbbf24',
          '#ffffff',
        ]);

        const shotDigit = flyingProjectile.digit;
        const shotSlot = flyingProjectile.targetSlot;

        setFlyingProjectile(null);
        setProjectilePos(null);

        onDigitFired(shotDigit, shotSlot);
      }
    };

    animationFrameId = requestAnimationFrame(updateFlight);
    return () => cancelAnimationFrame(animationFrameId);
  }, [flyingProjectile, onDigitFired, spawnParticles]);

  const currentRestX = arenaWidth / 2;
  const cx = currentRestX;
  const cy = forkCenter.y;
  const lProng = leftProng;
  const rProng = rightProng;

  const pullDist = Math.hypot(pouchPos.x - currentRestX, pouchPos.y - restY);
  const bandThickness = Math.max(2.8, 4.5 - (pullDist / 80) * 1.8);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-lg mx-auto h-44 sm:h-52 select-none overflow-visible flex items-center justify-center my-0.5"
      style={{ touchAction: 'none' }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
    >
      {/* Real-time Aim Banner */}
      {isDragging && aimedSlotIndex !== null && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-amber-950 font-black text-[11px] rounded-full shadow-lg pointer-events-none flex items-center gap-1 border border-amber-300 animate-pulse z-30">
          <span>🎯</span>
          <span>Targeting Box #{aimedSlotIndex + 1} — Release to Shoot!</span>
        </div>
      )}

      {/* Reload Banner Notification */}
      {isReloadAnimating && !isDragging && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-emerald-600 text-white font-black text-[11px] rounded-full shadow-md pointer-events-none flex items-center gap-1 animate-bounce z-30">
          <span>✓</span>
          <span>Ball #{activeAmmoDigit} Loaded!</span>
        </div>
      )}

      {/* SVG Canvas for Slingshot & Trajectory */}
      <svg
        className="w-full h-full pointer-events-none overflow-visible"
        viewBox={`0 0 ${arenaWidth} ${arenaHeight}`}
      >
        <defs>
          <linearGradient id="woodBark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#45230c" />
            <stop offset="35%" stopColor="#7a421d" />
            <stop offset="70%" stopColor="#8c4e24" />
            <stop offset="100%" stopColor="#3d1d07" />
          </linearGradient>

          <linearGradient id="woodHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a35f30" />
            <stop offset="100%" stopColor="#572b0d" />
          </linearGradient>

          <linearGradient id="rubberBandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <radialGradient id="leatherGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#8d4925" />
            <stop offset="100%" stopColor="#3b1908" />
          </radialGradient>

          <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* 1. Ground Shadow */}
        <ellipse
          cx={cx}
          cy={cy + 60}
          rx={40}
          ry={11}
          fill="#134e4a"
          opacity="0.28"
          filter="url(#shadowBlur)"
        />

        {/* 2. Trajectory Dots Arc */}
        {isDragging &&
          trajectoryDots.map((dot, idx) => (
            <g key={idx}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r={dot.isApex ? 5.5 : Math.max(2.4, 4.2 - idx * 0.15)}
                fill={dot.isApex ? '#f59e0b' : '#ffffff'}
                opacity={dot.opacity}
                className="drop-shadow-xs"
              />
              {dot.isApex && (
                <circle
                  cx={dot.x}
                  cy={dot.y}
                  r={8.5}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  opacity={0.8}
                  className="animate-ping"
                />
              )}
            </g>
          ))}

        {/* 3. Back Rubber Band */}
        <path
          d={`M ${rProng.x} ${rProng.y} Q ${(rProng.x + pouchPos.x) / 2} ${
            (rProng.y + pouchPos.y) / 2 + 2
          } ${pouchPos.x + 10} ${pouchPos.y}`}
          stroke="url(#rubberBandGrad)"
          strokeWidth={bandThickness}
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* 4. Wooden Slingshot Structure */}
        <g className="filter drop-shadow-sm">
          {/* Main Trunk */}
          <path
            d={`
              M ${cx - 13} ${cy + 58}
              C ${cx - 11} ${cy + 30}, ${cx - 14} ${cy + 8}, ${cx - 16} ${cy - 8}
              C ${cx - 8} ${cy}, ${cx + 8} ${cy}, ${cx + 16} ${cy - 8}
              C ${cx + 14} ${cy + 8}, ${cx + 11} ${cy + 30}, ${cx + 13} ${cy + 58}
              Z
            `}
            fill="url(#woodBark)"
          />

          {/* Left Fork */}
          <path
            d={`
              M ${cx - 16} ${cy - 8}
              C ${cx - 22} ${cy - 24}, ${cx - 32} ${cy - 40}, ${lProng.x - 6} ${lProng.y}
              C ${lProng.x - 5} ${lProng.y - 10}, ${lProng.x + 6} ${lProng.y - 10}, ${
              lProng.x + 5
            } ${lProng.y}
              C ${cx - 22} ${cy - 36}, ${cx - 10} ${cy - 16}, ${cx - 5} ${cy - 10}
              Z
            `}
            fill="url(#woodHighlight)"
          />

          {/* Right Fork */}
          <path
            d={`
              M ${cx + 16} ${cy - 8}
              C ${cx + 22} ${cy - 24}, ${cx + 32} ${cy - 40}, ${rProng.x + 6} ${rProng.y}
              C ${rProng.x + 5} ${rProng.y - 10}, ${rProng.x - 6} ${rProng.y - 10}, ${
              rProng.x - 5
            } ${rProng.y}
              C ${cx + 22} ${cy - 36}, ${cx + 10} ${cy - 16}, ${cx + 5} ${cy - 10}
              Z
            `}
            fill="url(#woodBark)"
          />

          {/* Leather Twine Wrap */}
          <rect
            x={cx - 14}
            y={cy - 5}
            width={28}
            height={10}
            rx={2.5}
            fill="#d97706"
            stroke="#78350f"
            strokeWidth="1.2"
          />
          <line x1={cx - 7} y1={cy - 5} x2={cx - 7} y2={cy + 5} stroke="#451a03" strokeWidth="1" />
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy + 5} stroke="#451a03" strokeWidth="1" />
          <line x1={cx + 7} y1={cy - 5} x2={cx + 7} y2={cy + 5} stroke="#451a03" strokeWidth="1" />

          <circle cx={lProng.x} cy={lProng.y} r={6} fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
          <circle cx={rProng.x} cy={rProng.y} r={6} fill="#78350f" stroke="#451a03" strokeWidth="1.2" />
        </g>

        {/* 5. Front Rubber Band */}
        <path
          d={`M ${lProng.x} ${lProng.y} Q ${(lProng.x + pouchPos.x) / 2} ${
            (lProng.y + pouchPos.y) / 2 + 1.5
          } ${pouchPos.x - 10} ${pouchPos.y}`}
          stroke="url(#rubberBandGrad)"
          strokeWidth={bandThickness}
          strokeLinecap="round"
          fill="none"
        />

        {/* 6. Leather Pouch with Loaded Digit Ball */}
        <g
          transform={`translate(${pouchPos.x}, ${pouchPos.y})`}
          className="cursor-grab active:cursor-grabbing pointer-events-auto"
        >
          <ellipse
            cx={0}
            cy={0}
            rx={15}
            ry={10}
            fill="url(#leatherGrad)"
            stroke="#1c0a02"
            strokeWidth="1.2"
          />

          <ellipse
            cx={0}
            cy={0}
            rx={12}
            ry={7.5}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="0.9"
            strokeDasharray="2,2"
            opacity="0.75"
          />

          {/* Loaded Digit in Pouch */}
          {!flyingProjectile && (
            <g
              className="select-none pointer-events-none"
              transform={isReloadAnimating ? 'scale(1.2)' : 'scale(1)'}
              style={{ transition: 'transform 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
            >
              <circle
                cx={0}
                cy={-1.5}
                r={13}
                fill="url(#rubberBandGrad)"
                stroke="#78350f"
                strokeWidth="1.2"
                filter="drop-shadow(0 2px 3px rgba(0,0,0,0.3))"
              />
              <circle cx={-3.5} cy={-5} r={3} fill="#ffffff" opacity="0.65" />
              <text
                x={0}
                y={3}
                textAnchor="middle"
                fontSize="14"
                fontWeight="900"
                fontFamily="Fredoka, sans-serif"
                fill="#451a03"
              >
                {activeAmmoDigit}
              </text>
            </g>
          )}
        </g>

        {/* 7. Particles */}
        {particles.map((p) => (
          <circle key={p.id} cx={p.x} cy={p.y} r={p.size} fill={p.color} opacity={p.alpha} />
        ))}
      </svg>

      {/* 8. Flying Digit Projectile */}
      {projectilePos && flyingProjectile && (
        <div
          className="absolute pointer-events-none z-30 transition-transform duration-75"
          style={{
            left: `${projectilePos.x}px`,
            top: `${projectilePos.y}px`,
            transform: `translate(-50%, -50%) scale(${projectilePos.scale}) rotate(${projectilePos.rotation}deg)`,
          }}
        >
          <div className="relative w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border-2 border-amber-900 shadow-lg shadow-amber-900/40">
            <div className="absolute top-1 left-1.5 w-2.5 h-1.5 bg-white/75 rounded-full blur-[0.5px]" />
            <span className="text-lg font-black text-amber-950 font-fredoka drop-shadow-xs">
              {flyingProjectile.digit}
            </span>
          </div>
        </div>
      )}

      {/* Subtle interaction tip */}
      {!isDragging && !flyingProjectile && !isReloadAnimating && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2.5 py-0.5 bg-white/85 backdrop-blur-xs rounded-full border border-teal-200/80 shadow-2xs pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-700">
            Ball <strong className="text-amber-800 font-mono font-bold">#{activeAmmoDigit}</strong> loaded · Pull pouch & aim
          </span>
        </div>
      )}
    </div>
  );
};
