import { useState } from 'react';
import './MemoryEditor.css';

interface MemoryEditorProps {
  memory?: any;
  characters: any[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function MemoryEditor({ memory, characters, onSave, onCancel }: MemoryEditorProps) {
  const [type, setType] = useState(memory?.type || 'memory');
  const [content, setContent] = useState(memory?.content || '');
  const [category, setCategory] = useState(memory?.category || 'general');
  const [characterId, setCharacterId] = useState(memory?.characterId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        type,
        content,
        category,
        characterId: characterId || undefined
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="memory-editor card">
      <h3>{memory ? 'Edit Memory' : 'Add Memory'}</h3>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="memory">Fact/Context</option>
            <option value="english_memory">English Learning</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          {type === 'memory' ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="general">General</option>
              <option value="preferences">Preferences</option>
              <option value="personal">Personal Info</option>
            </select>
          ) : (
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="pronunciation">Pronunciation</option>
            </select>
          )}
        </div>

        {type === 'memory' && (
          <div className="form-group">
            <label>Character (Optional)</label>
            <select value={characterId} onChange={(e) => setCharacterId(e.target.value)}>
              <option value="">All Characters</option>
              {characters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Content</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required
            rows={4}
          />
        </div>

        <div className="editor-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
