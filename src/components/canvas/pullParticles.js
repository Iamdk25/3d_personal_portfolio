import { BufferAttribute, DynamicDrawUsage } from 'three';

const trailCount = 20;
const burstCount = 14;
const lifetime = .62;
const emissionInterval = .027;

export const pullParticleVertex = /* glsl */ `
  uniform float pixelRatio;
  attribute vec3 appearance;
  varying float strength;
  varying float wave;
  void main() {
    strength = appearance.y;
    wave = appearance.z;
    gl_PointSize = appearance.x * pixelRatio;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
  }
`;

export const pullParticleFragment = /* glsl */ `
  varying float strength;
  varying float wave;
  void main() {
    vec2 point = gl_PointCoord - .5;
    float radius = length(point) * 2.;
    float halo = pow(max(0., 1. - radius), 2.);
    float core = 1. - smoothstep(.06, .3, radius);
    if (wave >= 0.) {
      float angle = atan(point.y, point.x);
      float crescent = smoothstep(-.3, .8, cos(2. * angle + wave * 2.));
      float rim = 1. - smoothstep(.013, .075, abs(radius - .78));
      core = rim * crescent;
      halo = (1. - smoothstep(.05, .22, abs(radius - .78))) * crescent * .24;
    }
    gl_FragColor = vec4(mix(vec3(.17, .57, .78), vec3(.83, .95, 1.), core), strength * max(core, halo));
    #include <colorspace_fragment>
  }
`;

export function makePullParticles(bodyCount) {
  const capacity = bodyCount * (trailCount * 2 + burstCount + 1);
  const position = new BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(DynamicDrawUsage);
  const appearance = new BufferAttribute(new Float32Array(capacity * 3), 3).setUsage(DynamicDrawUsage);
  let count = 0;

  return {
    position, appearance,
    clear() { count = 0; },
    add(x, y, z, size, opacity, wave = -1) {
      position.setXYZ(count, x, y, z);
      appearance.setXYZ(count++, size, opacity, wave);
    },
    flush(geometry) {
      geometry.setDrawRange(0, count);
      if (!count) return;
      position.needsUpdate = appearance.needsUpdate = true;
    },
  };
}

export function makePullWake() {
  return {
    trail: Array.from({ length: trailCount }, () => ({ time: -Infinity, x: 0, y: 0, z: 0 })),
    next: 0, last: -Infinity, held: false,
    release: { time: -Infinity, x: 0, y: 0, z: 0, strength: 0 },
  };
}

export function drawPullWake(batch, wake, body, t, pixelX, pixelY) {
  const { x, y, z } = body.object.position;
  const stretch = Math.hypot(body.x, body.y);
  const speed = Math.hypot(body.vx, body.vy);
  if (wake.held && !body.held && stretch > .036) {
    // The burst stays at the release point as the model springs back to its orbit.
    Object.assign(wake.release, { time: t, x, y, z, strength: Math.min(1, stretch * 5) });
  }
  wake.held = body.held;

  if (stretch > .012 && speed > .09 && t - wake.last >= emissionInterval) {
    Object.assign(wake.trail[wake.next], { time: t, x, y, z });
    wake.last = t;
    wake.next = (wake.next + 1) % trailCount;
  }

  if (t - wake.last >= lifetime && t - wake.release.time >= .85) return;

  wake.trail.forEach((spark, index) => {
    const age = t - spark.time;
    if (age >= lifetime) return;
    const alpha = (1 - age / lifetime) ** 1.45;
    const angle = index * 2.4;
    const spread = 2 + age * 39;
    const dx = Math.cos(angle) * spread * pixelX;
    const dy = Math.sin(angle) * spread * pixelY;
    batch.add(spark.x + dx, spark.y + dy, spark.z, 8 + alpha * 12, alpha * .94);
    batch.add(spark.x - dx * 1.6, spark.y - dy * 1.6, spark.z, 4 + alpha * 6, alpha * .72);
  });

  const release = wake.release;
  const age = (t - release.time) / .85;
  if (age >= 1) return;
  const reach = 17 + (1 - (1 - age) ** 2) * (36 + 25 * release.strength);
  const intensity = (1 - age) ** 1.45 * release.strength;
  batch.add(release.x, release.y, release.z + .006, Math.min(116, reach * 2.15), intensity * .68, age);
  for (let index = 0; index < burstCount; index++) {
    const angle = index * (Math.PI * 2 / burstCount) + age * .32;
    const radius = reach * (.82 + .18 * Math.sin(index * 2.4));
    batch.add(release.x + Math.cos(angle) * radius * pixelX,
      release.y + Math.sin(angle) * radius * pixelY,
      release.z, 5 + (index % 3) * 3, intensity);
  }
}
