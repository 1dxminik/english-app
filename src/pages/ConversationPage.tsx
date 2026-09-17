import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { MessageBubble } from '../components/MessageBubble';
import { MicButton } from '../components/MicButton';
import { apiClient } from '../lib/api';

export function ConversationPage() {
  const { characterId } = useParams();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  const navigate = useNavigate();

  const { messages, loading: chatLoading, error: chatError, sendMessage, loadMessages } = useChat();
  const { isListening, transcript, interimTranscript, error: speechError, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  
  const [characterName, setCharacterName] = useState('Chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
    // Fetch character name
    if (characterId) {
      apiClient.get('/api/characters').then(data => {
        const char = data.find((c: any) => c.id === characterId);
        if (char) setCharacterName(char.name);
      }).catch(console.error);
    }
  }, [conversationId, characterId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  useEffect(() => {
    if (!isListening && transcript) {
      if (conversationId) {
        sendMessage(conversationId, transcript).then(() => {
          resetTranscript();
        });
      }
    }
  }, [isListening, transcript, conversationId, sendMessage, resetTranscript]);

  if (!isSupported) {
    return <div className="empty-state error-message">Speech Recognition is not supported in this browser.</div>;
  }

  return (
    <div className="conversation-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 140px)' }}>
      <div className="conversation-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <h2 style={{ margin: 0 }}>{characterName}</h2>
        <div style={{ width: '60px' }}></div> {/* Spacer */}
      </div>

      {(chatError || speechError) && (
        <div className="error-message" style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {chatError || speechError}
        </div>
      )}

      <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        {messages.length === 0 && !chatLoading && (
          <div className="empty-state">Say hello to start the conversation!</div>
        )}
        
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id || idx} message={msg} />
        ))}
        
        {chatLoading && <div className="empty-state"><div className="loading-spinner"></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="mic-area" style={{ marginTop: '1.5rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
        <MicButton 
          isListening={isListening} 
          isLoading={chatLoading} 
          interimTranscript={interimTranscript}
          onStart={startListening} 
          onStop={stopListening} 
        />
      </div>
    </div>
  );
}
