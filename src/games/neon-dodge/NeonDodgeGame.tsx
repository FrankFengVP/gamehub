import { useIsCoarsePointer, useIsMobile } from '@/hooks/useMediaQuery';
import { useNeonDodgeGame } from './useNeonDodgeGame';
import './neon-dodge.css';

export function NeonDodgeGame() {
  const isMobile = useIsMobile();
  const isCoarse = useIsCoarsePointer();
  const { canvasRef, hud, startGame, resetToIdle, setPointerPos } =
    useNeonDodgeGame();

  const showOverlay = hud.phase === 'idle' || hud.phase === 'dead';
  const touchControl = isMobile || isCoarse;

  return (
    <div className="nd-root">
      <div
        className="nd-canvas-wrap"
        onPointerDown={(e) => {
          if (hud.phase === 'playing' && touchControl) {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            setPointerPos(e.clientX, e.clientY);
          }
        }}
        onPointerMove={(e) => {
          if (hud.phase === 'playing' && touchControl) {
            setPointerPos(e.clientX, e.clientY);
          }
        }}
        onPointerUp={() => setPointerPos(null, null)}
        onPointerCancel={() => setPointerPos(null, null)}
      >
        <canvas ref={canvasRef} className="nd-canvas" />
      </div>

      <div className={`nd-hud ${touchControl ? 'nd-hud--touch' : ''}`}>
        <div className="nd-hud-top">
          <div className="nd-stats">
            <span className="nd-stat">
              得分<strong>{hud.score}</strong>
            </span>
            <span className="nd-stat">
              最高<strong>{Math.max(hud.highScore, hud.score)}</strong>
            </span>
            <span className="nd-stat">
              时间<strong>{hud.elapsed.toFixed(1)}s</strong>
            </span>
            {hud.shieldActive && (
              <span className="nd-stat nd-stat--shield">护盾生效</span>
            )}
          </div>
        </div>

        {showOverlay ? (
          <div
            className={`nd-panel ${hud.phase === 'dead' ? 'nd-panel--dead' : ''}`}
          >
            {hud.phase === 'idle' ? (
              <>
                <h2>霓虹弹幕躲避</h2>
                <p>
                  {touchControl
                    ? '手指拖动飞船在屏幕中自由移动，躲避从四面八方飞来的霓虹弹幕。存活越久得分越高。'
                    : '使用方向键或 WASD 在屏幕中自由移动飞船，躲避从四面八方飞来的霓虹弹幕。存活越久得分越高。'}
                </p>
                <ul className="nd-tips">
                  <li>
                    <span className="nd-tip-icon nd-tip-icon--shield" /> 蓝色菱形
                    — 短时护盾
                  </li>
                  <li>
                    <span className="nd-tip-icon nd-tip-icon--clear" /> 粉色星形
                    — 清屏弹幕
                  </li>
                </ul>
                <div className="nd-panel-actions">
                  <button type="button" className="btn-primary" onClick={startGame}>
                    开始游戏
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>游戏结束</h2>
                <p>
                  本次得分 {hud.score}，最高纪录{' '}
                  {Math.max(hud.highScore, hud.score)}。再挑战一次吧！
                </p>
                <div className="nd-panel-actions">
                  <button type="button" className="btn-primary" onClick={startGame}>
                    再来一局
                  </button>
                  <button type="button" className="btn-ghost" onClick={resetToIdle}>
                    返回标题
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="nd-hint">
            {touchControl
              ? '拖动手指移动飞船'
              : '方向键或 WASD 移动'}
          </p>
        )}
      </div>
    </div>
  );
}
