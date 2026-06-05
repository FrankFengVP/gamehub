import { games } from '@/core/registry';
import { GameCard } from './GameCard';

export function GameHub() {
  return (
    <section className="hub">
      <div className="hub-hero">
        <h1>前端游戏合集</h1>
        <p>
          在浏览器里即开即玩。框架已预留扩展位，后续只需注册新游戏即可出现在列表中。
        </p>
      </div>
      <div className="hub-grid">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
