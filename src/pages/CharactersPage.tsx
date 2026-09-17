import { useState, useEffect } from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { apiClient } from '../lib/api';
import { characters as fallbackCharacters } from '../data/characters';

export function CharactersPage() {
  const [chars, setChars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChars = async () => {
      try {
        const data = await apiClient.get('/api/characters');
        setChars(data.length > 0 ? data : fallbackCharacters);
      } catch (err: any) {
        setError('Could not load characters from server. Using fallbacks.');
        setChars(fallbackCharacters);
      } finally {
        setLoading(false);
      }
    };
    fetchChars();
  }, []);

  return (
    <div className="page-container">
      <h2>Choose Someone to Talk To</h2>
      {error && <p className="error-message" style={{textAlign: 'center'}}>{error}</p>}
      
      {loading ? (
        <div className="empty-state"><div className="loading-spinner"></div></div>
      ) : (
        <div className="grid-container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginTop: '1.5rem'
        }}>
          {chars.map(c => (
            <CharacterCard key={c.id} character={c} />
          ))}
        </div>
      )}
    </div>
  );
}
