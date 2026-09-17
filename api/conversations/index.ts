import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from '../_lib/auth.js';
import { validateCreateConversation } from '../_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { userId, supabase } = getRequestContext();

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, characters(name)')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const validation = validateCreateConversation(req.body);
      if (!validation.valid) return res.status(400).json({ error: validation.error });
      const { characterId } = validation.data!;

      const { data: char, error: charErr } = await supabase.from('characters').select('id').eq('id', characterId).single();
      if (charErr || !char) return res.status(404).json({ error: 'Character not found' });

      const { data: conv, error: convErr } = await supabase.from('conversations').insert({
        user_id: userId,
        character_id: characterId,
        message_count: 0,
      }).select().single();

      if (convErr) throw convErr;

      await supabase.from('relationships').upsert({
        user_id: userId,
        character_id: characterId,
      }, { onConflict: 'user_id,character_id' });

      return res.status(201).json(conv);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Conversations error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
