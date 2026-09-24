import { useState, useCallback, useRef } from 'react';
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
  const abortControllerRef = useRef<AbortController | null>(null);

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
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const body = typeof payload === 'string'
        ? { conversationId, message: payload }
        : { conversationId, ...payload };

      const data = await apiClient.post(`/api/chat`, body, { signal: controller.signal });
      const characterReply = data.message || data.aiMessage;
      const added: any[] = [];
      if (data.userMessage) added.push(data.userMessage);
      if (characterReply) added.push(characterReply);

      setMessages(prev => [...prev, ...added]);
      return data;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request was canceled or timed out.');
      } else {
        setError(err.message || 'Failed to send message');
      }
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, []);

  const cancelCurrentRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  return { messages, loading, error, sendMessage, loadMessages, setMessages, cancelCurrentRequest };
}
