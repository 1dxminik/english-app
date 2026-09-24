import { useState, useEffect } from 'react';
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
  const [category, setCategory] = useState(memory?.category || (memory?.type === 'english_memory' ? 'vocabulary' : 'fact'));
  const [characterId, setCharacterId] = useState(memory?.character_id || memory?.characterId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Switch default category if type changes
  useEffect(() => {
    if (!memory) {
      if (type === 'memory' && !['fact', 'preference', 'relationship', 'context'].includes(category)) {
        setCategory('fact');
      } else if (type === 'english_memory' && !['grammar', 'vocabulary', 'naturalness', 'pronunciation', 'fluency', 'american_english'].includes(category)) {
        setCategory('vocabulary');
      }
    }
  }, [type, memory, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        type,
        content: content.trim(),
        category,
        characterId: type === 'memory' && characterId ? characterId : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save memory');
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
            <option value="memory">Character Memory (Fact / Context)</option>
            <option value="english_memory">English Learning Memory</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category</label>
          {type === 'memory' ? (
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="fact">Fact</option>
              <option value="preference">Preference</option>
              <option value="relationship">Relationship</option>
              <option value="context">Context</option>
            </select>
          ) : (
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="vocabulary">Vocabulary</option>
              <option value="grammar">Grammar</option>
              <option value="naturalness">Naturalness</option>
              <option value="pronunciation">Pronunciation</option>
              <option value="fluency">Fluency</option>
              <option value="american_english">American English</option>
            </select>
          )}
        </div>

        {type === 'memory' && (
          <div className="form-group">
            <label>Character (Optional)</label>
            <select value={characterId} onChange={(e) => setCharacterId(e.target.value)}>
              <option value="">All Characters (Global)</option>
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
            placeholder={type === 'memory' ? 'e.g. Loves discussing neural network architectures' : 'e.g. Tendency to use passive voice instead of direct statements'}
          />
        </div>

        <div className="editor-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading || !content.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
