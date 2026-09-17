import './FeedbackDisplay.css';

interface FeedbackDisplayProps {
  feedback: any;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  if (!feedback) return null;

  if (feedback.status === 'clean') {
    return (
      <div className="feedback-display clean-feedback">
        <span className="feedback-icon">✓</span> Sounds natural.
      </div>
    );
  }

  return (
    <div className="feedback-display issue-feedback">
      {feedback.corrections && feedback.corrections.length > 0 && (
        <div className="corrections-list">
          {feedback.corrections.map((corr: any, idx: number) => (
            <div key={idx} className="correction-pill">
              <span className="correction-type">{corr.type}</span>
              <span className="correction-text">{corr.text}</span>
            </div>
          ))}
        </div>
      )}
      {feedback.remember && (
        <div className="feedback-remember">
          <strong>Remember:</strong> {feedback.remember}
        </div>
      )}
    </div>
  );
}
