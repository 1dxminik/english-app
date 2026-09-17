import './MemoryItem.css';

interface MemoryItemProps {
  memory: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemoryItem({ memory, onEdit, onDelete }: MemoryItemProps) {
  const isEnglish = memory.type === 'english_memory';
  
  return (
    <div className="memory-item card">
      <div className="memory-header">
        <div className="memory-badges">
          <span className={`badge ${isEnglish ? 'badge-english' : 'badge-memory'}`}>
            {isEnglish ? 'English' : 'Fact'}
          </span>
          <span className="badge badge-category">{memory.category}</span>
          {memory.character && (
            <span className="badge badge-character">👤 {memory.character.name}</span>
          )}
        </div>
        <div className="memory-actions">
          <button className="btn-icon edit-btn" onClick={onEdit} aria-label="Edit">✏️</button>
          <button className="btn-icon delete-btn" onClick={onDelete} aria-label="Delete">🗑️</button>
        </div>
      </div>
      <div className="memory-content">
        <p>{memory.content}</p>
      </div>
      <div className="memory-footer">
        <small className="memory-source">Source: {memory.source}</small>
        <small className="memory-date">{new Date(memory.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  );
}
