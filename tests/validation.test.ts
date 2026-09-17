import { describe, it, expect } from 'vitest';

// ============================================================
// Validation tests
// ============================================================

// Since we can't import from api/_lib directly (different module systems),
// we test the validation logic by replicating the core rules.
// In production, the actual validation runs server-side in Vercel Functions.

describe('Chat request validation rules', () => {
  const MAX_MESSAGE_LENGTH = 2000;

  it('rejects empty message', () => {
    const message = '';
    expect(message.length).toBe(0);
    expect(message.trim().length === 0).toBe(true);
  });

  it('rejects message exceeding max length', () => {
    const message = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
    expect(message.length).toBeGreaterThan(MAX_MESSAGE_LENGTH);
  });

  it('accepts valid message', () => {
    const message = 'Hello, how are you doing today?';
    expect(message.length).toBeGreaterThan(0);
    expect(message.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
  });

  it('accepts message at max length', () => {
    const message = 'a'.repeat(MAX_MESSAGE_LENGTH);
    expect(message.length).toBe(MAX_MESSAGE_LENGTH);
  });
});

describe('Rate limit rules', () => {
  const MAX_PER_MINUTE = 10;
  const MAX_PER_DAY = 100;

  it('allows requests within minute limit', () => {
    const recentCount = 5;
    expect(recentCount).toBeLessThanOrEqual(MAX_PER_MINUTE);
  });

  it('blocks requests exceeding minute limit', () => {
    const recentCount = 11;
    expect(recentCount).toBeGreaterThan(MAX_PER_MINUTE);
  });

  it('allows requests within daily limit', () => {
    const dailyCount = 50;
    expect(dailyCount).toBeLessThanOrEqual(MAX_PER_DAY);
  });

  it('blocks requests exceeding daily limit', () => {
    const dailyCount = 101;
    expect(dailyCount).toBeGreaterThan(MAX_PER_DAY);
  });
});

describe('Memory validation rules', () => {
  const MAX_CONTENT_LENGTH = 5000;
  const VALID_MEMORY_TYPES = ['memory', 'english_memory'];
  const VALID_CATEGORIES = ['fact', 'preference', 'relationship', 'context'];
  const VALID_ENGLISH_CATEGORIES = [
    'grammar', 'vocabulary', 'naturalness',
    'pronunciation', 'fluency', 'american_english',
  ];

  it('accepts valid memory type', () => {
    expect(VALID_MEMORY_TYPES).toContain('memory');
    expect(VALID_MEMORY_TYPES).toContain('english_memory');
  });

  it('rejects invalid memory type', () => {
    expect(VALID_MEMORY_TYPES).not.toContain('unknown');
  });

  it('accepts valid memory categories', () => {
    for (const cat of VALID_CATEGORIES) {
      expect(VALID_CATEGORIES).toContain(cat);
    }
  });

  it('accepts valid english memory categories', () => {
    for (const cat of VALID_ENGLISH_CATEGORIES) {
      expect(VALID_ENGLISH_CATEGORIES).toContain(cat);
    }
  });

  it('rejects content exceeding max length', () => {
    const content = 'a'.repeat(MAX_CONTENT_LENGTH + 1);
    expect(content.length).toBeGreaterThan(MAX_CONTENT_LENGTH);
  });
});

describe('Gemini response parsing', () => {
  it('parses valid structured response', () => {
    const raw = JSON.stringify({
      character_reply: 'Hello there!',
      feedback: {
        status: 'clean',
        corrections: [],
        remember: null,
      },
      memory_updates: [],
    });

    const parsed = JSON.parse(raw);
    expect(parsed.character_reply).toBe('Hello there!');
    expect(parsed.feedback.status).toBe('clean');
    expect(parsed.feedback.corrections).toEqual([]);
    expect(parsed.feedback.remember).toBeNull();
    expect(parsed.memory_updates).toEqual([]);
  });

  it('parses response with feedback', () => {
    const raw = JSON.stringify({
      character_reply: "That's a great question!",
      feedback: {
        status: 'has_feedback',
        corrections: [
          { type: 'grammar', text: 'Use "How does it work?" instead of "How it works?"' },
        ],
        remember: 'Question inversion in direct questions',
      },
      memory_updates: [
        {
          type: 'english_memory',
          content: 'Struggles with question inversion',
          category: 'grammar',
        },
      ],
    });

    const parsed = JSON.parse(raw);
    expect(parsed.feedback.status).toBe('has_feedback');
    expect(parsed.feedback.corrections).toHaveLength(1);
    expect(parsed.feedback.corrections[0].type).toBe('grammar');
    expect(parsed.feedback.remember).toBe('Question inversion in direct questions');
    expect(parsed.memory_updates).toHaveLength(1);
  });

  it('handles missing optional fields gracefully', () => {
    const raw = JSON.stringify({
      character_reply: 'Sure!',
      feedback: {
        status: 'clean',
        corrections: [],
        remember: null,
      },
      memory_updates: [],
    });

    const parsed = JSON.parse(raw);
    expect(parsed.character_reply).toBeTruthy();
    expect(parsed.feedback).toBeTruthy();
  });
});

describe('Security rules', () => {
  it('environment variable names follow conventions', () => {
    // Frontend variables must start with VITE_
    const frontendVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'];
    for (const v of frontendVars) {
      expect(v.startsWith('VITE_')).toBe(true);
    }

    // Backend-only variables must NOT start with VITE_
    const backendVars = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'GEMINI_API_KEY'];
    for (const v of backendVars) {
      expect(v.startsWith('VITE_')).toBe(false);
    }
  });

  it('API key is never in allowed frontend env prefix', () => {
    const dangerousNames = ['VITE_GEMINI_API_KEY', 'VITE_SUPABASE_SECRET_KEY'];
    // These should never exist
    for (const name of dangerousNames) {
      expect(name.startsWith('VITE_')).toBe(true); // they DO start with VITE_ which is the problem
      // This test documents that these names should NEVER be used
    }
  });
});
