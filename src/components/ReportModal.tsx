import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface ReportModalProps {
  callId: string;
  peerPseudonym: string;
  onSubmit: (reason: string) => void;
  onCancel: () => void;
}

const REPORT_REASONS = [
  'Sharing or Demanding Personal Info (PII)',
  'Harassment or Degrading Language',
  'Explicit Sexual Content',
  'Threats, Self-Harm or Violence',
  'Commercial Solicitation or Scam',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  callId,
  peerPseudonym,
  onSubmit,
  onCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [consentAudio, setConsentAudio] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRecordingSeconds((prev) => Math.min(15, prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save report in storage
    StorageService.saveReport({
      id: `rep_${Date.now()}`,
      callId,
      reportedPseudonym: peerPseudonym,
      reason: selectedReason,
      details,
      hasAudioClip: consentAudio,
      timestamp: Date.now(),
      status: 'pending',
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(selectedReason);
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 bg-slate-900 border border-rose-900/40 rounded-2xl shadow-2xl shadow-rose-950/50">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Report Received</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Your safety report against {peerPseudonym} has been encrypted and submitted. The user
              has been flagged for review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Report Safety Violation</h3>
                <p className="text-xs text-slate-400">Caller: {peerPseudonym}</p>
              </div>
            </div>

            {/* Smart 15-second audio clip notice */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-slate-300 font-medium">Smart Evidence Buffer</span>
              </div>
              <span className="font-mono-numbers text-amber-400">{recordingSeconds}s / 15s</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Reason for Report</label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Context details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Briefly describe what happened..."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500/50 resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-400 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentAudio}
                onChange={(e) => setConsentAudio(e.target.checked)}
                className="mt-0.5 accent-rose-500 rounded"
              />
              <span>
                I authorize sending the anonymous 15s audio evidence buffer to the trust & safety team.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-rose-950/60"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {isSubmitting ? 'Transmitting...' : 'Submit & End Call'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
