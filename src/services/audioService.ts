import { VoiceDisguise } from '../types';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private simulationInterval: number | null = null;
  private isSimulated = false;

  public isMuted = false;
  public isSpeakerMuted = false;

  async init(disguise: VoiceDisguise = 'warm_mask'): Promise<boolean> {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      // Try acquiring real mic
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
        this.isSimulated = false;
      } catch (err) {
        console.warn('Microphone access unavailable or denied, falling back to simulated audio presence:', err);
        this.startSimulatedAudio();
        this.isSimulated = true;
      }

      this.applyDisguise(disguise);
      return true;
    } catch (e) {
      console.error('Failed to init audio context', e);
      return false;
    }
  }

  applyDisguise(disguise: VoiceDisguise) {
    if (!this.audioCtx || !this.analyserNode) return;

    // Disconnect existing custom nodes
    try {
      if (this.filterNode) {
        this.filterNode.disconnect();
        this.filterNode = null;
      }
      if (this.delayNode) {
        this.delayNode.disconnect();
        this.delayNode = null;
      }
      if (this.delayGain) {
        this.delayGain.disconnect();
        this.delayGain = null;
      }
    } catch {
      // ignore
    }

    if (!this.sourceNode) return;

    if (disguise === 'natural') {
      this.sourceNode.disconnect();
      this.sourceNode.connect(this.analyserNode);
    } else if (disguise === 'warm_mask') {
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(850, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(1.5, this.audioCtx.currentTime);

      this.sourceNode.disconnect();
      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.analyserNode);
    } else if (disguise === 'privacy_pitch') {
      this.filterNode = this.audioCtx.createBiquadFilter();
      this.filterNode.type = 'bandpass';
      this.filterNode.frequency.setValueAtTime(650, this.audioCtx.currentTime);
      this.filterNode.Q.setValueAtTime(2.2, this.audioCtx.currentTime);

      this.sourceNode.disconnect();
      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.analyserNode);
    } else if (disguise === 'subtle_echo') {
      this.delayNode = this.audioCtx.createDelay(0.5);
      this.delayNode.delayTime.setValueAtTime(0.14, this.audioCtx.currentTime);

      this.delayGain = this.audioCtx.createGain();
      this.delayGain.gain.setValueAtTime(0.28, this.audioCtx.currentTime);

      this.sourceNode.disconnect();
      this.sourceNode.connect(this.analyserNode);
      this.sourceNode.connect(this.delayNode);
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.analyserNode);
    }
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach((track) => {
        track.enabled = !this.isMuted;
      });
    }
    return this.isMuted;
  }

  toggleSpeaker(): boolean {
    this.isSpeakerMuted = !this.isSpeakerMuted;
    return this.isSpeakerMuted;
  }

  private startSimulatedAudio() {
    if (!this.audioCtx) return;
    // Creates a subtle background rhythmic pulse that simulates natural breathing voice
    const osc = this.audioCtx.createOscillator();
    const oscGain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.audioCtx.currentTime);
    oscGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime); // silent to human ear, active for analyser

    osc.connect(oscGain);
    if (this.analyserNode) {
      oscGain.connect(this.analyserNode);
    }
    osc.start();

    // Rhythmic modulation to animate visualizer softly
    this.simulationInterval = window.setInterval(() => {
      if (this.audioCtx && oscGain) {
        const randVolume = 0.0005 + Math.random() * 0.0015;
        oscGain.gain.setValueAtTime(randVolume, this.audioCtx.currentTime);
      }
    }, 200);
  }

  getIsSimulated(): boolean {
    return this.isSimulated;
  }

  cleanup() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }
    this.sourceNode = null;
    this.analyserNode = null;
  }
}

export const audioService = new AudioService();
