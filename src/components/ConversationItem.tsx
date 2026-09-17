import { useNavigate } from 'react-router-dom';
import './ConversationItem.css';

interface ConversationItemProps {
  conversation: any;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const navigate = useNavigate();

  const dateStr = conversation.last_message_at || conversation.started_at || conversation.createdAt;
  const dateFormatted = dateStr ? new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : 'Recent';

  const charName = conversation.characters?.name || conversation.characterName || 'Character';
  const charRole = conversation.characters?.role;
  const msgCount = conversation.message_count ?? conversation.messageCount ?? 0;
  const summary = conversation.summary;

  return (
    <div
      className="conversation-item card"
      onClick={() => navigate(`/history/${conversation.id}`)}
      style={{ cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
    >
      <div className="conversation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h4 style={{ margin: 0 }}>{charName}</h4>
          {charRole && <span className="badge badge-tutor" style={{ fontSize: '0.75rem' }}>{charRole}</span>}
        </div>
        <span className="conversation-date" style={{ color: '#888', fontSize: '0.85rem' }}>{dateFormatted}</span>
      </div>

      {summary && (
        <p style={{ margin: '0.5rem 0 0.25rem 0', color: '#555', fontSize: '0.9rem', fontStyle: 'italic' }}>
          "{summary}"
        </p>
      )}

      <div className="conversation-details" style={{ marginTop: '0.5rem' }}>
        <span className="msg-count" style={{ fontSize: '0.85rem', color: '#666' }}>
          💬 Messages: {msgCount}
        </span>
      </div>
    </div>
  );
}
