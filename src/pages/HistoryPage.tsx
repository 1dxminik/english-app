import { useState, useEffect } from 'react';
import { ConversationItem } from '../components/ConversationItem';
import { apiClient } from '../lib/api';

export function HistoryPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiClient.get('/api/conversations');
        setConversations(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="page-container">
      <h2>Conversation History</h2>
      {error && <p className="error-message">{error}</p>}
      
      {loading ? (
        <div className="empty-state"><div className="loading-spinner"></div></div>
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          No conversations yet. Start speaking with a character!
        </div>
      ) : (
        <div className="history-list">
          {conversations.map(conv => (
            <ConversationItem key={conv.id} conversation={conv} />
          ))}
        </div>
      )}
    </div>
  );
}
