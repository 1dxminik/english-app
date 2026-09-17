import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { MessageBubble } from '../components/MessageBubble';

export function ConversationDetailPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      if (!conversationId) return;
      try {
        const data = await apiClient.get(`/api/conversations/${conversationId}`);
        setConversation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load conversation details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [conversationId]);

  if (loading) return <div className="empty-state"><div className="loading-spinner"></div></div>;
  if (error) return <div className="empty-state error-message">{error}</div>;
  if (!conversation) return <div className="empty-state">Conversation not found</div>;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{ margin: 0 }}>Chat with {conversation.characters?.name || conversation.character?.name || 'Character'}</h2>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        {conversation.messages?.length === 0 ? (
          <div className="empty-state">No messages in this conversation.</div>
        ) : (
          conversation.messages?.map((msg: any) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>
    </div>
  );
}
