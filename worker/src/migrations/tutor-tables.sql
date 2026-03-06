-- AI Tutor tables
CREATE TABLE IF NOT EXISTS tutor_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  subject TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'year1',
  title TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES tutor_conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id),
  paystack_sub_code TEXT,
  paystack_customer_code TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end INTEGER,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS tutor_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  question_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_tutor_conv_user ON tutor_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_conv_updated ON tutor_conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_conv ON tutor_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tutor_msg_created ON tutor_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_sub_user ON tutor_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutor_usage_user_date ON tutor_usage(user_id, date);
