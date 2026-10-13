export type CallType = 'one_to_one' | 'group_venting' | 'mindful_silence';

export type VoiceDisguise = 'natural' | 'warm_mask' | 'privacy_pitch' | 'subtle_echo';

export interface User {
  id: string;
  phone: string;
  name: string; // e.g. "Anonymous Traveler" or pseudonym
  verified: boolean;
  strikeCount: number;
  banStatus: 'active' | 'suspended' | 'banned';
  trustScore: number; // default 5.00
  createdAt: number;
  lastLogin: number;
}

export interface UserPreferences {
  talkTopics: string[];
  listenTopics: string[];
  callTypes: CallType[];
  voiceDisguise: VoiceDisguise;
  matchRole: 'talker' | 'listener' | 'any';
}

export interface CallSession {
  id: string;
  roomId: string;
  callType: CallType;
  startedAt: number;
  endedAt?: number;
  durationSecs?: number;
  peerPseudonym: string;
  peerId: string;
  sharedTopics: string[];
  isInitiator: boolean;
}

export interface ReportItem {
  id: string;
  callId: string;
  reportedPseudonym: string;
  reason: string;
  details?: string;
  hasAudioClip: boolean;
  timestamp: number;
  status: 'pending' | 'under_review' | 'resolved';
}

export interface CallRating {
  id: string;
  callId: string;
  stars: number;
  tags: string[];
  note?: string;
  timestamp: number;
}

export interface BlockedPeer {
  id: string;
  pseudonym: string;
  reason?: string;
  blockedAt: number;
}
