import React from 'react';
import { Shield, CheckCircle2, User, KeyRound, LogOut, Plane, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface DashboardViewProps {
  onBackToVerification: () => void;
  otpCode: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onBackToVerification,
  otpCode,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-pop-in">
      <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-900/10 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#0d2149] font-fredoka">
                  AeroPass Member Portal
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Authorized Session for Drake Le · Session Token #9281-DL
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onBackToVerification();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border border-teal-200/70 rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-teal-950 font-fredoka">
                Welcome aboard, Drake Le!
              </h3>
              <p className="text-xs sm:text-sm text-teal-900/80 mt-1 leading-relaxed">
                Your 6-digit slingshot OTP code (
                <span className="font-mono font-bold text-teal-950 underline decoration-teal-400">
                  {otpCode}
                </span>
                ) was validated with 100% trajectory accuracy. All features are now unlocked.
              </p>
            </div>
          </div>
        </div>

        {/* Security / Identity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <User className="w-4 h-4 text-teal-600" />
              <span>Identity Status</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Drake Le</p>
            <p className="text-[11px] text-emerald-600 font-medium">Clearance Level 3</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Auth Method</span>
            </div>
            <p className="text-sm font-bold text-slate-900 font-mono">{otpCode}</p>
            <p className="text-[11px] text-slate-500">Slingshot Ballistic</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Session Health</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              <span>Secure & Active</span>
            </div>
            <p className="text-[11px] text-slate-500">256-bit TLS Encrypted</p>
          </div>
        </div>

        {/* Bottom CTA to replay the slingshot */}
        <div className="text-center pt-2">
          <button
            onClick={() => {
              sounds.playClick();
              onBackToVerification();
            }}
            className="px-6 py-3 rounded-xl bg-[#0d2149] hover:bg-[#163066] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Play Slingshot OTP Again
          </button>
        </div>
      </div>
    </div>
  );
};
