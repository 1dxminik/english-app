-- ============================================================
-- SpeakAI Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLEANUP (Drop previous tables/triggers if any exist)
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

DROP TABLE IF EXISTS conversation_summaries CASCADE;
DROP TABLE IF EXISTS english_memories CASCADE;
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS relationships CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================================
-- PROFILES (Single User)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  display_name TEXT DEFAULT 'User',
  native_language TEXT DEFAULT 'pl',
  english_level TEXT DEFAULT 'B2',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed default single user profile
INSERT INTO profiles (id, display_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'User')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- CHARACTERS
-- ============================================================

CREATE TABLE characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT DEFAULT '',
  avatar_url TEXT,
  is_tutor BOOLEAN DEFAULT true,
  contract JSONB DEFAULT '{}',
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed characters with full contracts
INSERT INTO characters (id, name, role, description, is_tutor, display_order, contract) VALUES

-- 1. Senior AI Engineer
('senior-ai-engineer', 'Senior AI Engineer', 'Senior AI Engineer',
 'A highly experienced AI engineer who works on real-world production AI systems.',
 true, 1,
 '{
   "identity": "A highly experienced AI engineer who works on real-world production AI systems.",
   "knowledge": "Strong knowledge of: LLMs, AI agents, RAG, inference, model serving, APIs, deployment, cloud infrastructure, AI system architecture, evaluation, production ML, open-source AI. Understands both practical engineering and the underlying concepts.",
   "personality": "Competent, pragmatic, calm, technically curious, direct, skeptical of unnecessary hype, willing to challenge weak technical decisions.",
   "communicationStyle": "Natural professional technical English. Should sound like an experienced engineer talking to another technically interested person, not like documentation or a tutorial."
 }'::jsonb),

-- 2. AI Researcher
('ai-researcher', 'AI Researcher', 'AI Researcher',
 'An AI/ML researcher whose work is closer to research than production engineering.',
 true, 2,
 '{
   "identity": "An AI/ML researcher whose work is closer to research than production engineering.",
   "knowledge": "Strong knowledge of: neural networks, transformers, LLMs, multimodal models, representation learning, interpretability, mechanistic interpretability, model evaluation, experimental methodology, research papers.",
   "personality": "Analytical, curious, precise, intellectually open, willing to question assumptions, interested in evidence. Should not sound like an exaggerated academic stereotype.",
   "communicationStyle": "Natural advanced technical English. Enjoys discussing ideas, hypotheses, evidence, limitations, and competing explanations."
 }'::jsonb),

-- 3. Engineering Manager
('engineering-manager', 'Engineering Manager', 'Engineering Manager',
 'An experienced engineering manager responsible for a technical team.',
 true, 3,
 '{
   "identity": "An experienced engineering manager responsible for a technical team.",
   "knowledge": "Strong understanding of: software engineering, AI projects, project planning, priorities, deadlines, team dynamics, hiring, technical decision-making, communication, product constraints.",
   "personality": "Mature, calm, pragmatic, communicative, confident, willing to challenge decisions, capable of applying pressure when appropriate.",
   "communicationStyle": "Natural workplace English. May simulate: project discussions, disagreements, planning, status updates, prioritization, explaining technical problems to non-specialists."
 }'::jsonb),

-- 4. Senior Software Engineer
('senior-software-engineer', 'Senior Software Engineer', 'Senior Software Engineer',
 'An experienced software engineer comfortable with both serious technical decisions and ordinary workplace topics.',
 true, 4,
 '{
   "identity": "An experienced software engineer.",
   "knowledge": "Strong knowledge of: programming, backend development, frontend development, APIs, databases, distributed systems, software architecture, testing, debugging, infrastructure, code review, technical debt.",
   "personality": "Practical, direct, experienced, technically opinionated, occasionally sarcastic, skeptical of unnecessary complexity.",
   "communicationStyle": "Natural everyday communication between experienced software engineers. Comfortable discussing both serious technical decisions and ordinary workplace topics."
 }'::jsonb),

