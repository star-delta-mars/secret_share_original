import React, { useState } from 'react';
import { UserPreferences, CallType, VoiceDisguise } from '../types';
import { TOPIC_CATEGORIES, CALL_TYPE_CONFIG } from '../constants/topics';
import { StorageService } from '../services/storageService';
import { Check, Shield, Volume2, Save } from 'lucide-react';
import { audioService } from '../services/audioService';

interface PreferencesProps {
  initialPrefs: UserPreferences;
  onSave: (prefs: UserPreferences) => void;
  onProceedToHome?: () => void;
}

export const Preferences: React.FC<PreferencesProps> = ({
  initialPrefs,
  onSave,
  onProceedToHome,
}) => {
  const [prefs, setPrefs] = useState<UserPreferences>(initialPrefs);
  const [activeTab, setActiveTab] = useState<'topics' | 'roles' | 'audio'>('topics');
  const [isSaved, setIsSaved] = useState(false);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  const toggleTalkTopic = (topic: string) => {
    setPrefs((prev) => {
      const exists = prev.talkTopics.includes(topic);
      const next = exists
        ? prev.talkTopics.filter((t) => t !== topic)
        : [...prev.talkTopics, topic];
      return { ...prev, talkTopics: next };
    });
  };

  const toggleListenTopic = (topic: string) => {
    setPrefs((prev) => {
      const exists = prev.listenTopics.includes(topic);
      const next = exists
        ? prev.listenTopics.filter((t) => t !== topic)
        : [...prev.listenTopics, topic];
      return { ...prev, listenTopics: next };
    });
  };

  const toggleCallType = (type: CallType) => {
    setPrefs((prev) => {
      const exists = prev.callTypes.includes(type);
      if (exists && prev.callTypes.length === 1) return prev; // keep at least 1
      const next = exists
        ? prev.callTypes.filter((t) => t !== type)
        : [...prev.callTypes, type];
      return { ...prev, callTypes: next };
    });
  };

  const handleSave = () => {
    StorageService.setPreferences(prefs);
    onSave(prefs);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestFilter = async (disguise: VoiceDisguise) => {
    setPrefs((p) => ({ ...p, voiceDisguise: disguise }));
    setIsTestingAudio(true);
    await audioService.init(disguise);
    audioService.applyDisguise(disguise);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Matching & Privacy Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Choose what you carry, what you are willing to hear, and how your voice is protected.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-400/20 active:scale-95"
          >
            {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Preferences Saved' : 'Save Preferences'}</span>
          </button>
          {onProceedToHome && (
            <button
              onClick={() => {
                handleSave();
                onProceedToHome();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Continue to Sanctuary
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-1 p-1 mb-8 bg-slate-900 rounded-xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('topics')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'topics'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Emotional Topics
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'roles'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Call Roles & Formats
        </button>
        <button
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'audio'
              ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Voice Privacy Mask
        </button>
      </div>

      {/* Tab 1: Topics */}
      {activeTab === 'topics' && (
        <div className="space-y-8">
          {/* Talk Topics Section */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>What I Want to Talk About (My Secrets & Burdens)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select topics you'd like to unburden in confidential calls. We will match you with a listener open to these.
              </p>
            </div>

            <div className="space-y-4">
              {TOPIC_CATEGORIES.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {cat.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.topics.map((topic) => {
                      const active = prefs.talkTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleTalkTopic(topic)}
                          className={`px-3 py-2 text-xs rounded-xl border transition-all text-left flex items-center gap-2 ${
                            active
                              ? 'bg-amber-400/15 border-amber-400/60 text-amber-200 shadow-sm shadow-amber-950/40'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] border ${
                              active
                                ? 'bg-amber-400 text-slate-950 border-amber-400'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Listen Topics Section */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>What I Am Willing to Listen To (Holding Space)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select categories you feel emotionally prepared to hear without offering unrequested advice or judgment.
              </p>
            </div>

            <div className="space-y-4">
              {TOPIC_CATEGORIES.map((cat) => (
                <div key={cat.id} className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {cat.label}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.topics.map((topic) => {
                      const active = prefs.listenTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => toggleListenTopic(topic)}
                          className={`px-3 py-2 text-xs rounded-xl border transition-all text-left flex items-center gap-2 ${
                            active
                              ? 'bg-teal-400/15 border-teal-400/60 text-teal-200 shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-md flex items-center justify-center text-[10px] border ${
                              active
                                ? 'bg-teal-400 text-slate-950 border-teal-400'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roles and Formats */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Match Role Selector */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2">My Sanctuary Intention</h2>
            <p className="text-xs text-slate-400 mb-4">
              When entering matchmaking, what is your primary disposition right now?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'talker', title: 'I Need to Unburden', desc: 'Prioritize connecting me to an active, patient listener.' },
                { id: 'listener', title: 'I Am Here to Hold Space', desc: 'Pair me with someone carrying a heavy secret today.' },
                { id: 'any', title: 'Either / Open Flow', desc: 'Happy to either share or listen depending on peer needs.' },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setPrefs((p) => ({ ...p, matchRole: role.id as UserPreferences['matchRole'] }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    prefs.matchRole === role.id
                      ? 'bg-amber-400/15 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold text-white mb-1">{role.title}</p>
                  <p className="text-[11px] text-slate-400">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Formats Selector */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-base font-bold text-white mb-2">Supported Call Formats</h2>
            <p className="text-xs text-slate-400 mb-4">
              Select the formats you are open to participating in:
            </p>
            <div className="space-y-3">
              {(Object.keys(CALL_TYPE_CONFIG) as CallType[]).map((type) => {
                const conf = CALL_TYPE_CONFIG[type];
                const active = prefs.callTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleCallType(type)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      active
                        ? 'bg-slate-950 border-amber-400/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-white">{conf.title}</span>
                        <span className="text-[10px] text-amber-300 font-mono-numbers px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20">
                          {conf.durationEstimate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{conf.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border shrink-0 ml-4 ${
                        active
                          ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Voice Privacy Mask */}
      {activeTab === 'audio' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Real-Time Voice Privacy Mask</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Secret Share processes your audio through custom Web Audio filters before transmission. Your identifiable voice timbre is gently reshaped so no one can recognize you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                id: 'warm_mask',
                title: 'Warm Tone Mask (Recommended)',
                desc: 'Applies an 850Hz low-pass filter to dampen vocal sibilance and crisp timbre while keeping emotional warmth intact.',
                badge: 'Maximum Anonymity & Warmth',
              },
              {
                id: 'privacy_pitch',
                title: 'Bandpass Frequency Shift',
                desc: 'Focuses strictly on mid-tones to mask distinctive pitch markers while remaining crystal clear to understand.',
                badge: 'Vocal Camouflage',
              },
              {
                id: 'subtle_echo',
                title: 'Sanctuary Reverberation',
                desc: 'Introduces a calm 140ms acoustic delay, evoking the peaceful aura of an empty temple or canyon.',
                badge: 'Mindful Sanctuary',
              },
              {
                id: 'natural',
                title: 'Natural Direct Audio',
                desc: 'No frequency manipulation applied. Raw, unmasked voice stream.',
                badge: 'Unfiltered',
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setPrefs((p) => ({ ...p, voiceDisguise: item.id as VoiceDisguise }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  prefs.voiceDisguise === item.id
                    ? 'bg-slate-950 border-amber-400 shadow-md shadow-amber-950/40'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">{item.title}</span>
                  <span className="text-[10px] text-amber-400 font-mono-numbers">{item.badge}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{item.desc}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestFilter(item.id as VoiceDisguise);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preview Mask on Mic</span>
                </button>
              </div>
            ))}
          </div>

          {isTestingAudio && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs text-amber-200 flex items-center justify-between">
              <span>Microphone test active: Speak into your mic to verify sound disguise filter.</span>
              <button
                type="button"
                onClick={() => {
                  audioService.cleanup();
                  setIsTestingAudio(false);
                }}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Stop Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
