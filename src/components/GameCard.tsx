import { Link } from 'react-router-dom';
import type { GameDefinition } from '@/core/types';

interface GameCardProps {
  game: GameDefinition;
}

export function GameCard({ game }: GameCardProps) {
  const [from, to] = game.accent;

  return (
    <Link to={`/play/${game.id}`} className="game-card">
      <div
        className="game-card-thumb"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        🎮
      </div>
      <div className="game-card-body">
        <h2 className="game-card-title">{game.title}</h2>
        <p className="game-card-desc">{game.description}</p>
        <div className="game-card-tags">
          {game.tags.map((tag) => (
            <span key={tag} className="game-card-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
