import React, { useState } from 'react';
import { CallSession } from '../types';
import { GRATITUDE_TAGS } from '../constants/topics';
import { StorageService } from '../services/storageService';
import { Star, ShieldBan, Heart, ArrowRight, Check } from 'lucide-react';

interface PostCallProps {
  session: CallSession;
  durationSecs: number;
  onFinish: () => void;
}

export const PostCall: React.FC<PostCallProps> = ({
  session,
  durationSecs,
  onFinish,
}) => {
  const [stars, setStars] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([GRATITUDE_TAGS[0], GRATITUDE_TAGS[1]]);
  const [note, setNote] = useState('');
  const [blockPeer, setBlockPeer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save rating
    StorageService.saveRating({
      id: `rat_${Date.now()}`,
      callId: session.id,
      stars,
      tags: selectedTags,
      note,
      timestamp: Date.now(),
    });

    // Save call session to history
    StorageService.saveCall({
      ...session,
      endedAt: Date.now(),
      durationSecs,
    });

    // Handle block
    if (blockPeer) {
      StorageService.blockPeer({
        id: session.peerId,
        pseudonym: session.peerPseudonym,
        reason: 'User blocked after call',
        blockedAt: Date.now(),
      });
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onFinish();
    }, 800);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        {/* Top Session Summary */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Call Completed</h2>
          <p className="text-xs text-slate-400 mt-1">
            Connected with <span className="text-slate-200 font-semibold">{session.peerPseudonym}</span> for{' '}
            <span className="text-amber-400 font-mono-numbers font-bold">{fmt(durationSecs)}</span>
          </p>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Topic: {session.sharedTopics.join(' · ')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          {/* Star Rating */}
          <div className="text-center space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              How did this conversation feel?
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((val) => {
                const isLit = (hoveredStar ?? stars) >= val;
                return (
                  <button
                    key={val}
                    type="button"
                    onMouseEnter={() => setHoveredStar(val)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setStars(val)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95"
                    aria-label={`${val} Stars`}
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                        isLit
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              {stars === 5
                ? 'Deeply comforting and heard'
                : stars === 4
                ? 'Warm & supportive'
                : stars === 3
                ? 'Neutral conversation'
                : 'Could have been better'}
            </p>
          </div>

          {/* Gratitude Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Gratitude Tokens (Anonymous)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {GRATITUDE_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 border ${
                      active
                        ? 'bg-amber-400/15 border-amber-400/60 text-amber-300 font-medium'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-amber-400" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Anonymous Word of Thanks (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Thank you for listening without interrupting. I needed that today."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-400/50 resize-none"
            />
          </div>

          {/* Block User Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-400 cursor-pointer p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <input
                type="checkbox"
                checked={blockPeer}
                onChange={(e) => setBlockPeer(e.target.checked)}
                className="accent-rose-500 rounded"
              />
              <ShieldBan className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Never match with {session.peerPseudonym} again (Mutual Block)</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitted}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSubmitted ? (
              <span>Saving Reflection...</span>
            ) : (
              <>
                <span>Complete Session & Return Home</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
