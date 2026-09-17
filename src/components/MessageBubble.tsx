import './MessageBubble.css';
import { FeedbackDisplay } from './FeedbackDisplay';

interface MessageBubbleProps {
  message: any;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message-wrapper ${isUser ? 'user-wrapper' : 'ai-wrapper'}`}>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`}>
        <p>{message.content}</p>
        <span className="timestamp">
          {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
      {!isUser && message.feedback && (
        <FeedbackDisplay feedback={message.feedback} />
      )}
    </div>
  );
}
