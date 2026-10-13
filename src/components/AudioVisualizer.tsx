import React, { useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Mic, MicOff, ShieldCheck } from 'lucide-react';
import { VoiceDisguise } from '../types';

interface AudioVisualizerProps {
  isMuted: boolean;
  disguise: VoiceDisguise;
  peerSpeaking?: boolean;
  label?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isMuted,
  disguise,
  peerSpeaking = false,
  label = 'Your Audio (Masked)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      let frequencies = audioService.getFrequencyData();
      if (isMuted) {
        frequencies = new Uint8Array(frequencies.length);
      }

      // If peer is speaking in simulation, add a pleasant synthetic wave
      if (peerSpeaking && !isMuted) {
        const time = Date.now() / 150;
        for (let i = 0; i < frequencies.length; i++) {
          const wave = Math.sin(time + i * 0.4) * 45 + 50;
          frequencies[i] = Math.max(frequencies[i], wave);
        }
      }

      const barCount = 28;
      const barWidth = 4;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * (frequencies.length / 2));
        let val = frequencies[dataIndex] || 0;
        if (isMuted) val = 0;

        const percent = val / 255;
        const minHeight = 4;
        const barHeight = Math.max(minHeight, percent * (height - 10));
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        // Gradient based on disguise
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (disguise === 'warm_mask') {
          grad.addColorStop(0, '#f59e0b'); // warm amber
          grad.addColorStop(1, '#d97706');
        } else if (disguise === 'privacy_pitch') {
          grad.addColorStop(0, '#818cf8'); // indigo
          grad.addColorStop(1, '#6366f1');
        } else if (disguise === 'subtle_echo') {
          grad.addColorStop(0, '#2dd4bf'); // teal
          grad.addColorStop(1, '#0d9488');
        } else {
          grad.addColorStop(0, '#38bdf8'); // sky
          grad.addColorStop(1, '#0284c7');
        }

        ctx.fillStyle = isMuted ? 'rgba(100, 116, 139, 0.4)' : grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMuted, disguise, peerSpeaking]);

  const disguiseLabel: Record<VoiceDisguise, string> = {
    warm_mask: 'Warm Tone Mask (850Hz Low-pass)',
    privacy_pitch: 'Frequency Shift Bandpass',
    subtle_echo: 'Sanctuary Reverberation',
    natural: 'Natural Voice (No Filter)',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
      <div className="flex items-center justify-between w-full mb-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          {isMuted ? (
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Mic className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-mono-numbers">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{disguiseLabel[disguise]}</span>
        </div>
      </div>

      <div className="w-full flex items-center justify-center h-16 px-2 bg-slate-950/60 rounded-xl border border-slate-800/40">
        <canvas
          ref={canvasRef}
          width={320}
          height={60}
          className="w-full h-full max-w-xs"
        />
      </div>

      <div className="flex items-center justify-between w-full mt-2.5 text-[11px] text-slate-500">
        <span>{isMuted ? 'Muted — No sound transmission' : 'Live encrypted stream'}</span>
        <span className="font-mono-numbers">Web Audio 48kHz</span>
      </div>
    </div>
  );
};
