export async function checkRateLimit(supabase: any, userId: string) {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

  const { count: countMin, error: errMin } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', oneMinuteAgo);

  const { count: countDay, error: errDay } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', oneDayAgo);

  if (errMin || errDay) {
    return { allowed: true };
  }

  if (countMin !== null && countMin >= 10) {
    return { allowed: false, reason: 'Too many messages in the last minute.' };
  }
  if (countDay !== null && countDay >= 100) {
    return { allowed: false, reason: 'Too many messages today.' };
  }

  return { allowed: true };
}
