import { Link, useParams } from 'react-router-dom';
import { getGameById } from '@/core/registry';

export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const game = gameId ? getGameById(gameId) : undefined;

  if (!game) {
    return (
      <div className="not-found">
        <p>未找到该游戏。</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '1rem' }}>
          返回首页
        </Link>
      </div>
    );
  }

  const GameComponent = game.component;

  return (
    <div className="game-page">
      <div className="game-page-bar">
        <Link to="/" className="game-page-back">
          ← 返回合集
        </Link>
        <span className="game-page-title">{game.title}</span>
        <span className="game-page-spacer" aria-hidden />
      </div>
      <div className="game-page-canvas">
        <GameComponent />
      </div>
    </div>
  );
}
