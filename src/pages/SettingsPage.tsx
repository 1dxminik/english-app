export function SettingsPage() {
  return (
    <div className="page-container">
      <h2>Settings</h2>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3>API Limits (Free Tier)</h3>
        <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
          <li>Max 10 messages per minute</li>
          <li>Max 100 messages per day</li>
          <li>Max message length: 2000 characters</li>
          <li>Max recording time: 120 seconds</li>
        </ul>
      </div>

      <div className="card">
        <h3>About</h3>
        <p>SpeakAI — Private English Speaking Practice</p>
        <p style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Web Speech API (Chrome/Edge) · Gemini AI · Supabase
        </p>
      </div>
    </div>
  );
}
