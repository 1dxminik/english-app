import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { MessageBubble } from '../components/MessageBubble';
import { MicButton } from '../components/MicButton';
import { apiClient } from '../lib/api';

export function ConversationPage() {
  const { characterId } = useParams();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  const navigate = useNavigate();

  const { messages, loading: chatLoading, error: chatError, sendMessage, loadMessages } = useChat();
  const {
    isRecording,
    recordingTime,
    error: audioError,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useAudioRecorder();

  const [characterName, setCharacterName] = useState('Chat');
  const [characterRole, setCharacterRole] = useState('');
  const [textInput, setTextInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
    if (characterId) {
      apiClient.get('/api/characters').then((data) => {
        const char = (data || []).find((c: any) => c.id === characterId);
        if (char) {
          setCharacterName(char.name);
          setCharacterRole(char.role);
        }
      }).catch(console.error);
    }
  }, [conversationId, characterId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading, isRecording]);

  const handleStopRecording = async () => {
    const audioData = await stopRecording();
    if (!audioData || !conversationId) return;

    try {
      await sendMessage(conversationId, {
        audio: audioData.audio,
        mimeType: audioData.mimeType,
      });
    } catch (err) {
      console.error('Failed to send audio message:', err);
    }
  };

  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = textInput.trim();
    if (!trimmed || !conversationId || chatLoading || isRecording) return;

    setTextInput('');
    try {
      await sendMessage(conversationId, trimmed);
    } catch (err) {
      console.error('Failed to send text message:', err);
    }
  };

  return (
    <div className="conversation-layout" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 120px)' }}>
      <div className="conversation-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{characterName}</h2>
          {characterRole && <span style={{ fontSize: '0.8rem', color: '#666' }}>{characterRole}</span>}
        </div>
        <div style={{ width: '60px' }}></div>
      </div>

      {(chatError || audioError) && (
        <div className="error-message" style={{ textAlign: 'center', marginBottom: '0.8rem', padding: '0.5rem', backgroundColor: '#fff0f0', borderRadius: '6px' }}>
          {chatError || audioError}
        </div>
      )}

      <div className="messages-container" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fafafa', minHeight: '220px' }}>
        {messages.length === 0 && !chatLoading && (
          <div className="empty-state" style={{ margin: 'auto', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Ready to speak with {characterName}?</p>
            <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Tap the microphone below, speak naturally in English, and tap again when done.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id || idx} message={msg} />
        ))}

        {chatLoading && (
          <div className="empty-state" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}>
            <div className="loading-spinner"></div>
            <span>{characterName} is listening & replying...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="conversation-controls" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
        {isSupported ? (
          <MicButton
            isListening={isRecording}
            isLoading={chatLoading}
            recordingTime={recordingTime}
            onStart={startRecording}
            onStop={handleStopRecording}
            onCancel={cancelRecording}
          />
        ) : (
          <p className="error-message" style={{ fontSize: '0.85rem' }}>Audio recording is not supported in this browser.</p>
        )}

        <form onSubmit={handleSendText} style={{ display: 'flex', width: '100%', maxWidth: '500px', gap: '0.5rem' }}>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Or type a message..."
            disabled={chatLoading || isRecording}
            style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!textInput.trim() || chatLoading || isRecording}
            style={{ padding: '0.6rem 1rem' }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
