import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MathUtils, Vector2 } from 'three';
import InvalidateBridge from './bridge';
import FirstFrame from './FirstFrame';

const vertex = /* glsl */ `
  uniform float time;
  uniform float pulse;
  uniform float pressure;
  uniform float energy;
  uniform vec2 pointer;
  uniform vec2 wake;
  varying vec3 vPosition;
  varying vec3 vSurface;
  varying vec3 vNormal;

  vec3 sculpt(vec3 n) {
    float swell = sin(n.x * 3.8 + n.y * 2.8 + time * .9) * .085
      + sin(n.z * 4.8 - n.y * 3.5 - time * .65) * .071
      + cos(n.x * 5.2 + n.z * 3. + time * .66) * .04;
    vec3 viewNormal = normalize(normalMatrix * n);
    vec3 direction = normalize(vec3(pointer * 1.5, .72));
    float proximity = max(dot(viewNormal, direction), 0.);
    float dent = pow(proximity, 7.) * (.20 * pressure + .18 * pulse);
    float shoulder = pow(proximity, 2.) * (1. - pow(proximity, 5.)) * pressure * .16;
    float distance = length(viewNormal - normalize(vec3(wake * 1.45, .76)));
    float ripple = sin(distance * 21. - time * 10.) * exp(-3.2 * distance) * (.17 * energy + .12 * pulse);
    vec3 p = n * (1. + swell + shoulder + ripple - dent);
    p.y *= .94;
    return p;
  }

  void main() {
    vec3 n = normalize(position);
    vec3 p = sculpt(n);
    vec3 tangent = normalize(cross(n, abs(n.y) < .93 ? vec3(0., 1., 0.) : vec3(1., 0., 0.)));
    vec3 bitangent = cross(n, tangent);
    vec3 surfaceNormal = cross(sculpt(normalize(n + tangent * .008)) - p,
                             sculpt(normalize(n + bitangent * .008)) - p);
    vec4 view = modelViewMatrix * vec4(p, 1.);
    vPosition = p;
    vSurface = view.xyz;
    vNormal = normalize(normalMatrix * surfaceNormal);
    gl_Position = projectionMatrix * view;
  }
`;
const fragment = /* glsl */ `
  uniform float time;
  uniform float pulse;
  uniform float pressure;
  uniform float energy;
  uniform vec2 pointer;
  uniform vec2 wake;
  varying vec3 vPosition;
  varying vec3 vSurface;
  varying vec3 vNormal;

  float caustic(vec3 p) {
    vec3 q = p * 7.;
    q += .55 * sin(q.yzx * .65 + vec3(time * .55, -time * .31, time * .42));
    float fold = sin(q.x + cos(q.z)) + sin(q.y + sin(q.x)) + cos(q.z + sin(q.y));
    return .115 / (.115 + abs(fold) * abs(fold));
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 eye = normalize(-vSurface);
    float facing = clamp(dot(eye, normal), 0., 1.);
    float rim = pow(1. - facing, 2.1);
    float trail = exp(-5. * length(normal.xy - wake * .72));
    vec3 p = vPosition + refract(-eye, normal, .73) * .58;
    p.xy += (pointer - wake) * (trail * energy * .72);
    float beams = caustic(p);
    float second = caustic(p.zxy * 1.18 + vec3(.32, .09, -.27));
    float split = caustic(p + vec3(.021, -.022, 0.));
    float sky = clamp(dot(normal, normalize(vec3(-.65, .78, .56))) * .5 + .5, 0., 1.);
    float silk = pow(max(dot(reflect(normalize(vec3(.52, -.72, -1.)), normal), eye), 0.), 16.);
    vec3 color = mix(vec3(.006, .044, .105), vec3(.045, .28, .46), pow(sky, 2.2));
    color += rim * vec3(.09, .44, .62);
    color += vec3(split * .13, beams * .38, beams * .45) * (.55 + .45 * sky);
    color += second * vec3(.021, .135, .22) + silk * vec3(.42, .73, .86);
    float touchLight = exp(-7. * length(normal.xy - pointer * .72));
    color += (trail * energy + touchLight * pressure + pulse) * beams * vec3(.052, .19, .30);
    gl_FragColor = vec4(color, .74 + rim * .2);
    #include <colorspace_fragment>
  }
`;

function Blob({ interaction, animate }) {
  const mesh = useRef(null);
  const pulseCount = useRef(0);
  const uniforms = useMemo(() => ({
    time: { value: 0 }, pulse: { value: 0 }, pointer: { value: new Vector2() },
    wake: { value: new Vector2() }, pressure: { value: 0 }, energy: { value: 0 },
  }), []);

  useFrame((_, delta) => {
    const { x, y, count, inside, pressed } = interaction.current;
    if (count !== pulseCount.current) {
      pulseCount.current = count;
      uniforms.pulse.value = animate ? 1 : uniforms.pulse.value > 0 ? 0 : .55;
    }
    const dt = Math.min(delta, .05);
    if (animate) {
      uniforms.time.value += dt * .78;
      uniforms.pulse.value = MathUtils.damp(uniforms.pulse.value, 0, 3.7, dt);
    }
    const pointer = uniforms.pointer.value;
    const wake = uniforms.wake.value;
    const strength = pressed && inside ? 1 : inside ? .55 : 0;
    pointer.x = animate ? MathUtils.damp(pointer.x, x, 13, dt) : x;
    pointer.y = animate ? MathUtils.damp(pointer.y, y, 13, dt) : y;
    wake.x = animate ? MathUtils.damp(wake.x, pointer.x, 4.2, dt) : x;
    wake.y = animate ? MathUtils.damp(wake.y, pointer.y, 4.2, dt) : y;
    uniforms.pressure.value = animate ? MathUtils.damp(uniforms.pressure.value, strength, 8, dt) : strength * .75;
    const motion = inside ? Math.min(1, pointer.distanceTo(wake) * 2.2) : 0;
    uniforms.energy.value = animate ? MathUtils.damp(uniforms.energy.value, motion, 6, dt) : 0;
    const time = uniforms.time.value;
    const spin = time * .16;
    const bend = uniforms.pressure.value;
    mesh.current.rotation.set(-.2 - pointer.y * bend * .26, spin + pointer.x * bend * .36, .16 + Math.sin(time * .6) * .09);
    mesh.current.position.set(pointer.x * bend * .12, Math.sin(time * .82) * .042 + pointer.y * bend * .11, 0);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1, 64, 48]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

export default function LiquidBlob({ animate, active, interaction, invalidate, onReady }) {
  return <Canvas
    aria-hidden="true"
    dpr={[1, 1.35]}
    frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
    camera={{ position: [0, 0, 4.4], fov: 35 }}
    gl={{ alpha: true, antialias: true }}
  >
    <InvalidateBridge api={invalidate} signature={String(active) + animate} />
    <Blob animate={animate} interaction={interaction} />
    <FirstFrame onReady={onReady}/>
  </Canvas>;
}
