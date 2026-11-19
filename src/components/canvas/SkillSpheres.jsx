import { Suspense, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { technologies } from '../../constants/tech';
import InvalidateBridge from './bridge';

const icons = technologies.map(item => item.icon);

function paintSkillLogo(texture) {
  return shader => {
    shader.uniforms.skillLogo = { value: texture };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 skillPosition;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nskillPosition = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 skillPosition;\nuniform sampler2D skillLogo;')
      .replace('#include <color_fragment>', `
        #include <color_fragment>
        vec3 surface = normalize(skillPosition);
        vec2 logoUV = vec2(surface.x * sign(surface.z), surface.y) / 1.37 + .5;
        // Sample on every fragment so adjacent pixels agree on the mip level at the logo boundary.
        vec4 ink = texture2D(skillLogo, clamp(logoUV, 0., 1.));
        vec2 distanceToEdge = min(logoUV, 1. - logoUV);
        vec2 coverage = smoothstep(vec2(0.), max(fwidth(logoUV), vec2(.0001)), distanceToEdge);
        float opacity = ink.a * coverage.x * coverage.y * smoothstep(.32, .40, abs(surface.z));
        diffuseColor.rgb = mix(diffuseColor.rgb, ink.rgb, opacity);
      `)
      .replace('#include <opaque_fragment>', `
        float band = abs(surface.y);
        float groove = 1. - smoothstep(.009, .027, abs(band - .76));
        float rim = 1. - smoothstep(.006, .021, abs(band - .80));
        outgoingLight *= 1. - .56 * groove;
        outgoingLight += vec3(.12, .17, .21) * rim;
        #include <opaque_fragment>
      `);
  };
}

function Balls({ slotsRef, rotationsRef, animate, onReady }) {
  const meshes = useRef([]);
  const bases = useRef([]);
  const textures = useLoader(THREE.TextureLoader, icons);
  const sphere = useMemo(() => new THREE.SphereGeometry(1, 40, 28), []);
  const paintLogos = useMemo(() => textures.map(paintSkillLogo), [textures]);
  const { gl, invalidate } = useThree();
  const elapsed = useRef(0);
  const painted = useRef(false);
  const revealFrame = useRef(0);

  useLayoutEffect(() => {
    textures.forEach(texture => {
      if (texture.colorSpace === THREE.SRGBColorSpace) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
    return () => textures.forEach(texture => texture.dispose());
  }, [textures]);

  useLayoutEffect(() => () => { sphere.dispose(); }, [sphere]);

  useLayoutEffect(() => {
    const measure = () => {
      const canvasRect = gl.domElement.getBoundingClientRect();
      slotsRef.current.forEach((slot, index) => {
        if (!slot) return;
        const rect = slot.getBoundingClientRect();
        bases.current[index] = {
          x: rect.left + rect.width / 2 - canvasRect.left - canvasRect.width / 2,
          y: -(rect.top + rect.height / 2 - canvasRect.top - canvasRect.height / 2),
          scale: Math.min(rect.width, rect.height) * 0.33,
        };
      });
      invalidate();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(gl.domElement);
    return () => observer.disconnect();
  }, [gl, invalidate, slotsRef]);

  useLayoutEffect(() => () => {
    cancelAnimationFrame(revealFrame.current);
    painted.current = false;
  }, []);

  useFrame((_, delta) => {
    if (animate) elapsed.current += Math.min(delta, .05);
    const time = elapsed.current;
    const amplitude = Math.min(time / .7, 1) * 5;
    meshes.current.forEach((mesh, index) => {
      const base = bases.current[index];
      const rotation = rotationsRef.current[index];
      if (!mesh || !base || !rotation) return;
      const bob = Math.sin(time * 1.05 + index * .7) * amplitude;
      mesh.position.set(base.x, base.y + bob, 0);
      mesh.scale.setScalar(base.scale || 36);
      mesh.rotation.set(rotation.x, rotation.y, 0);
    });
    if (!painted.current && bases.current.length === technologies.length) {
      painted.current = true;
      // Let the renderer finish this frame before crossfading the placeholder.
      revealFrame.current = requestAnimationFrame(() => onReady(true));
    }
  });

  return technologies.map((item, index) => (
    <mesh
      key={item.name}
      geometry={sphere}
      ref={(node) => {
        meshes.current[index] = node;
      }}
    >
      <meshStandardMaterial
        color="#ccd3d9"
        metalness={0.25}
        roughness={0.32}
        onBeforeCompile={paintLogos[index]}
      />
    </mesh>
  ));
}

export default function SkillSpheres({
  slotsRef,
  rotationsRef,
  animate,
  active,
  invalidateRef,
  onReady,
}) {
  const frameloop = !active ? 'never' : animate ? 'always' : 'demand';

  return (
    <Canvas
      orthographic
      frameloop={frameloop}
      dpr={[1, 1.35]}
      camera={{ position: [0, 0, 200], zoom: 1, near: 0.1, far: 400 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <InvalidateBridge api={invalidateRef} signature={String(animate)} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[3, 4, 6]} intensity={1.45} />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#bfe4db" />
      <Suspense fallback={null}>
        <Balls slotsRef={slotsRef} rotationsRef={rotationsRef} animate={animate && active} onReady={onReady} />
      </Suspense>
    </Canvas>
  );
}
