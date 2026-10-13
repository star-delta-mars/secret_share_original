import { CallType } from '../types';

export interface TopicCategory {
  id: string;
  label: string;
  topics: string[];
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: 'emotional_confessions',
    label: 'Secrets & Confessions',
    topics: [
      'Things I never told anyone',
      'Quiet guilt I carry',
      'The double life I present vs live',
      'A decision I still wonder about',
      'Secrets about my real ambitions',
    ],
  },
  {
    id: 'relationships',
    label: 'Heartbreak & Longing',
    topics: [
      'Unresolved breakups',
      'Feeling lonely in a relationship',
      'Unrequited feelings & unspoken love',
      'Friendship drift & quiet endings',
      'Dating app burnout & exhaustion',
    ],
  },
  {
    id: 'work_burnout',
    label: 'Career & Life Direction',
    topics: [
      'Imposter syndrome & burnout',
      'Hating my corporate job',
      'Fear of taking the creative leap',
      'Financial anxiety & secret debts',
      'Lost in my twenties / thirties',
    ],
  },
  {
    id: 'solitude_healing',
    label: 'Midnight Solitude & Healing',
    topics: [
      'Insomnia & midnight overthinking',
      'Grief and absent people',
      'Family expectations & pressure',
      'Social anxiety in loud crowds',
      'A quiet win nobody celebrated',
    ],
  },
];

export const ALL_TOPICS = TOPIC_CATEGORIES.flatMap((c) => c.topics);

export const CALL_TYPE_CONFIG: Record<
  CallType,
  {
    title: string;
    description: string;
    durationEstimate: string;
    badge: string;
    icon: string;
  }
> = {
  one_to_one: {
    title: '1-on-1 Confidential Call',
    description: 'Direct end-to-end voice channel with one anonymous listener or talker.',
    durationEstimate: '10–20 mins',
    badge: 'Peer-to-Peer',
    icon: 'PhoneCall',
  },
  group_venting: {
    title: 'Campfire Venting (3-4 Peers)',
    description: 'Shared room where members pass the microphone to vent on common topics.',
    durationEstimate: '15–30 mins',
    badge: 'Group Circle',
    icon: 'Users',
  },
  mindful_silence: {
    title: 'Silent Empathetic Presence',
    description: 'Zero speaking pressure. Co-presence with ambient white noise and gentle breathers.',
    durationEstimate: '5–15 mins',
    badge: 'Co-Presence',
    icon: 'Moon',
  },
};

export const ICEBREAKER_PROMPTS = [
  "What is a thought that kept you awake at 2 AM recently?",
  "If no one could ever judge you, what would you admit right now?",
  "What's something heavy you've had to carry alone this week?",
  "What is a tiny victory that happened recently which no one noticed?",
  "Who do you wish you could have one honest 5-minute phone call with?",
  "What part of your personality do you hide when you are in public?",
  "If you could hit pause on life for 48 hours, what would you do?",
];

export const GRATITUDE_TAGS = [
  'Deep Listener',
  'Non-Judgmental',
  'Gentle & Calming',
  'Wise Perspective',
  'Felt Safe & Heard',
  'Authentic',
  'Lightened My Mind',
  'Patient',
];

export const SAFETY_PLEDGE = [
  'No PII: Never ask for or share real names, phone numbers, handles, or locations.',
  'Zero Toxicity: Immediate strike & permanent device ban for harassment, threats, or hate speech.',
  'Consent-Based: You can hang up instantly at any second with zero penalty or awkwardness.',
  'Encrypted Channel: Calls use ephemeral peer-to-peer WebRTC connections with zero permanent call recordings.',
];
