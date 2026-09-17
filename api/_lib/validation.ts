export function validateChatRequest(body: any) {
  if (!body || !body.conversationId) {
    return { valid: false, error: 'Missing conversationId' };
  }
  if (!body.message && !body.audio) {
    return { valid: false, error: 'Either message or audio must be provided' };
  }
  if (body.message && (typeof body.message !== 'string' || body.message.length > 2000)) {
    return { valid: false, error: 'Message must be at most 2000 characters' };
  }
  if (body.audio && typeof body.audio !== 'string') {
    return { valid: false, error: 'Audio must be a base64 encoded string' };
  }
  return {
    valid: true,
    data: {
      conversationId: body.conversationId,
      message: body.message ? String(body.message).trim() : '',
      audio: body.audio,
      mimeType: body.mimeType || 'audio/webm',
    },
  };
}

export function validateCreateConversation(body: any) {
  if (!body || !body.characterId) {
    return { valid: false, error: 'Missing characterId' };
  }
  return { valid: true, data: { characterId: body.characterId } };
}

export function validateCreateMemory(body: any) {
  if (!body || !body.content || !body.type) {
    return { valid: false, error: 'Missing required fields' };
  }
  if (body.type !== 'memory' && body.type !== 'english_memory') {
    return { valid: false, error: 'Invalid type' };
  }
  if (typeof body.content !== 'string' || body.content.length < 1 || body.content.length > 5000) {
    return { valid: false, error: 'Content must be between 1 and 5000 characters' };
  }
  return { valid: true, data: { content: body.content, type: body.type, characterId: body.characterId, category: body.category } };
}

export function validateUpdateMemory(body: any) {
  if (!body || !body.content) {
    return { valid: false, error: 'Missing content' };
  }
  if (typeof body.content !== 'string' || body.content.length < 1 || body.content.length > 5000) {
    return { valid: false, error: 'Content must be between 1 and 5000 characters' };
  }
  return { valid: true, data: { content: body.content, category: body.category } };
}
