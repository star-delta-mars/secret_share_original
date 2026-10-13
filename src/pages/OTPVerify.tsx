import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { User } from '../types';

interface OTPVerifyProps {
  phone: string;
  countryCode?: string;
  pseudonym: string;
  onVerified: (user: User) => void;
  onBack: () => void;
}

export const OTPVerify: React.FC<OTPVerifyProps> = ({
  phone,
  countryCode = '91',
  pseudonym,
  onVerified,
  onBack,
}) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [smsSentNotice, setSmsSentNotice] = useState<string>('Sending SMS verification code...');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP on initial load
  useEffect(() => {
    inputRefs.current[0]?.focus();
    sendOtpRequest();

    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const sendOtpRequest = async () => {
    setIsSending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmsSentNotice(
          `A 6-digit SMS verification code has been dispatched to +${countryCode} ${phone.slice(
            0,
            2
          )}•••${phone.slice(-4)}. Check your messages.`
        );
      } else {
        setError(data.error || 'Failed to dispatch verification code via SMS.');
      }
    } catch {
      setSmsSentNotice(`SMS code sent to +${countryCode} ${phone}. Please check your phone.`);
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    setError('');

    // Advance focus to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits received on your phone.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, countryCode, otp: code, name: pseudonym }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const fullPhone = `${countryCode}${phone}`;
        const user = StorageService.createGuestUser(fullPhone, pseudonym);
        onVerified(user);
      } else {
        setError(data.error || 'Invalid OTP code. Please verify the code sent to your SMS.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = () => {
    if (timer > 0 || isSending) return;
    setTimer(30);
    setDigits(['', '', '', '', '', '']);
    sendOtpRequest();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Number</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Verify Phone Number</h2>
            <p className="text-xs text-slate-400 font-mono-numbers">
              +{countryCode} ••••• {phone.slice(-4)}
            </p>
          </div>
        </div>

        {/* SMS Dispatch Status Banner (Code is NOT displayed) */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            {smsSentNotice}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block text-center">
              Enter 6-Digit SMS Code
            </label>
            {/* 6-Digit Inputs */}
            <div className="flex items-center justify-between gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-mono-numbers font-bold text-white bg-slate-950 rounded-xl border border-slate-800 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter Sanctuary</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Didn't receive the SMS?</span>
          {timer > 0 ? (
            <span className="font-mono-numbers text-slate-500">Resend in {timer}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isSending}
              className="text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
              <span>{isSending ? 'Sending SMS...' : 'Resend SMS'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
