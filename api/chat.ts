import { VercelRequest, VercelResponse } from '@vercel/node';
import { getRequestContext, setCorsHeaders } from './_lib/auth';
import { validateChatRequest } from './_lib/validation';
import { checkRateLimit } from './_lib/rate-limit';
import { buildContext } from './_lib/context';
import { buildSystemPrompt } from './_lib/prompts';
import { generateChatResponse } from './_lib/gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { userId, supabase } = getRequestContext();
    const validation = validateChatRequest(req.body);
    if (!validation.valid) return res.status(400).json({ error: validation.error });
    const { conversationId, message } = validation.data!;

    const rateLimit = await checkRateLimit(supabase, userId);
    if (!rateLimit.allowed) return res.status(429).json({ error: rateLimit.reason });

    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
    if (!conv) return res.status(404).json({ error: 'Conversation not found' });

    const context = await buildContext(supabase, userId, conversationId, conv.character_id);
    const systemPrompt = buildSystemPrompt(context.character, context.relationship, context.characterMemories, context.englishMemories, context.conversation?.summary || null);

    const history = context.messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }));

    let geminiResponse;
    try {
      geminiResponse = await generateChatResponse(systemPrompt, history, message);
    } catch (e: any) {
      if (e.status === 429) return res.status(429).json({ error: e.message });
      throw e;
    }

    const { data: savedUserMsg } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
      feedback: geminiResponse.feedback,
    }).select().single();

    const { data: savedCharMsg } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'character',
      content: geminiResponse.character_reply,
    }).select().single();

    await supabase.from('conversations').update({
      last_message_at: new Date().toISOString(),
      message_count: (conv.message_count || 0) + 2,
    }).eq('id', conversationId);

    if (geminiResponse.memory_updates && geminiResponse.memory_updates.length > 0) {
      for (const update of geminiResponse.memory_updates) {
        if (update.type === 'character_memory') {
          await supabase.from('memories').insert({
            user_id: userId,
            character_id: conv.character_id,
            content: update.content,
            category: update.category,
            source: 'ai',
          });
        } else if (update.type === 'english_memory') {
          await supabase.from('english_memories').insert({
            user_id: userId,
            content: update.content,
            category: update.category,
            source: 'ai',
          });
        }
      }
    }

    res.status(200).json({ message: savedCharMsg, userMessage: savedUserMsg });
  } catch (error: any) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
