import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from './_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { supabase } = getRequestContext();
    const { data, error } = await supabase.from('characters').select('*').order('display_order', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    console.error('Characters error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
