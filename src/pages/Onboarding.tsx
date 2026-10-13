import React, { useState } from 'react';
import { Shield, Sparkles, RefreshCw, ArrowRight, Lock, Headphones } from 'lucide-react';
import { generatePseudonym, StorageService } from '../services/storageService';
import { User } from '../types';

interface OnboardingProps {
  onContinue: (phone: string, countryCode: string, pseudonym: string, isInstant: boolean) => void;
  onInstantGuest: (user: User) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onContinue, onInstantGuest }) => {
  const [phone, setPhone] = useState('');
  const [pseudonym, setPseudonym] = useState(generatePseudonym());
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState('');

  const handleRandomizePseudonym = () => {
    setPseudonym(generatePseudonym());
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    const codeNum = countryCode.replace('+', '');
    onContinue(cleanPhone, codeNum, pseudonym, false);
  };

  const handleInstantDemo = () => {
    const guestUser = StorageService.createGuestUser('919876543210', pseudonym);
    onInstantGuest(guestUser);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background visual asset */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/secret_share_hero_1791816496281.jpg"
          alt="Ethereal dusk sound waves"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/60" />
      </div>

      <div className="relative z-10 w-full max-w-md my-auto">
        {/* Main card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Top emblem */}
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-amber-400/30 bg-slate-950 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <img
                src="/src/assets/images/secret_share_symbol_1791816508266.jpg"
                alt="Empathy emblem"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80 font-mono-numbers">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero Identity Leaks</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Speak Freely.<br />
            <span className="text-amber-400">Remain Unknown.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
            Connect over encrypted, ephemeral peer-to-peer audio to share the thoughts you carry alone. No social feeds, no photos, no judgment.
          </p>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {/* Pseudonym Generator */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Your Sanctuary Pseudonym</span>
                <button
                  type="button"
                  onClick={handleRandomizePseudonym}
                  className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Shuffle</span>
                </button>
              </label>
              <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-slate-100 font-medium text-xs sm:text-sm"
                  maxLength={30}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Peers will only see this pseudonym. Your real name is never asked.
              </p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-300">
                Mobile Number (for verification only)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-2.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono-numbers text-slate-200 focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm font-mono-numbers focus:outline-none focus:border-amber-400/50"
                  maxLength={12}
                />
              </div>
              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}
            </div>

            {/* Submit Phone button */}
            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] text-slate-500 uppercase tracking-wider">
              or instant sandbox
            </span>
          </div>

          {/* Instant Guest Mode for Rapid Evaluation */}
          <button
            onClick={handleInstantDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Anonymous Demo Entry</span>
          </button>

          {/* Privacy badge */}
          <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero recordings stored · Neon encrypted tokens</span>
          </div>
        </div>
      </div>
    </div>
  );
};
