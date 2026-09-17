import './MemoryItem.css';

interface MemoryItemProps {
  memory: any;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemoryItem({ memory, onEdit, onDelete }: MemoryItemProps) {
  const isEnglish = memory.type === 'english_memory';
  const dateStr = memory.created_at || memory.createdAt;
  const dateFormatted = dateStr ? new Date(dateStr).toLocaleDateString() : 'Recent';
  const charDisplay = memory.characterName || memory.character?.name;

  return (
    <div className="memory-item card">
      <div className="memory-header">
        <div className="memory-badges">
          <span className={`badge ${isEnglish ? 'badge-english' : 'badge-memory'}`}>
            {isEnglish ? 'English' : 'Fact'}
          </span>
          {memory.category && (
            <span className="badge badge-category">{memory.category}</span>
          )}
          {charDisplay && (
            <span className="badge badge-character">👤 {charDisplay}</span>
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
        <small className="memory-source">Source: {memory.source || 'ai'}</small>
        <small className="memory-date">{dateFormatted}</small>
      </div>
    </div>
  );
}
