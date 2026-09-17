import { useNavigate } from 'react-router-dom';
import './CharacterCard.css';
import { apiClient } from '../lib/api';
import { useState } from 'react';

interface CharacterCardProps {
  character: any;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartConversation = async () => {
    setLoading(true);
    try {
      const data = await apiClient.post('/api/conversations', { characterId: character.id });
      navigate(`/conversation/${character.id}?id=${data.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const initial = character.name ? character.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="character-card card" onClick={handleStartConversation}>
      <div className="character-avatar">
        {initial}
      </div>
      <div className="character-info">
        <h3>{character.name}</h3>
        <span className={`badge ${character.isTutor ? 'badge-tutor' : 'badge-friend'}`}>
          {character.isTutor ? 'Tutor' : 'Friend'}
        </span>
        <p className="character-role">{character.role}</p>
        <p className="character-desc">{character.description}</p>
      </div>
      {loading && <div className="card-overlay"><div className="loading-spinner"></div></div>}
    </div>
  );
}
