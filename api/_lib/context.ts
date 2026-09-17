export async function buildContext(supabase: any, userId: string, conversationId: string, characterId: string) {
  const [
    { data: character },
    { data: relationship },
    { data: characterMemories },
    { data: englishMemories },
    { data: conversation },
    { data: messages }
  ] = await Promise.all([
    supabase.from('characters').select('*').eq('id', characterId).single(),
    supabase.from('relationships').select('*').eq('user_id', userId).eq('character_id', characterId).single(),
    supabase.from('memories').select('*').eq('user_id', userId).eq('character_id', characterId).order('created_at', { ascending: false }).limit(10),
    supabase.from('english_memories').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    supabase.from('conversations').select('*').eq('id', conversationId).single(),
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: false }).limit(10)
  ]);

  return {
    character: character || null,
    relationship: relationship || null,
    characterMemories: characterMemories || [],
    englishMemories: englishMemories || [],
    conversation: conversation || null,
    messages: (messages || []).reverse()
  };
}
