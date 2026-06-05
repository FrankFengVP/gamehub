import { LightBounceBoard } from './LightBounceBoard';
import { useLightBounceGame } from './useLightBounceGame';
import './light-bounce.css';

export function LightBounceGame() {
  const {
    level,
    levelIndex,
    totalLevels,
    mirrorAngles,
    trace,
    solved,
    showIntro,
    rotateMirror,
    resetLevel,
    nextLevel,
    prevLevel,
    dismissIntro,
  } = useLightBounceGame();

  const isLastLevel = levelIndex >= totalLevels - 1;
  const litNodes = trace.hitNodeIds.length;
  const totalNodes = level.nodes.length;

  return (
    <div className="lb-root">
      <div className="lb-board-wrap">
        <LightBounceBoard
          level={level}
          mirrorAngles={mirrorAngles}
          trace={trace}
          onRotateMirror={rotateMirror}
        />
      </div>

      <div className="lb-hud">
        <div className="lb-hud-top">
          <div className="lb-stats">
            <span className="lb-stat">
              关卡<strong>{levelIndex + 1}</strong>/{totalLevels}
            </span>
            <span className="lb-stat lb-stat--title">{level.title}</span>
            {totalNodes > 0 && (
              <span className="lb-stat">
                节点<strong>
                  {litNodes}/{totalNodes}
                </strong>
              </span>
            )}
          </div>
          <div className="lb-actions">
            <button
              type="button"
              className="btn-ghost lb-btn-sm"
              onClick={prevLevel}
              disabled={levelIndex === 0}
            >
              上一关
            </button>
            <button
              type="button"
              className="btn-ghost lb-btn-sm"
              onClick={resetLevel}
            >
              重置
            </button>
          </div>
        </div>

        {showIntro ? (
          <div className="lb-panel">
            <h2>光线折射实验室</h2>
            <p>
              点击紫色镜子旋转角度，调整激光路径。激光需经过所有黄色能量节点，最终到达绿色终点。
            </p>
            <div className="lb-panel-actions">
              <button type="button" className="btn-primary" onClick={dismissIntro}>
                开始实验
              </button>
            </div>
          </div>
        ) : solved ? (
          <div className="lb-panel lb-panel--win">
            <h2>实验成功！</h2>
            <p>
              {isLastLevel
                ? '全部关卡已完成，你是光学大师！'
                : `「${level.title}」已通过，准备进入下一关。`}
            </p>
            <div className="lb-panel-actions">
              {!isLastLevel && (
                <button type="button" className="btn-primary" onClick={nextLevel}>
                  下一关
                </button>
              )}
              <button type="button" className="btn-ghost" onClick={resetLevel}>
                重玩本关
              </button>
            </div>
          </div>
        ) : (
          <p className="lb-hint">{level.hint}</p>
        )}
      </div>
    </div>
  );
}
