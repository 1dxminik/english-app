import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';

export interface SendMessagePayload {
  message?: string;
  audio?: string;
  mimeType?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get(`/api/conversations/${conversationId}`);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, payload: string | SendMessagePayload) => {
    setLoading(true);
    setError('');
    try {
      const body = typeof payload === 'string'
        ? { conversationId, message: payload }
        : { conversationId, ...payload };

      const data = await apiClient.post(`/api/chat`, body);
      const characterReply = data.message || data.aiMessage;
      const added: any[] = [];
      if (data.userMessage) added.push(data.userMessage);
      if (characterReply) added.push(characterReply);

      setMessages(prev => [...prev, ...added]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, error, sendMessage, loadMessages, setMessages };
}
