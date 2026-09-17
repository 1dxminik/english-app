import type { Character } from '../types';

/**
 * Fallback character data for offline / initial render.
 * The real data (including full contracts) lives in Supabase.
 * This is used only when the API is unreachable.
 */
export const characters: Character[] = [
  {
    id: 'senior-ai-engineer',
    name: 'Senior AI Engineer',
    role: 'Senior AI Engineer',
    description: 'A highly experienced AI engineer who works on real-world production AI systems.',
    isTutor: true,
    displayOrder: 1,
    contract: {} as any,
  },
  {
    id: 'ai-researcher',
    name: 'AI Researcher',
    role: 'AI Researcher',
    description: 'An AI/ML researcher whose work is closer to research than production engineering.',
    isTutor: true,
    displayOrder: 2,
    contract: {} as any,
  },
  {
    id: 'engineering-manager',
    name: 'Engineering Manager',
    role: 'Engineering Manager',
    description: 'An experienced engineering manager responsible for a technical team.',
    isTutor: true,
    displayOrder: 3,
    contract: {} as any,
  },
  {
    id: 'senior-software-engineer',
    name: 'Senior Software Engineer',
    role: 'Senior Software Engineer',
    description: 'An experienced software engineer comfortable with serious technical decisions and everyday workplace topics.',
    isTutor: true,
    displayOrder: 4,
    contract: {} as any,
  },
  {
    id: 'technical-interviewer',
    name: 'Technical Interviewer',
    role: 'Technical Interviewer',
    description: 'An experienced technical interviewer in the software/AI industry. Simulates realistic interviews.',
    isTutor: true,
    displayOrder: 5,
    contract: {} as any,
  },
  {
    id: 'recruiter',
    name: 'Recruiter',
    role: 'Recruiter',
    description: 'A technology recruiter familiar with software and AI roles. Friendly and professional.',
    isTutor: true,
    displayOrder: 6,
    contract: {} as any,
  },
  {
    id: 'coworker',
    name: 'Coworker',
    role: 'Coworker',
    description: 'A colleague in a technical environment. Provides realistic everyday workplace English.',
    isTutor: true,
    displayOrder: 7,
    contract: {} as any,
  },
  {
    id: 'matt',
    name: 'Matt',
    role: 'Friend',
    description: 'Your 19-year-old friend. Into football and AI. Curious, energetic, genuine.',
    isTutor: false,
    displayOrder: 8,
    contract: {} as any,
  },
  {
    id: 'drippysoup',
    name: 'Drippysoup',
    role: 'Friend',
    description: 'Your 19-year-old friend from LA. Into underground music, fashion, and design. Creating his own clothing brand.',
    isTutor: false,
    displayOrder: 9,
    contract: {} as any,
  },
];
