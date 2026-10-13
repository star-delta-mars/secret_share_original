import React from 'react';
import { User, UserPreferences, CallSession } from '../types';
import { PhoneCall, Heart, Shield, Sparkles, Clock, ArrowRight, Layers, Lock } from 'lucide-react';

interface HomeProps {
  user: User;
  preferences: UserPreferences;
  callHistory: CallSession[];
  onStartMatching: (roleOverride?: 'talker' | 'listener' | 'any') => void;
  onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  user,
  preferences,
  callHistory,
  onStartMatching,
  onNavigate,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Hero Sanctuary Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/secret_share_hero_1791816496281.jpg"
            alt="Atmospheric soundwaves"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-20 filter blur-xs"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono-numbers">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Sanctuary Live · Pseudonym: {user.name}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              A private space to confess, vent, and be heard.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              No contacts. No camera. No permanent traces. Just two anonymous human beings connecting over confidential voice channels when life gets heavy.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Trust Score: {user.trustScore.toFixed(2)} / 5.00</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>WebRTC Direct P2P</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Mask: {preferences.voiceDisguise.replace('_', ' ')}</span>
              </span>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-xl space-y-3 w-full md:w-80 shrink-0">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Enter Matchmaking
            </p>

            <button
              onClick={() => onStartMatching('talker')}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-400/20 flex items-center justify-between active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4" />
                <span>I Need to Unburden</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onStartMatching('listener')}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 flex items-center justify-between active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>I Can Hold Space</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onStartMatching('any')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition-colors text-center"
            >
              Instant Open Match (Either Role)
            </button>
          </div>
        </div>
      </div>

      {/* Community Pulse & Check-in */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Sanctuary Calls</span>
            <span className="text-xs text-emerald-400 font-mono-numbers">Live</span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono-numbers">38 Anonymous Calls</p>
          <p className="text-xs text-slate-400">
            Strangers currently holding space across 14 emotional topics worldwide.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Listen Time</span>
            <span className="text-xs text-amber-400 font-mono-numbers">Today</span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono-numbers">14m 22s</p>
          <p className="text-xs text-slate-400">
            Uninterrupted confidential conversations with zero judgment.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sanctuary Rating</span>
            <span className="text-xs text-purple-400 font-mono-numbers">Verified</span>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono-numbers">4.96 ★</p>
          <p className="text-xs text-slate-400">
            99.4% of callers felt significantly lighter after hanging up.
          </p>
        </div>
      </div>

      {/* Topics & Privacy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Topics */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Your Configured Topics</h2>
            <button
              onClick={() => onNavigate('preferences')}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              Edit Topics →
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">To Unburden ({preferences.talkTopics.length}):</p>
              <div className="flex flex-wrap gap-1.5">
                {preferences.talkTopics.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                  >
                    {t}
                  </span>
                ))}
                {preferences.talkTopics.length > 4 && (
                  <span className="text-xs px-2 py-1 text-slate-500">
                    +{preferences.talkTopics.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Open to Listen ({preferences.listenTopics.length}):</p>
              <div className="flex flex-wrap gap-1.5">
                {preferences.listenTopics.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-teal-900/40 text-teal-300"
                  >
                    {t}
                  </span>
                ))}
                {preferences.listenTopics.length > 4 && (
                  <span className="text-xs px-2 py-1 text-slate-500">
                    +{preferences.listenTopics.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Session Logs */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Recent Anonymous Sessions</h2>
            <button
              onClick={() => onNavigate('profile')}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              View History →
            </button>
          </div>

          <div className="space-y-2.5">
            {callHistory.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No calls yet. Enter the lobby to connect.</p>
            ) : (
              callHistory.slice(0, 3).map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-200">{call.peerPseudonym}</p>
                    <p className="text-slate-500 text-[11px] truncate max-w-xs">
                      {call.sharedTopics.join(' · ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono-numbers text-amber-300 font-medium">
                      {Math.floor((call.durationSecs || 600) / 60)}m {((call.durationSecs || 600) % 60)}s
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {new Date(call.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Safety & Free-Tier Stack Footer Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Built on 100% Free Tier Stack</span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Vercel (React Frontend) + Render (Node.js/Socket.io) + Neon (Serverless Postgres) + Upstash Redis (Matchmaking) + Metered.ca (WebRTC TURN). ₹0/month production architecture.
          </p>
        </div>

        <button
          onClick={() => onNavigate('blueprint')}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors border border-slate-700 flex items-center gap-1.5 shrink-0"
        >
          <span>View Backend & SQL Blueprint</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
