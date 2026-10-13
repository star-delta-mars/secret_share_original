import React, { useState } from 'react';
import { X, Server, Database, Shield, Zap, Copy, Check, ExternalLink } from 'lucide-react';

interface DeployGuideModalProps {
  onClose: () => void;
}

export const DeployGuideModal: React.FC<DeployGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'stack' | 'sql' | 'backend' | 'deploy'>('stack');
  const [copied, setCopied] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const sqlSchema = `-- Run this once in Neon SQL editor (neon.tech)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         VARCHAR(15) UNIQUE NOT NULL,
  name          VARCHAR(100) NOT NULL,
  verified      BOOLEAN DEFAULT FALSE,
  strike_count  INT DEFAULT 0,
  ban_status    VARCHAR(20) DEFAULT 'active',
  ban_until     TIMESTAMPTZ,
  trust_score   DECIMAL(3,2) DEFAULT 5.00,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  last_login    TIMESTAMPTZ
);

CREATE TABLE preferences (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  talk_topics   TEXT[] DEFAULT '{}',
  listen_topics TEXT[] DEFAULT '{}',
  call_types    TEXT[] DEFAULT '{"one_to_one"}',
  UNIQUE(user_id)
);

CREATE TABLE calls (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       VARCHAR(100) UNIQUE NOT NULL,
  call_type     VARCHAR(20) NOT NULL,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  ended_at      TIMESTAMPTZ,
  duration_secs INT
);

CREATE TABLE call_participants (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id    UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  left_at    TIMESTAMPTZ
);

CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID REFERENCES users(id),
  reported_id     UUID REFERENCES users(id),
  call_id         UUID REFERENCES calls(id),
  reason          VARCHAR(100) NOT NULL,
  clip_url        TEXT,
  status          VARCHAR(30) DEFAULT 'pending',
  consent_given   BOOLEAN,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE TABLE ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id    UUID REFERENCES users(id),
  ratee_id    UUID REFERENCES users(id),
  call_id     UUID REFERENCES calls(id),
  stars       INT CHECK (stars BETWEEN 1 AND 5),
  tags        TEXT[] DEFAULT '{}',
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blocks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- Fast matching indexes
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_ban_status ON users(ban_status);
CREATE INDEX idx_preferences_user ON preferences(user_id);
CREATE INDEX idx_call_participants_call ON call_participants(call_id);
CREATE INDEX idx_reports_reported ON reports(reported_id);
CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white">Full-Stack Architecture & Free Tier Blueprint</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              React (Vercel) + Node.js/Socket.io (Render) + Neon (Serverless Postgres) + Upstash Redis
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('stack')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'stack'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Stack & Limits (₹0/mo)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Neon PostgreSQL Schema
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'backend'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            WebRTC & Redis Matching
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'deploy'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Step-by-Step Deploy
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'stack' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <Database className="w-4 h-4" />
                    <span>Neon (Serverless Postgres)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Free tier: 0.5 GB storage, 190 compute hours/mo, scale-to-zero when idle, instant cold start.
                  </p>
                  <a
                    href="https://neon.tech"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline"
                  >
                    <span>neon.tech</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <Server className="w-4 h-4" />
                    <span>Render (Web Service)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Free tier: 750 hrs/month (1 service = always on). Pings via free UptimeRobot prevent 50s cold sleeps.
                  </p>
                  <a
                    href="https://render.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline"
                  >
                    <span>render.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <Zap className="w-4 h-4" />
                    <span>Upstash Redis (Match Queue)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Free tier: 10,000 commands/day, 256MB memory. Lightning fast queue locks and 30-sec TTL matchmaking.
                  </p>
                  <a
                    href="https://upstash.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline"
                  >
                    <span>upstash.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
                    <Shield className="w-4 h-4" />
                    <span>Metered.ca (TURN Relay)</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    Free tier: 1GB TURN relay bandwidth/month for traversing symmetric NATs and firewalls in P2P audio.
                  </p>
                  <a
                    href="https://metered.ca"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline"
                  >
                    <span>metered.ca</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span className="font-bold">Total Monthly Cost: ₹0 / $0.</span> Designed entirely within generous free tiers to support a full production MVP launch with no credit card requirement.
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Execute this SQL in Neon SQL Editor (Dashboard → SQL Editor):
                </p>
                <button
                  onClick={() => copyText(sqlSchema, 'sql')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                >
                  {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'sql' ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono-numbers text-slate-300 overflow-x-auto">
                {sqlSchema}
              </pre>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Redis 30-Second TTL Match Algorithm</h4>
                <p className="text-slate-400">
                  1. User emits <code className="text-amber-300">join_queue</code> with desired call type and topics.
                </p>
                <p className="text-slate-400">
                  2. Redis queries current candidates in <code className="text-amber-300">match_queue</code>. Checks mutual block lists in Neon SQL.
                </p>
                <p className="text-slate-400">
                  3. Topic intersection calculated. If shared topic exists, candidate is popped from queue, a random room UUID is generated, and a call record is saved in Neon.
                </p>
                <p className="text-slate-400">
                  4. Socket emits <code className="text-amber-300">match_found</code> with WebRTC offer signal to initiator.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">WebRTC Direct Voice Channel</h4>
                <p className="text-slate-400">
                  Audio tracks stream peer-to-peer using Google STUN (<code className="text-amber-300">stun:stun.l.google.com:19302</code>) and Metered TURN relay fallback. Audio never touches the Node server during conversation, ensuring zero bandwidth server load and total end-to-end privacy!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deploy' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-amber-400 mb-1">Step 1: Database (Neon)</h5>
                  <p className="text-slate-400">
                    Create new Postgres project at neon.tech. Paste <code className="text-amber-300">schema.sql</code> into SQL Editor. Copy the connection string.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-amber-400 mb-1">Step 2: Backend (Render)</h5>
                  <p className="text-slate-400">
                    Connect GitHub repo to Render Web Service. Root dir: <code className="text-amber-300">/server</code>. Build command: <code className="text-amber-300">npm install</code>, Start command: <code className="text-amber-300">node src/index.js</code>. Add <code className="text-amber-300">DATABASE_URL</code> and <code className="text-amber-300">JWT_SECRET</code>.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-amber-400 mb-1">Step 3: Uptime Keepalive</h5>
                  <p className="text-slate-400">
                    Add free HTTP monitor on uptimerobot.com to <code className="text-amber-300">https://your-backend.onrender.com/health</code> every 10 mins. Prevents Render cold sleep!
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <h5 className="font-bold text-amber-400 mb-1">Step 4: Frontend (Vercel)</h5>
                  <p className="text-slate-400">
                    Import GitHub repo on Vercel. Set Root Directory to <code className="text-amber-300">client</code>. Add <code className="text-amber-300">VITE_API_URL</code> pointing to your Render service URL.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>Production Ready · Zero Cost Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
