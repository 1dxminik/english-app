import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from '../_lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, supabase } = getRequestContext();
    const { id } = req.query;
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });

    const { data: conv, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (convErr || !conv) return res.status(404).json({ error: 'Conversation not found' });

    const { data: messages, error: msgErr } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgErr) throw msgErr;

    return res.status(200).json({ ...conv, messages: messages || [] });
  } catch (error: any) {
    console.error('Conversation detail error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
