import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  user: User | null;
  onStartMatch: () => void;
  isInCall?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  user,
  onStartMatch,
  isInCall = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-lg font-extrabold tracking-tight text-white hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Secret Share</span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'home'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sanctuary
          </button>
          <button
            onClick={() => onNavigate('preferences')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'preferences'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preferences
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'profile'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Safety Hub
          </button>
          <button
            onClick={() => onNavigate('blueprint')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'blueprint'
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Architecture
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {isInCall ? (
            <button
              onClick={() => onNavigate('incall')}
              className="px-4 py-2 text-xs font-semibold text-rose-100 bg-rose-600/90 hover:bg-rose-500 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-lg shadow-rose-950/40"
            >
              Return to Live Call
            </button>
          ) : (
            <button
              onClick={onStartMatch}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all whitespace-nowrap shrink-0 shadow-lg shadow-amber-400/20 active:scale-95"
            >
              Find a Stranger
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
