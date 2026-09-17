import type { VercelResponse } from '@vercel/node';
import { createAdminClient } from './supabase.js';

/**
 * Single-user app — no authentication needed.
 * Returns a fixed user ID and admin Supabase client.
 */

// Fixed user ID for this single-user private app.
// All data in the database is associated with this ID.
export const SINGLE_USER_ID = '00000000-0000-0000-0000-000000000001';

export function getRequestContext() {
  const supabase = createAdminClient();
  return { userId: SINGLE_USER_ID, supabase };
}

export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
