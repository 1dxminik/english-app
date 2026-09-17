// ============================================================
// Core domain types for SpeakAI
// ============================================================

// ---------- Character ----------

export interface CharacterContract {
  personality: string;
  background: string;
  speakingStyle: string;
  topics: string[];
  systemPrompt: string;
  [key: string]: unknown;
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarUrl?: string;
  isTutor: boolean;
  contract: CharacterContract;
  displayOrder: number;
}

// ---------- Conversation ----------

export interface Conversation {
  id: string;
  characterId: string;
  characterName?: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  summary: string | null;
}

// ---------- Message ----------

export interface Feedback {
  status: 'clean' | 'has_feedback';
  corrections: FeedbackCorrection[];
  remember: string | null;
}

export interface FeedbackCorrection {
  type: 'grammar' | 'vocabulary' | 'naturalness' | 'pronunciation' | 'fluency' | 'american_english';
  text: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'character';
  content: string;
  feedback: Feedback | null;
  createdAt: string;
}

// ---------- Memory ----------

export type MemoryCategory = 'fact' | 'preference' | 'relationship' | 'context';
export type MemorySource = 'ai' | 'user';

export interface Memory {
  id: string;
  userId: string;
  characterId: string | null;
  characterName?: string;
  content: string;
  category: MemoryCategory | null;
  source: MemorySource;
  createdAt: string;
  updatedAt: string;
}

export type EnglishMemoryCategory =
  | 'grammar'
  | 'vocabulary'
  | 'naturalness'
  | 'pronunciation'
  | 'fluency'
  | 'american_english';

export interface EnglishMemory {
  id: string;
  userId: string;
  content: string;
  category: EnglishMemoryCategory | null;
  sourceMessageId: string | null;
  source: MemorySource;
  createdAt: string;
  updatedAt: string;
}

// ---------- Relationship ----------

export interface Relationship {
  id: string;
  userId: string;
  characterId: string;
  summary: string | null;
  lastConversationAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------- Conversation Summary ----------

export interface ConversationSummary {
  id: string;
  conversationId: string;
  userId: string;
  summary: string;
  messagesCovered: number;
  createdAt: string;
}

// ---------- API types ----------

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  message: Message;         // character's reply (saved)
  userMessage: Message;     // user's message (saved, with feedback)
}

export interface CreateConversationRequest {
  characterId: string;
}

export interface CreateMemoryRequest {
  characterId?: string | null;
  content: string;
  category?: MemoryCategory;
  type: 'memory' | 'english_memory';
  englishCategory?: EnglishMemoryCategory;
}

export interface UpdateMemoryRequest {
  content: string;
  category?: MemoryCategory | EnglishMemoryCategory;
}

// ---------- Gemini structured response ----------

export interface GeminiChatResponse {
  character_reply: string;
  feedback: {
    status: 'clean' | 'has_feedback';
    corrections: Array<{
      type: string;
      text: string;
    }>;
    remember: string | null;
  };
  memory_updates: Array<{
    type: 'character_memory' | 'english_memory';
    content: string;
    category: string;
  }>;
}

// ---------- Auth ----------

export interface UserProfile {
  id: string;
  displayName: string | null;
  nativeLanguage: string;
  englishLevel: string;
}
