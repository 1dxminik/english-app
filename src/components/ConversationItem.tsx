import { useNavigate } from 'react-router-dom';
import './ConversationItem.css';

interface ConversationItemProps {
  conversation: any;
}

export function ConversationItem({ conversation }: ConversationItemProps) {
  const navigate = useNavigate();
  const date = new Date(conversation.lastActivityAt || conversation.createdAt).toLocaleDateString();
  const charName = conversation.character?.name || 'Unknown Character';

  return (
    <div 
      className="conversation-item card" 
      onClick={() => navigate(`/history/${conversation.id}`)}
    >
      <div className="conversation-header">
        <h4>{charName}</h4>
        <span className="conversation-date">{date}</span>
      </div>
      <div className="conversation-details">
        <span className="msg-count">Messages: {conversation.messageCount || 0}</span>
      </div>
    </div>
  );
}
