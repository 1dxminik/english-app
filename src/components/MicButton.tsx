import './MicButton.css';

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  interimTranscript?: string;
  onStart: () => void;
  onStop: () => void;
}

export function MicButton({ isListening, isLoading, interimTranscript, onStart, onStop }: MicButtonProps) {
  return (
    <div className="mic-container">
      {interimTranscript && isListening && (
        <div className="interim-transcript">
          {interimTranscript}
        </div>
      )}
      <button 
        className={`mic-button ${isListening ? 'listening' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={isListening ? onStop : onStart}
        disabled={isLoading}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isLoading ? (
          <span className="spinner">⏳</span>
        ) : (
          <span className="mic-icon">🎤</span>
        )}
      </button>
    </div>
  );
}
