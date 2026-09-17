import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from '../_lib/auth.js';
import { validateUpdateMemory } from '../_lib/validation.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { userId, supabase } = getRequestContext();
    const { id, type } = req.query;

    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Invalid ID' });
    if (type !== 'memory' && type !== 'english_memory') return res.status(400).json({ error: 'Invalid type parameter' });

    const table = type === 'english_memory' ? 'english_memories' : 'memories';

    const { data: mem, error: memErr } = await supabase.from(table).select('*').eq('id', id).eq('user_id', userId).single();
    if (memErr || !mem) return res.status(404).json({ error: 'Memory not found' });

    if (req.method === 'PUT') {
      const validation = validateUpdateMemory(req.body);
      if (!validation.valid) return res.status(400).json({ error: validation.error });
      const { content, category } = validation.data!;

      const { data, error } = await supabase.from(table).update({
        content,
        category: category || mem.category,
      }).eq('id', id).select().single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Memory detail error:', error);
    return res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}
