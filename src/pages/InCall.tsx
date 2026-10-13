import React, { useState, useEffect, useRef } from 'react';
import { CallSession, VoiceDisguise } from '../types';
import { ICEBREAKER_PROMPTS } from '../constants/topics';
import { audioService } from '../services/audioService';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { ReportModal } from '../components/ReportModal';
import {
  Mic,
  MicOff,
  PhoneOff,
  ShieldAlert,
  Volume2,
  VolumeX,
  Sparkles,
  Shield,
  Layers,
  Check,
} from 'lucide-react';

interface InCallProps {
  session: CallSession;
  initialDisguise: VoiceDisguise;
  onEndCall: (durationSecs: number) => void;
}

export const InCall: React.FC<InCallProps> = ({
  session,
  initialDisguise,
  onEndCall,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [disguise, setDisguise] = useState<VoiceDisguise>(initialDisguise);
  const [showReportModal, setShowReportModal] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [peerSpeaking, setPeerSpeaking] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Initialize Web Audio API on mount
  useEffect(() => {
    audioService.init(disguise);

    timerRef.current = window.setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);

    // Simulate occasional empathetic speaking waveforms from peer
    const speechSimInterval = window.setInterval(() => {
      setPeerSpeaking((prev) => !prev);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(speechSimInterval);
      audioService.cleanup();
    };
  }, []);

  const handleToggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleSpeaker = () => {
    const muted = audioService.toggleSpeaker();
    setIsSpeakerMuted(muted);
  };

  const handleChangeDisguise = (newDisguise: VoiceDisguise) => {
    setDisguise(newDisguise);
    audioService.applyDisguise(newDisguise);
  };

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % ICEBREAKER_PROMPTS.length);
  };

  const handleReportSubmit = (reason: string) => {
    setShowReportModal(false);
    onEndCall(elapsed);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex flex-col items-center justify-between p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Top Bar: Peer status & Timer */}
      <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-amber-400/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            {session.peerPseudonym.slice(0, 1)}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{session.peerPseudonym}</span>
              <span className="text-[10px] text-emerald-400 font-mono-numbers px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Encrypted
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Shared Topic: {session.sharedTopics[0] || 'Confidential Support'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-mono-numbers font-bold text-amber-400">
            {fmt(elapsed)}
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors text-xs flex items-center gap-1.5"
            title="Report Safety Violation"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </div>
      </div>

      {/* Center Zone: Peer Avatar & Dual Visualizers */}
      <div className="w-full my-auto py-6 max-w-xl flex flex-col items-center space-y-6">
        {/* Peer Presence Orb */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border flex items-center justify-center transition-all duration-700 ${
              peerSpeaking
                ? 'border-amber-400/80 bg-amber-500/10 shadow-2xl shadow-amber-400/20 scale-105'
                : 'border-slate-800 bg-slate-900/60 shadow-xl'
            }`}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center p-2">
              <span className="text-xl sm:text-2xl mb-1">🎙️</span>
              <span className="text-[10px] text-slate-400 font-medium">
                {peerSpeaking ? 'Peer Speaking' : 'Listening...'}
              </span>
            </div>
          </div>
          {peerSpeaking && (
            <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Live Audio Visualizer for Local Mic */}
        <div className="w-full">
          <AudioVisualizer
            isMuted={isMuted}
            disguise={disguise}
            peerSpeaking={peerSpeaking}
            label="Your Voice (Live Masked Channel)"
          />
        </div>

        {/* Icebreaker Spark Card */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-left relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conversation Spark</span>
            </div>
            <button
              onClick={handleNextPrompt}
              className="text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Shuffle Prompt →
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 italic font-medium leading-relaxed">
            "{ICEBREAKER_PROMPTS[promptIndex]}"
          </p>
        </div>

        {/* Advisory Warning */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 text-center">
          <Shield className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>Sanctuary Rule: Never reveal real name, phone, or location coordinates.</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* On-the-fly disguise selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="px-2 text-[11px] text-slate-500 font-medium hidden md:inline">Filter:</span>
          {(['warm_mask', 'privacy_pitch', 'natural'] as VoiceDisguise[]).map((d) => (
            <button
              key={d}
              onClick={() => handleChangeDisguise(d)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                disguise === d
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d === 'warm_mask' ? 'Warm Mask' : d === 'privacy_pitch' ? 'Pitch Shift' : 'Natural'}
            </button>
          ))}
        </div>

        {/* Core Audio Controls (Mute / Speaker / End) */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`p-3.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-rose-500/15 border-rose-500/50 text-rose-400'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleToggleSpeaker}
            className={`p-3.5 rounded-2xl border transition-all ${
              isSpeakerMuted
                ? 'bg-slate-900 border-slate-700 text-slate-500'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
            }`}
            title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={() => onEndCall(elapsed)}
            className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Call</span>
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          callId={session.id}
          peerPseudonym={session.peerPseudonym}
          onSubmit={handleReportSubmit}
          onCancel={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
