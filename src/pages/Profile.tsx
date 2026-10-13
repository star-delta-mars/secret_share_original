import React, { useState } from 'react';
import { User, CallSession, BlockedPeer, VoiceDisguise } from '../types';
import { StorageService, generatePseudonym } from '../services/storageService';
import { SAFETY_PLEDGE } from '../constants/topics';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { audioService } from '../services/audioService';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  RefreshCw,
  Trash2,
  Mic,
  Clock,
  LogOut,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onResetUser: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  onUpdateUser,
  onResetUser,
}) => {
  const [pseudonym, setPseudonym] = useState(user.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [callHistory, setCallHistory] = useState<CallSession[]>(() => StorageService.getCallHistory());
  const [blockedPeers, setBlockedPeers] = useState<BlockedPeer[]>(() => StorageService.getBlockedPeers());
  const [testDisguise, setTestDisguise] = useState<VoiceDisguise>('warm_mask');
  const [isTestingMic, setIsTestingMic] = useState(false);

  const handleShuffleName = () => {
    const newName = generatePseudonym();
    setPseudonym(newName);
    const updated = { ...user, name: newName };
    StorageService.setUser(updated);
    onUpdateUser(updated);
  };

  const handleSaveName = () => {
    const updated = { ...user, name: pseudonym };
    StorageService.setUser(updated);
    onUpdateUser(updated);
    setIsEditingName(false);
  };

  const handleUnblock = (peerId: string) => {
    StorageService.unblockPeer(peerId);
    setBlockedPeers(StorageService.getBlockedPeers());
  };

  const toggleMicTest = async () => {
    if (isTestingMic) {
      audioService.cleanup();
      setIsTestingMic(false);
    } else {
      setIsTestingMic(true);
      await audioService.init(testDisguise);
      audioService.applyDisguise(testDisguise);
    }
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* User Sanctuary Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-amber-400/40 flex items-center justify-center text-amber-400 text-2xl font-bold shadow-lg shadow-amber-950/40 shrink-0">
              {pseudonym.slice(0, 1)}
            </div>
            <div>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pseudonym}
                    onChange={(e) => setPseudonym(e.target.value)}
                    className="px-3 py-1 text-sm bg-slate-950 border border-amber-400 rounded-lg text-white font-bold focus:outline-none"
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-bold rounded-lg"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white">{pseudonym}</h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-amber-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleShuffleName}
                    className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                    title="Generate New Pseudonym"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                <span className="font-mono-numbers">
                  Verified: ••••• {user.phone.slice(-4) || '3210'}
                </span>
                <span>·</span>
                <span>Active Member</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center px-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Trust Score
              </p>
              <p className="text-lg font-bold text-amber-400 font-mono-numbers">
                {user.trustScore.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center px-4">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Strikes
              </p>
              <p className="text-lg font-bold text-emerald-400 font-mono-numbers">
                {user.strikeCount} / 3
              </p>
            </div>
          </div>
        </div>

        {/* Security & Verification status */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Cryptographic Anonymity</p>
              <p className="text-slate-400 text-[11px]">
                Zero linking between your phone hash and your live voice stream.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Ephemeral P2P Calls</p>
              <p className="text-slate-400 text-[11px]">
                WebRTC direct peer connections. No server stores call audio.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Trust & Safety Engine</p>
              <p className="text-slate-400 text-[11px]">
                Mutual rating checks & instant 1-click caller blocking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mic & Voice Disguise Lab */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Voice Privacy Testing Lab</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Speak into your microphone to verify how your vocal frequency is masked before calls.
            </p>
          </div>
          <button
            onClick={toggleMicTest}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isTestingMic
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
            }`}
          >
            {isTestingMic ? 'Stop Test' : 'Start Mic Test'}
          </button>
        </div>

        {isTestingMic && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Filter Test:</span>
              {(['warm_mask', 'privacy_pitch', 'subtle_echo', 'natural'] as VoiceDisguise[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setTestDisguise(d);
                    audioService.applyDisguise(d);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
                    testDisguise === d
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {d.replace('_', ' ')}
                </button>
              ))}
            </div>

            <AudioVisualizer
              isMuted={false}
              disguise={testDisguise}
              label="Local Test Microphone Channel"
            />
          </div>
        )}
      </div>

      {/* Safety Pledge & Principles */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>The Sanctuary Safety Pledge</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {SAFETY_PLEDGE.map((rule, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <p className="text-slate-300 leading-relaxed font-medium">{rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Session History & Blocked Users Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call History */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Confidential Session History</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono-numbers">
              {callHistory.length} calls
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {callHistory.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No call logs recorded yet.</p>
            ) : (
              callHistory.map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{call.peerPseudonym}</p>
                    <p className="text-slate-400 text-[11px] truncate max-w-[200px]">
                      {call.sharedTopics.join(' · ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono-numbers text-amber-300 font-medium">
                      {fmt(call.durationSecs || 600)}
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

        {/* Blocked Users */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Blocked Peers ({blockedPeers.length})</span>
            </h2>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {blockedPeers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                You have not blocked any peers. Mutual trust is healthy.
              </p>
            ) : (
              blockedPeers.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-200">{b.pseudonym}</p>
                    <p className="text-[11px] text-slate-500">
                      Blocked on {new Date(b.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(b.id)}
                    className="px-2.5 py-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Logout / Reset Data */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-500">
          Want to clear your local session cache and reset identity?
        </span>
        <button
          onClick={onResetUser}
          className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-rose-400 hover:text-rose-300 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Reset Anonymous Session</span>
        </button>
      </div>
    </div>
  );
};
