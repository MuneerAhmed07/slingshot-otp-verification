import React from 'react';
import skyBg from '../assets/images/sky_airplane_bg_1790140987726.jpg';

export const BackgroundSky: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-gradient-to-b from-[#bde4f4] via-[#c6edee] to-[#d8f4ee]">
      {/* Generated high-fidelity sky background overlay */}
      <img
        src={skyBg}
        alt="Sky with distant airplane"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-multiply filter blur-[1px]"
      />

      {/* Decorative SVG Silhouette of Airplane with contrail */}
      <div className="absolute top-12 left-1/4 opacity-45 pointer-events-none transform -rotate-12 animate-cloud-slow">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle blurred contrail */}
          <path
            d="M5 30 L55 30"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-70 blur-[1px]"
          />
          {/* Plane silhouette */}
          <path
            d="M55 30 L75 28 L95 24 L102 18 L104 20 L98 27 L112 28 L116 23 L118 24 L114 30 L118 36 L116 37 L112 32 L98 33 L104 40 L102 42 L95 36 L75 32 Z"
            fill="#336688"
            className="opacity-60"
          />
        </svg>
      </div>

      {/* Soft drifting clouds */}
      <div className="absolute top-24 -left-20 w-96 h-28 bg-white/40 rounded-full blur-2xl animate-cloud-slow" />
      <div className="absolute top-48 -right-16 w-80 h-32 bg-white/45 rounded-full blur-2xl animate-cloud-reverse" />
      <div className="absolute bottom-28 left-1/3 w-[32rem] h-32 bg-teal-100/50 rounded-full blur-3xl" />

      {/* Subtle grass/ground hillock at bottom for Slingshot base */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[140%] h-48 bg-gradient-to-t from-[#6bb17b] via-[#82c68f] to-transparent rounded-t-[100%] opacity-35 blur-sm" />
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[110%] h-36 bg-gradient-to-t from-[#5a9c68] via-[#75b982] to-transparent rounded-t-[100%] opacity-40" />
    </div>
  );
};
