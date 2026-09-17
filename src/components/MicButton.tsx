import './MicButton.css';

interface MicButtonProps {
  isListening: boolean;
  isLoading: boolean;
  recordingTime?: number;
  onStart: () => void;
  onStop: () => void;
  onCancel?: () => void;
}

export function MicButton({
  isListening,
  isLoading,
  recordingTime = 0,
  onStart,
  onStop,
  onCancel,
}: MicButtonProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="mic-container">
      {isListening && (
        <div className="recording-status">
          <span className="recording-dot"></span>
          <span className="recording-time">Recording: {formatTime(recordingTime)}</span>
          <span className="recording-hint">(tap mic to finish speaking)</span>
          {onCancel && (
            <button
              type="button"
              className="btn-cancel-recording"
              onClick={onCancel}
              title="Cancel recording"
            >
              ✕ Cancel
            </button>
          )}
        </div>
      )}

      {isLoading && (
        <div className="processing-status">
          <span className="spinner">⏳</span> Listening & thinking...
        </div>
      )}

      <button
        type="button"
        className={`mic-button ${isListening ? 'listening' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={isListening ? onStop : onStart}
        disabled={isLoading}
        aria-label={isListening ? 'Stop recording and send' : 'Start speaking'}
      >
        {isLoading ? (
          <span className="spinner">⏳</span>
        ) : isListening ? (
          <span className="mic-icon">⏹</span>
        ) : (
          <span className="mic-icon">🎤</span>
        )}
      </button>

      <div className="mic-caption">
        {isListening ? 'Tap to finish & send' : isLoading ? 'Analyzing pronunciation...' : 'Tap to speak'}
      </div>
    </div>
  );
}
