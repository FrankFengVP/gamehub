import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { PadConfig } from './constants';
import type { PadId } from './constants';

interface PadCubeProps {
  pad: PadConfig;
  active: boolean;
  disabled: boolean;
  onClick: (id: PadId) => void;
}

export function PadCube({ pad, active, disabled, onClick }: PadCubeProps) {
  const meshRef = useRef<Mesh>(null);
  const scaleTarget = active ? 1.18 : 1;

  useFrame(() => {
    if (!meshRef.current) return;
    const s = meshRef.current.scale.x;
    const next = s + (scaleTarget - s) * 0.2;
    meshRef.current.scale.setScalar(next);
  });

  return (
    <mesh
      ref={meshRef}
      position={pad.position}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick(pad.id);
      }}
      onPointerOver={() => {
        if (!disabled) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <boxGeometry args={[1.4, 1, 1.4]} />
      <meshStandardMaterial
        color={pad.color}
        emissive={pad.emissive}
        emissiveIntensity={active ? 1.2 : 0.08}
        roughness={0.35}
        metalness={0.15}
      />
    </mesh>
  );
}