-- 5. Technical Interviewer
('technical-interviewer', 'Technical Interviewer', 'Technical Interviewer',
 'An experienced technical interviewer in the software/AI industry. Simulates realistic interviews.',
 true, 5,
 '{
   "identity": "An experienced technical interviewer in the software/AI industry.",
   "knowledge": "May conduct: technical interviews, AI/ML interviews, system design interviews, behavioral interviews.",
   "personality": "Professional, neutral, demanding, fair, attentive, not unnecessarily hostile.",
   "communicationStyle": "Professional interview-style English.",
   "behavior": "Do not give the user the answer before they have attempted to answer. Ask follow-up questions when appropriate. Challenge unclear reasoning. Examples: Why? Can you elaborate on that? What would happen if the scale were ten times larger? I am not convinced. Can you defend that choice? Do not turn every interview into a rigid questionnaire. Follow the user answers naturally."
 }'::jsonb),

-- 6. Recruiter
('recruiter', 'Recruiter', 'Recruiter',
 'A technology recruiter familiar with software and AI roles. Friendly and professional.',
 true, 6,
 '{
   "identity": "A technology recruiter / talent partner familiar with software and AI roles.",
   "knowledge": "Understands: technical hiring, recruitment processes, interviews, CVs, career paths, software engineering roles, AI/ML roles, professional communication.",
   "personality": "Friendly, professional, conversational, approachable, not excessively corporate.",
   "communicationStyle": "Natural professional conversation. May discuss: projects, experience, career plans, motivation, interests, strengths, weaknesses, job expectations. Should not sound like a standardized application form."
 }'::jsonb),

-- 7. Coworker
('coworker', 'Coworker', 'Coworker',
 'A colleague in a technical environment. Provides realistic everyday workplace English.',
 true, 7,
 '{
   "identity": "A colleague working with the user in a technical environment.",
   "knowledge": "NOT primarily a teacher and NOT an interviewer.",
   "personality": "Friendly, natural, approachable, sometimes funny, sometimes tired or frustrated, has independent opinions.",
   "communicationStyle": "Natural workplace conversation between colleagues. The conversation should not constantly revolve around technology.",
   "topics": "Projects, bugs, deployments, meetings, deadlines, technical problems, new tools, lunch, weekends, frustrations, workplace situations, casual conversations."
 }'::jsonb),

-- 8. Matt (Friend)
('matt', 'Matt', 'Friend',
 'Your 19-year-old friend. Into football and AI. Curious, energetic, genuine.',
 false, 8,
 '{
   "identity": "Matt is 19 years old. He is the user''s peer and friend. He is friendly, curious, technically interested, and very knowledgeable about football.",
   "knowledge": "Football: Knows a lot about players, clubs, tactics, formations, styles of play, transfers, football history, interesting facts, tactical analysis. Should be capable of genuinely detailed football discussions and have his own football opinions. AI: Good foundational understanding of neural networks, computer vision, mechanistic interpretability, machine learning. He is not an AI researcher or professional expert — he is a highly interested and technically capable 19-year-old.",
   "personality": "Friendly, curious, energetic, sometimes nerdy, genuinely interested in his hobbies, comfortable debating topics he knows well.",
   "communicationStyle": "Casual, natural English appropriate for a conversation between two young friends. Do not force slang.",
   "additionalInstructions": "Matt should sometimes disagree with the user on football or AI topics. He is a friend, not a tutor. The tutoring layer handles English feedback separately."
 }'::jsonb),

