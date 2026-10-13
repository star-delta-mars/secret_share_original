import React, { useState, useEffect } from 'react';
import { User, UserPreferences, CallSession } from './types';
import { StorageService, generatePseudonym } from './services/storageService';
import { Header } from './components/Header';
import { DeployGuideModal } from './components/DeployGuideModal';
import { Onboarding } from './pages/Onboarding';
import { OTPVerify } from './pages/OTPVerify';
import { Home } from './pages/Home';
import { Preferences } from './pages/Preferences';
import { Lobby } from './pages/Lobby';
import { InCall } from './pages/InCall';
import { PostCall } from './pages/PostCall';
import { Profile } from './pages/Profile';

export default function App() {
  const [user, setUser] = useState<User | null>(() => StorageService.getUser());
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    StorageService.getPreferences()
  );
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [onboardingStep, setOnboardingStep] = useState<'phone' | 'otp'>('phone');
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingCountryCode, setPendingCountryCode] = useState('91');
  const [pendingPseudonym, setPendingPseudonym] = useState('');
  const [activeSession, setActiveSession] = useState<CallSession | null>(null);
  const [lastDuration, setLastDuration] = useState(0);
  const [roleOverride, setRoleOverride] = useState<'talker' | 'listener' | 'any'>('any');
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  // If user is null, default with guest or allow onboarding
  useEffect(() => {
    if (!user) {
      // By default show onboarding screen
      setOnboardingStep('phone');
    }
  }, [user]);

  // Handle Onboarding submission
  const handleOnboardingContinue = (
    phone: string,
    countryCode: string,
    pseudonym: string,
    isInstant: boolean
  ) => {
    if (isInstant) {
      const guest = StorageService.createGuestUser(countryCode + phone, pseudonym);
      setUser(guest);
      setCurrentTab('home');
    } else {
      setPendingPhone(phone);
      setPendingCountryCode(countryCode);
      setPendingPseudonym(pseudonym);
      setOnboardingStep('otp');
    }
  };

  const handleInstantGuest = (guestUser: User) => {
    setUser(guestUser);
    setCurrentTab('home');
  };

  const handleOTPVerified = (verifiedUser: User) => {
    setUser(verifiedUser);
    setCurrentTab('home');
  };

  const handleStartMatching = (role: 'talker' | 'listener' | 'any' = 'any') => {
    setRoleOverride(role);
    setCurrentTab('lobby');
  };

  const handleMatchFound = (session: CallSession) => {
    setActiveSession(session);
    setCurrentTab('incall');
  };

  const handleEndCall = (durationSecs: number) => {
    setLastDuration(durationSecs);
    setCurrentTab('postcall');
  };

  const handlePostCallFinish = () => {
    setActiveSession(null);
    setCurrentTab('home');
  };

  const handleResetUser = () => {
    StorageService.clearAll();
    setUser(null);
    setActiveSession(null);
    setOnboardingStep('phone');
    setCurrentTab('home');
  };

  const handleNavigate = (tab: string) => {
    if (tab === 'blueprint') {
      setShowBlueprintModal(true);
      return;
    }
    setCurrentTab(tab);
  };

  // Render Onboarding flow if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-lg font-bold text-white tracking-tight">Secret Share</span>
          </div>
          <button
            onClick={() => setShowBlueprintModal(true)}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Free-Tier Stack Blueprint
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center">
          {onboardingStep === 'phone' ? (
            <Onboarding
              onContinue={handleOnboardingContinue}
              onInstantGuest={handleInstantGuest}
            />
          ) : (
            <OTPVerify
              phone={pendingPhone}
              countryCode={pendingCountryCode}
              pseudonym={pendingPseudonym}
              onVerified={handleOTPVerified}
              onBack={() => setOnboardingStep('phone')}
            />
          )}
        </main>

        {showBlueprintModal && (
          <DeployGuideModal onClose={() => setShowBlueprintModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400/20 selection:text-amber-200">
      {/* Top Bar adheres to strict Top Bar Contract */}
      {currentTab !== 'incall' && (
        <Header
          currentTab={currentTab}
          onNavigate={handleNavigate}
          user={user}
          onStartMatch={() => handleStartMatching('any')}
          isInCall={!!activeSession && currentTab === 'incall'}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <Home
            user={user}
            preferences={preferences}
            callHistory={StorageService.getCallHistory()}
            onStartMatching={handleStartMatching}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'preferences' && (
          <Preferences
            initialPrefs={preferences}
            onSave={(newPrefs) => setPreferences(newPrefs)}
            onProceedToHome={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'lobby' && (
          <Lobby
            user={user}
            preferences={preferences}
            roleOverride={roleOverride}
            onMatchFound={handleMatchFound}
            onCancel={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'incall' && activeSession && (
          <InCall
            session={activeSession}
            initialDisguise={preferences.voiceDisguise}
            onEndCall={handleEndCall}
          />
        )}

        {currentTab === 'postcall' && activeSession && (
          <PostCall
            session={activeSession}
            durationSecs={lastDuration}
            onFinish={handlePostCallFinish}
          />
        )}

        {currentTab === 'profile' && (
          <Profile
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onResetUser={handleResetUser}
          />
        )}
      </main>

      {/* Free Tier Architecture Blueprint Modal */}
      {showBlueprintModal && (
        <DeployGuideModal onClose={() => setShowBlueprintModal(false)} />
      )}
    </div>
  );
}
