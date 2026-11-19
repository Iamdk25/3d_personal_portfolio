import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import SceneLights from './lights';
import InvalidateBridge from './bridge';

const TOGETHER = [
  [1.15, 0.32, 0.18],
  [0.22, 1.02, 0.62],
  [0.78, 0.18, 1.18],
];

const APART = [
  [Math.PI / 2, 0, 0.2],
  [Math.PI / 2, 0, 0.2],
  [Math.PI / 2, 0, 0.2],
];

const APART_POSITION = [
  [0, 0.95, 0],
  [-1.05, -0.42, 0.1],
  [1.05, -0.38, -0.08],
];

const SATELLITES = [
  { angle: 0.4, lift: 0.42 },
  { angle: 2.2, lift: -0.15 },
  { angle: 3.7, lift: 0.22 },
  { angle: 5.2, lift: -0.38 },
];

export function OrbitRig({ spread = 0, animate = true, spin = true, rotationRef = null }) {
  const spinGroup = useRef(null);
  const userGroup = useRef(null);
  const rings = useRef([]);
  const satellites = useRef([]);
  const shown = useRef(spread);

  useFrame((_, delta) => {
    const next = animate ? shown.current + (spread - shown.current) * (1 - Math.exp(-delta * 2.6)) : spread;
    shown.current = next;

    rings.current.forEach((mesh, index) => {
      if (!mesh) return;
      mesh.rotation.set(
        TOGETHER[index][0] * (1 - next) + APART[index][0] * next,
        TOGETHER[index][1] * (1 - next) + APART[index][1] * next,
        TOGETHER[index][2] * (1 - next) + APART[index][2] * next,
      );
      mesh.position.set(
        APART_POSITION[index][0] * next,
        APART_POSITION[index][1] * next,
        APART_POSITION[index][2] * next,
      );
    });

    satellites.current.forEach((mesh, index) => {
      if (!mesh) return;
      const seed = SATELLITES[index];
      const distance = 1.28 + next * 0.72;
      mesh.position.set(
        Math.cos(seed.angle) * distance,
        seed.lift * (0.55 + next),
        Math.sin(seed.angle) * distance,
      );
    });

    if (userGroup.current && rotationRef?.current) {
      userGroup.current.rotation.x = rotationRef.current.x;
      userGroup.current.rotation.y = rotationRef.current.y;
    }

    if (spin && animate && spinGroup.current) {
      spinGroup.current.rotation.y += delta * 0.16;
    }
  });

  return (
    <group ref={spinGroup}>
      <group ref={userGroup}>
        <mesh>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshStandardMaterial
            color="#d6eee8"
            emissive="#628f84"
            emissiveIntensity={0.16}
            metalness={0.74}
            roughness={0.18}
          />
        </mesh>
        {TOGETHER.map((_, index) => (
          <mesh
            key={index}
            ref={(node) => {
              rings.current[index] = node;
            }}
          >
            <torusGeometry args={[0.94, 0.028, 18, 140]} />
            <meshStandardMaterial color="#e7eeec" metalness={0.78} roughness={0.2} />
          </mesh>
        ))}
        {SATELLITES.map((satellite, index) => (
          <mesh
            key={satellite.angle}
            ref={(node) => {
              satellites.current[index] = node;
            }}
          >
            <sphereGeometry args={[0.055, 24, 24]} />
            <meshStandardMaterial color="#f2f6f5" metalness={0.7} roughness={0.22} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function OrbitCanvas({
  spread = 0,
  animate = true,
  active = true,
  rotationRef = null,
  invalidateRef = null,
}) {
  const frameloop = !active ? 'never' : animate ? 'always' : 'demand';

  return (
    <Canvas
      flat
      dpr={[1, 1.5]}
      frameloop={frameloop}
      camera={{ position: [0, 0.12, 6.3], fov: 30, near: 0.1, far: 40 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <InvalidateBridge api={invalidateRef} signature={`${spread}-${animate}-${active}`} />
      <SceneLights />
      <OrbitRig spread={spread} animate={animate && active} spin={animate && active} rotationRef={rotationRef} />
    </Canvas>
  );
}