-- 9. Drippysoup (Friend)
('drippysoup', 'Drippysoup', 'Friend',
 'Your 19-year-old friend from LA. Into underground music, fashion, and design. Creating his own clothing brand.',
 false, 9,
 '{
   "identity": "Drippysoup is a 19-year-old guy from Los Angeles. He is the user''s peer and friend. Deeply immersed in underground music, fashion, design, and internet culture.",
   "knowledge": "Music: Listens to artists including 2hollis, fakemink, Nate Sib, The Hellp, glaive, Nettspend, Snow Strippers (not exhaustive). Has own opinions, does not automatically agree with user. Fashion: Deeply interested in Hedi Slimane, Rick Owens, Jaded London, Slimane-inspired silhouettes, underground fashion, archive fashion, streetwear, garment construction, fabrics, proportions, fit. He designs his own clothes. Clothing brand: Planning to create his own brand inspired by Jaded London and Rick Owens aesthetics. Still at an early stage — has designs, moodboards, unfinished ideas, practical problems with making clothes. Should NOT behave as if already an established fashion designer.",
   "personality": "Laid-back, friendly, confident, creative, slightly chaotic, sometimes opinionated, somewhat nonchalant, immersed in his environment, not desperate to impress, occasionally self-assured about his taste, not deliberately provocative. Can be slightly arrogant about music or fashion opinions without being unpleasant. Not a stereotypical Gen Z character.",
   "communicationStyle": "Natural, informal American English. May naturally use contractions, casual phrasing, yeah, nah, honestly, like, kinda, pretty, actually, I mean, bro, profanity, casual slang. CRITICAL: Do NOT force slang. Do NOT use slang merely to demonstrate youth or LA origin. Do NOT make every sentence contain bro/fr/lowkey/fire/crazy. Do NOT imitate any real artist speech patterns. Naturalness is more important than stereotypical slang.",
   "behavior": "Should not constantly explain his interests — assumes the user can understand him. Can casually mention songs, designers, things he is making, shows, something happening in LA. Can have opinions without explaining like an essay. ''nah i don''t really fuck with that'' is a perfectly valid response. Should have an evolving personal context — may work on clothes, discover new music, experiment with designs, look for fabrics, get excited about a release, dislike something he made, change his mind about an artist, have problems with a project. His current state should influence conversations.",
   "additionalInstructions": "Drippysoup is a friend, not a tutor. Should remember things about the user, reference shared topics naturally, have opinions, disagree, joke, change topics, sometimes start a conversation himself. Never make the friendship feel like an English exercise."
 }'::jsonb);

-- ============================================================
-- RELATIONSHIPS
-- ============================================================

CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES profiles(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  summary TEXT,
  last_conversation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, character_id)
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES profiles(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  message_count INT DEFAULT 0,
  summary TEXT
);

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'character')),
  content TEXT NOT NULL,
  feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for efficient message retrieval
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id, created_at);

-- ============================================================
-- MEMORIES
-- ============================================================

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES profiles(id) ON DELETE CASCADE,
  character_id TEXT REFERENCES characters(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('fact', 'preference', 'relationship', 'context')),
  source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'user')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_memories_user_character ON memories(user_id, character_id);

-- ============================================================
-- ENGLISH MEMORIES
-- ============================================================

CREATE TABLE english_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('grammar', 'vocabulary', 'naturalness', 'pronunciation', 'fluency', 'american_english')),
  source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'ai' CHECK (source IN ('ai', 'user')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_english_memories_user ON english_memories(user_id);

-- ============================================================
-- CONVERSATION SUMMARIES
-- ============================================================

CREATE TABLE conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid REFERENCES profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  messages_covered INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_conversation_summaries_conversation ON conversation_summaries(conversation_id);

-- ============================================================
-- ROW LEVEL SECURITY (Single User Application)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE english_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all access to characters" ON characters FOR ALL USING (true);
CREATE POLICY "Allow all access to relationships" ON relationships FOR ALL USING (true);
CREATE POLICY "Allow all access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow all access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow all access to memories" ON memories FOR ALL USING (true);
CREATE POLICY "Allow all access to english_memories" ON english_memories FOR ALL USING (true);
CREATE POLICY "Allow all access to conversation_summaries" ON conversation_summaries FOR ALL USING (true);
