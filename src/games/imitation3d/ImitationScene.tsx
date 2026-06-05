import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PADS } from './constants';
import type { PadId } from './constants';
import { PadCube } from './PadCube';

interface ImitationSceneProps {
  activePad: PadId | null;
  inputEnabled: boolean;
  orbitEnabled: boolean;
  isMobile: boolean;
  onPadClick: (id: PadId) => void;
}

function SceneControls({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enablePan = false;
    controls.minPolarAngle = 0.4;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 6;
    controls.maxDistance = 14;
    controls.target.set(0, 0.3, 0);
    controls.update();
    controlsRef.current = controls;

    return () => {
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = enabled;
    }
  }, [enabled]);

  return null;
}

function SceneContent({
  activePad,
  inputEnabled,
  orbitEnabled,
  onPadClick,
}: Omit<ImitationSceneProps, 'isMobile'>) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#a5b4fc" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1e2433" roughness={0.9} />
      </mesh>

      {PADS.map((pad) => (
        <PadCube
          key={pad.id}
          pad={pad}
          active={activePad === pad.id}
          disabled={!inputEnabled}
          onClick={onPadClick}
        />
      ))}

      <SceneControls enabled={orbitEnabled} />
    </>
  );
}

export function ImitationScene({
  activePad,
  inputEnabled,
  orbitEnabled,
  isMobile,
  onPadClick,
}: ImitationSceneProps) {
  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 7, 8], fov: 45 }}
      style={{
        width: '100%',
        height: '100%',
        background: '#0a0c12',
        touchAction: orbitEnabled ? 'none' : 'manipulation',
      }}
    >
      <SceneContent
        activePad={activePad}
        inputEnabled={inputEnabled}
        orbitEnabled={orbitEnabled}
        onPadClick={onPadClick}
      />
    </Canvas>
  );
}
