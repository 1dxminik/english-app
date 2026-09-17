import { useState, useEffect } from 'react';
import { MemoryItem } from '../components/MemoryItem';
import { MemoryEditor } from '../components/MemoryEditor';
import { apiClient } from '../lib/api';

export function MemoryPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [editingMemory, setEditingMemory] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mems, chars] = await Promise.all([
        apiClient.get('/api/memories'),
        apiClient.get('/api/characters')
      ]);
      setMemories(mems);
      setCharacters(chars);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (data: any) => {
    if (editingMemory) {
      await apiClient.put(`/api/memories/${editingMemory.id}`, data);
    } else {
      await apiClient.post('/api/memories', data);
    }
    setIsAdding(false);
    setEditingMemory(null);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await apiClient.del(`/api/memories/${id}`);
      fetchData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredMemories = memories.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'english') return m.type === 'english_memory';
    if (filter === 'character') return m.type === 'memory';
    return true;
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Memories</h2>
        {!isAdding && !editingMemory && (
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>+ Add Memory</button>
        )}
      </div>

      {error && <p className="error-message">{error}</p>}

      {(isAdding || editingMemory) ? (
        <MemoryEditor 
          memory={editingMemory}
          characters={characters}
          onSave={handleSave}
          onCancel={() => { setIsAdding(false); setEditingMemory(null); }}
        />
      ) : (
        <>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('all')}>All</button>
            <button className={`btn ${filter === 'character' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('character')}>Character</button>
            <button className={`btn ${filter === 'english' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter('english')}>English</button>
          </div>

          {loading ? (
            <div className="empty-state"><div className="loading-spinner"></div></div>
          ) : filteredMemories.length === 0 ? (
            <div className="empty-state">No memories found.</div>
          ) : (
            <div>
              {filteredMemories.map(m => (
                <MemoryItem 
                  key={m.id} 
                  memory={m} 
                  onEdit={() => setEditingMemory(m)}
                  onDelete={() => handleDelete(m.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
