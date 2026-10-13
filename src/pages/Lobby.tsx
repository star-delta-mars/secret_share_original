import React, { useEffect, useState } from 'react';
import { User, UserPreferences, CallSession } from '../types';
import { peerSignaling } from '../services/peerSignaling';
import { Shield, Sparkles, X, Zap } from 'lucide-react';

interface LobbyProps {
  user: User;
  preferences: UserPreferences;
  roleOverride?: 'talker' | 'listener' | 'any';
  onMatchFound: (session: CallSession) => void;
  onCancel: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  user,
  preferences,
  roleOverride,
  onMatchFound,
  onCancel,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const activeRole = roleOverride || preferences.matchRole;

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);

    const topicsToMatch =
      activeRole === 'talker'
        ? preferences.talkTopics
        : activeRole === 'listener'
        ? preferences.listenTopics
        : [...preferences.talkTopics, ...preferences.listenTopics];

    peerSignaling.startQueue(
      {
        userId: user.id,
        pseudonym: user.name,
        callType: preferences.callTypes[0] || 'one_to_one',
        topics: topicsToMatch.length > 0 ? topicsToMatch : ['Things I never told anyone'],
        role: activeRole,
        timestamp: Date.now(),
      },
      (session) => {
        onMatchFound(session);
      },
      true // allows simulated peer if no second tab is open after 4-6s
    );

    return () => {
      clearInterval(timer);
      peerSignaling.stopQueue();
    };
  }, [user, preferences, activeRole, onMatchFound]);

  const handleInstantMatch = () => {
    const topicsToMatch =
      activeRole === 'talker'
        ? preferences.talkTopics
        : activeRole === 'listener'
        ? preferences.listenTopics
        : preferences.talkTopics;

    peerSignaling.instantSimulatedMatch(
      {
        userId: user.id,
        pseudonym: user.name,
        callType: preferences.callTypes[0] || 'one_to_one',
        topics: topicsToMatch.length > 0 ? topicsToMatch : ['Things I never told anyone'],
        role: activeRole,
        timestamp: Date.now(),
      },
      (session) => {
        onMatchFound(session);
      }
    );
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Concentric Radar Rings in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full border border-amber-500/20 animate-radar" />
        <div className="w-48 h-48 rounded-full border border-amber-500/15 animate-radar-delayed" />
        <div className="w-80 h-80 rounded-full border border-slate-800/60" />
        <div className="w-[480px] h-[480px] rounded-full border border-slate-800/30" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl text-center space-y-6">
        {/* Pulsing center radar icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-slate-950 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-950/60">
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping absolute" />
          <div className="w-3 h-3 rounded-full bg-amber-400" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Finding Your Anonymous Peer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Matching topics & privacy encryption over WebRTC channel...
          </p>
        </div>

        {/* Counter badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono-numbers">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>Queue Wait: {fmt(elapsed)}</span>
        </div>

        {/* Matching parameters */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-400">
            <span>Your Pseudonym:</span>
            <span className="text-slate-200 font-semibold">{user.name}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Intended Role:</span>
            <span className="text-amber-400 font-semibold capitalize">
              {activeRole === 'talker'
                ? 'Unburdening (Talker)'
                : activeRole === 'listener'
                ? 'Holding Space (Listener)'
                : 'Open Flow (Either)'}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Voice Protection:</span>
            <span className="text-emerald-400 font-semibold">Active ({preferences.voiceDisguise})</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Multi-Tab Sync:</span>
            <span className="text-indigo-400 font-mono-numbers">BroadcastChannel Ready</span>
          </div>
        </div>

        {/* Instant sandbox connect button */}
        <div className="pt-1 space-y-2">
          <button
            onClick={handleInstantMatch}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ Instant Sandbox Match (Skip Wait)</span>
          </button>

          <p className="text-[11px] text-slate-500">
            Tip: Open this app in another browser tab to test real tab-to-tab peer matching!
          </p>
        </div>

        {/* Cancel button */}
        <div className="pt-2">
          <button
            onClick={() => {
              peerSignaling.stopQueue();
              onCancel();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Leave Match Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
