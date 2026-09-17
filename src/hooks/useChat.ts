import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';

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

  const sendMessage = useCallback(async (conversationId: string, message: string) => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.post(`/api/chat`, { conversationId, message });
      setMessages(prev => [...prev, data.userMessage, data.aiMessage].filter(Boolean));
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
