import { User, UserPreferences, CallSession, CallRating, BlockedPeer, ReportItem } from '../types';
import { ALL_TOPICS } from '../constants/topics';

const STORAGE_KEYS = {
  USER: 'secret_share_user',
  PREFERENCES: 'secret_share_preferences',
  CALL_HISTORY: 'secret_share_call_history',
  RATINGS: 'secret_share_ratings',
  BLOCKS: 'secret_share_blocks',
  REPORTS: 'secret_share_reports',
};

const RANDOM_PSEUDONYMS = [
  'Midnight Wanderer',
  'Gentle Embers',
  'Quiet Pine',
  'Solitary Wave',
  'Whispering Reed',
  'Dusk Stargazer',
  'Distant Echo',
  'Peaceful Stone',
  'Amber Lantern',
  'North Constellation',
  'Silent River',
  'Velvet Horizon',
];

export function generatePseudonym(): string {
  const name = RANDOM_PSEUDONYMS[Math.floor(Math.random() * RANDOM_PSEUDONYMS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${name} #${num}`;
}

export const StorageService = {
  getUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    return null;
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  createGuestUser(phone = '919876543210', customName?: string): User {
    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      phone,
      name: customName || generatePseudonym(),
      verified: true,
      strikeCount: 0,
      banStatus: 'active',
      trustScore: 5.0,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    };
    this.setUser(newUser);
    return newUser;
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Default preferences
    return {
      talkTopics: [ALL_TOPICS[0], ALL_TOPICS[1], ALL_TOPICS[6]],
      listenTopics: [ALL_TOPICS[0], ALL_TOPICS[5], ALL_TOPICS[10], ALL_TOPICS[15]],
      callTypes: ['one_to_one'],
      voiceDisguise: 'warm_mask',
      matchRole: 'any',
    };
  },

  setPreferences(prefs: UserPreferences): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  },

  getCallHistory(): CallSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CALL_HISTORY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    // Seed with 2 past calls to make the history authentic and warm
    const seed: CallSession[] = [
      {
        id: 'call_seed_1',
        roomId: 'room_seed_1',
        callType: 'one_to_one',
        startedAt: Date.now() - 86400000 * 2,
        endedAt: Date.now() - 86400000 * 2 + 740000,
        durationSecs: 740,
        peerPseudonym: 'Midnight Wanderer #7821',
        peerId: 'peer_seed_1',
        sharedTopics: ['Things I never told anyone', 'Quiet guilt I carry'],
        isInitiator: false,
      },
      {
        id: 'call_seed_2',
        roomId: 'room_seed_2',
        callType: 'one_to_one',
        startedAt: Date.now() - 86400000 * 4,
        endedAt: Date.now() - 86400000 * 4 + 510000,
        durationSecs: 510,
        peerPseudonym: 'Amber Lantern #3291',
        peerId: 'peer_seed_2',
        sharedTopics: ['Imposter syndrome & burnout'],
        isInitiator: true,
      },
    ];
    return seed;
  },

  saveCall(call: CallSession): void {
    const list = this.getCallHistory();
    list.unshift(call);
    localStorage.setItem(STORAGE_KEYS.CALL_HISTORY, JSON.stringify(list));
  },

  getBlockedPeers(): BlockedPeer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLOCKS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return [];
  },

  blockPeer(peer: BlockedPeer): void {
    const list = this.getBlockedPeers().filter((b) => b.id !== peer.id);
    list.unshift(peer);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(list));
  },

  unblockPeer(peerId: string): void {
    const list = this.getBlockedPeers().filter((b) => b.id !== peerId);
    localStorage.setItem(STORAGE_KEYS.BLOCKS, JSON.stringify(list));
  },

  saveRating(rating: CallRating): void {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.RATINGS) || '[]');
      existing.unshift(rating);
      localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(existing));
    } catch {
      // fallback
    }
  },

  saveReport(report: ReportItem): void {
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]');
      existing.unshift(report);
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(existing));
    } catch {
      // fallback
    }
  },

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  },
};
