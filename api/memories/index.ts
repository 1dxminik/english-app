import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from '../_lib/auth.js';
import { validateCreateMemory } from '../_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { userId, supabase } = getRequestContext();

    if (req.method === 'GET') {
      const { type, characterId } = req.query;
      const results: any = { memories: [], english_memories: [] };

      if (!type || type === 'memory') {
        let q = supabase.from('memories').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (characterId && typeof characterId === 'string') q = q.eq('character_id', characterId);
        const { data } = await q;
        if (data) results.memories = data;
      }

      if (!type || type === 'english_memory') {
        const { data } = await supabase.from('english_memories').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        if (data) results.english_memories = data;
      }

      return res.status(200).json(results);
    }

    if (req.method === 'POST') {
      const validation = validateCreateMemory(req.body);
      if (!validation.valid) return res.status(400).json({ error: validation.error });
      const { content, type, characterId, category } = validation.data!;

      const table = type === 'english_memory' ? 'english_memories' : 'memories';
      const insertData: any = {
        user_id: userId,
        content,
        source: 'user',
        category,
      };
      if (type === 'memory' && characterId) insertData.character_id = characterId;

      const { data, error } = await supabase.from(table).insert(insertData).select().single();
      if (error) throw error;

      return res.status(201).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Memories error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
