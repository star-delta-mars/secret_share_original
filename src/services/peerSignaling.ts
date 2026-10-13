import { CallSession, CallType } from '../types';
import { generatePseudonym, StorageService } from './storageService';

export interface MatchQueuePayload {
  userId: string;
  pseudonym: string;
  callType: CallType;
  topics: string[];
  role: 'talker' | 'listener' | 'any';
  timestamp: number;
}

type MatchCallback = (session: CallSession) => void;

class PeerSignaling {
  private channel: BroadcastChannel | null = null;
  private currentQueuePayload: MatchQueuePayload | null = null;
  private onMatchFound: MatchCallback | null = null;
  private simulationTimer: number | null = null;

  constructor() {
    try {
      this.channel = new BroadcastChannel('secret_share_p2p_channel');
      this.channel.onmessage = this.handleChannelMessage.bind(this);
    } catch (e) {
      console.warn('BroadcastChannel not supported in this environment', e);
    }
  }

  private handleChannelMessage(event: MessageEvent) {
    const data = event.data;
    if (!data || !this.currentQueuePayload) return;

    if (data.type === 'QUEUE_OFFER') {
      const incoming: MatchQueuePayload = data.payload;
      // Do not match with self
      if (incoming.userId === this.currentQueuePayload.userId) return;

      // Check blocks
      const blocked = StorageService.getBlockedPeers();
      if (blocked.some((b) => b.id === incoming.userId)) return;

      // Check call type match
      if (incoming.callType !== this.currentQueuePayload.callType) return;

      // Check role compatibility: one talker and one listener, or 'any'
      const roleCompatible =
        this.currentQueuePayload.role === 'any' ||
        incoming.role === 'any' ||
        this.currentQueuePayload.role !== incoming.role;

      if (!roleCompatible) return;

      // Check shared topics
      const shared = this.currentQueuePayload.topics.filter((t) => incoming.topics.includes(t));
      const effectiveTopics = shared.length > 0 ? shared : [this.currentQueuePayload.topics[0] || 'General Confession'];

      // Deterministic roomId created by the younger timestamp
      const roomId = `room_${Math.min(this.currentQueuePayload.timestamp, incoming.timestamp)}_${Math.max(
        this.currentQueuePayload.timestamp,
        incoming.timestamp
      )}`;

      // Accept match and notify peer
      const session: CallSession = {
        id: `call_${Date.now()}`,
        roomId,
        callType: this.currentQueuePayload.callType,
        startedAt: Date.now(),
        peerPseudonym: incoming.pseudonym,
        peerId: incoming.userId,
        sharedTopics: effectiveTopics,
        isInitiator: this.currentQueuePayload.timestamp < incoming.timestamp,
      };

      this.channel?.postMessage({
        type: 'QUEUE_ANSWER',
        targetUserId: incoming.userId,
        session: {
          ...session,
          peerPseudonym: this.currentQueuePayload.pseudonym,
          peerId: this.currentQueuePayload.userId,
          isInitiator: !session.isInitiator,
        },
      });

      this.stopQueue();
      if (this.onMatchFound) {
        this.onMatchFound(session);
      }
    } else if (data.type === 'QUEUE_ANSWER') {
      if (data.targetUserId === this.currentQueuePayload?.userId) {
        this.stopQueue();
        if (this.onMatchFound) {
          this.onMatchFound(data.session);
        }
      }
    }
  }

  startQueue(payload: MatchQueuePayload, onMatch: MatchCallback, allowSimulatedStranger = true) {
    this.stopQueue();
    this.currentQueuePayload = payload;
    this.onMatchFound = onMatch;

    // Broadcast search to other open tabs
    this.channel?.postMessage({
      type: 'QUEUE_OFFER',
      payload,
    });

    // In case no other tab connects within 4-7 seconds, auto-match with a realistic anonymous peer
    if (allowSimulatedStranger) {
      const waitTimeMs = 3800 + Math.floor(Math.random() * 2500);
      this.simulationTimer = window.setTimeout(() => {
        if (!this.currentQueuePayload) return;

        const peerPseudonym = generatePseudonym();
        const sharedTopics = payload.topics.slice(0, 2);
        if (sharedTopics.length === 0) sharedTopics.push('Things I never told anyone');

        const session: CallSession = {
          id: `call_sim_${Date.now()}`,
          roomId: `room_sim_${Math.random().toString(36).substring(2, 9)}`,
          callType: payload.callType,
          startedAt: Date.now(),
          peerPseudonym,
          peerId: `peer_${Math.random().toString(36).substring(2, 8)}`,
          sharedTopics,
          isInitiator: true,
        };

        this.stopQueue();
        if (this.onMatchFound) {
          this.onMatchFound(session);
        }
      }, waitTimeMs);
    }
  }

  instantSimulatedMatch(payload: MatchQueuePayload, onMatch: MatchCallback) {
    this.stopQueue();
    const peerPseudonym = generatePseudonym();
    const sharedTopics = payload.topics.slice(0, 2);
    if (sharedTopics.length === 0) sharedTopics.push('Things I never told anyone');

    const session: CallSession = {
      id: `call_sim_${Date.now()}`,
      roomId: `room_sim_${Math.random().toString(36).substring(2, 9)}`,
      callType: payload.callType,
      startedAt: Date.now(),
      peerPseudonym,
      peerId: `peer_${Math.random().toString(36).substring(2, 8)}`,
      sharedTopics,
      isInitiator: true,
    };

    onMatch(session);
  }

  stopQueue() {
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
      this.simulationTimer = null;
    }
    this.currentQueuePayload = null;
  }
}

export const peerSignaling = new PeerSignaling();
