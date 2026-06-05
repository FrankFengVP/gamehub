import type { CSSProperties } from 'react';
import { PADS } from './constants';
import type { PadId } from './constants';
import { useImitationGame } from './useImitationGame';
import { ImitationScene } from './ImitationScene';
import { useIsMobile } from '@/hooks/useMediaQuery';
import './imitation3d.css';

const PHASE_HINT: Record<string, string> = {
  idle: '观看演示后，按相同顺序点击方块',
  showing: '请仔细观察闪烁顺序…',
  input: '轮到你了 — 复现刚才的顺序',
  success: '正确！准备下一关…',
  fail: '顺序错了，再试一次',
};

const PHASE_HINT_MOBILE: Record<string, string> = {
  idle: '观看演示后，点击下方色块复现顺序',
  showing: '请仔细观察闪烁顺序…',
  input: '按相同顺序点击底部色块',
  success: '正确！准备下一关…',
  fail: '顺序错了，再试一次',
};

export function Imitation3DGame() {
  const isMobile = useIsMobile();
  const {
    phase,
    level,
    score,
    highScore,
    activePad,
    sequenceLength,
    startGame,
    handlePadClick,
    retry,
  } = useImitationGame();

  const inputEnabled = phase === 'input';
  const showOverlay = phase === 'idle' || phase === 'fail';
  const orbitEnabled = !isMobile && (phase === 'idle' || phase === 'fail');
  const showTouchPads = isMobile && inputEnabled;
  const hints = isMobile ? PHASE_HINT_MOBILE : PHASE_HINT;

  return (
    <div className="imitation-root">
      <ImitationScene
        activePad={activePad}
        inputEnabled={inputEnabled && !isMobile}
        orbitEnabled={orbitEnabled}
        isMobile={isMobile}
        onPadClick={handlePadClick}
      />

      <div className={`imitation-hud ${isMobile ? 'imitation-hud--mobile' : ''}`}>
        <div className="imitation-hud-top">
          <div className="imitation-stats">
            <span className="imitation-stat">
              关卡<strong>{level}</strong>
            </span>
            <span className="imitation-stat">
              得分<strong>{score}</strong>
            </span>
            <span className="imitation-stat imitation-stat--hide-mobile">
              序列<strong>{sequenceLength || '—'}</strong>
            </span>
            <span className="imitation-stat">
              最高<strong>{highScore}</strong>
            </span>
          </div>
        </div>

        {showOverlay ? (
          <div
            className={`imitation-panel ${phase === 'fail' ? 'imitation-fail' : ''}`}
          >
            {phase === 'idle' ? (
              <>
                <h2>3D 模仿记忆</h2>
                <p>
                  {isMobile
                    ? '四个色块会按顺序闪烁，请在下方大按钮上按相同顺序点击复现。每过一关序列变长。'
                    : '四个彩色方块会按顺序闪烁，你需要在 3D 场景中点击相同顺序进行模仿。每过一关序列会变长，考验记忆力与反应。'}
                </p>
                <div className="imitation-panel-actions">
                  <button type="button" className="btn-primary" onClick={startGame}>
                    开始游戏
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>游戏结束</h2>
                <p>
                  本局得分 {score}，最高纪录 {Math.max(highScore, score)}。
                  再挑战一次吧！
                </p>
                <div className="imitation-panel-actions">
                  <button type="button" className="btn-primary" onClick={startGame}>
                    再来一局
                  </button>
                  <button type="button" className="btn-ghost" onClick={retry}>
                    返回标题
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <span
            className={`imitation-hint ${phase === 'input' ? 'imitation-hint--active' : ''}`}
          >
            {hints[phase]}
          </span>
        )}

        {showTouchPads && (
          <div className="imitation-touch-pads">
            {PADS.map((pad) => (
              <TouchPadButton
                key={pad.id}
                pad={pad}
                active={activePad === pad.id}
                onPress={handlePadClick}
              />
            ))}
          </div>
        )}

        {!showTouchPads && (
          <div className="imitation-hud-bottom">
            <div className="imitation-legend">
              {PADS.map((p) => (
                <span key={p.id} className="imitation-legend-item">
                  <span
                    className="imitation-legend-dot"
                    style={{ background: p.color }}
                  />
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TouchPadButtonProps {
  pad: (typeof PADS)[number];
  active: boolean;
  onPress: (id: PadId) => void;
}

function TouchPadButton({ pad, active, onPress }: TouchPadButtonProps) {
  const padStyle = {
    '--pad-color': pad.color,
    '--pad-glow': pad.emissive,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={`imitation-touch-pad ${active ? 'imitation-touch-pad--active' : ''}`}
      style={padStyle}
      onPointerDown={(e) => {
        e.preventDefault();
        onPress(pad.id);
      }}
      aria-label={pad.label}
    >
      {pad.label}
    </button>
  );
}
