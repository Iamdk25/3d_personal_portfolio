import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  HalfFloatType, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial,
  Vector2, Vector4, WebGLRenderTarget,
} from 'three';

const MAX_PANES = 16;
const MAX_PAIRS = 10;
const vertex = /* glsl */ `
  varying vec2 screenUV;
  void main() {
    screenUV = uv;
    gl_Position = vec4(position.xy, 0., 1.);
  }
`;
const downsample = /* glsl */ `
  uniform sampler2D source;
  uniform vec2 offset;
  varying vec2 screenUV;
  vec4 sampleScene(vec2 uv) {
    vec4 sceneColor = texture2D(source, uv);
    return vec4(sqrt(max(sceneColor.rgb, 0.)), sceneColor.a);
  }
  void main() {
    // Linear sampling at half resolution averages 2 by 2 source pixels.
    if (offset.x == 0.) {
      gl_FragColor = sampleScene(screenUV);
    } else {
      // Four bilinear samples cover the full 4 by 4 footprint at larger radii.
      gl_FragColor = .25 * (
        sampleScene(screenUV + offset) + sampleScene(screenUV - offset)
        + sampleScene(screenUV + vec2(offset.x, -offset.y))
        + sampleScene(screenUV + vec2(-offset.x, offset.y))
      );
    }
  }
`;
const gaussian = /* glsl */ `
  uniform sampler2D source;
  uniform vec2 texel;
  uniform vec2 pairs[${MAX_PAIRS}];
  uniform int pairCount;
  uniform float centerWeight;
  varying vec2 screenUV;
  void main() {
    vec4 color = texture2D(source, screenUV) * centerWeight;
    for (int i = 0; i < ${MAX_PAIRS}; i++) {
      if (i >= pairCount) break;
      vec2 step = texel * pairs[i].x;
      color += (texture2D(source, screenUV + step) + texture2D(source, screenUV - step)) * pairs[i].y;
    }
    gl_FragColor = color;
  }
`;
const composite = /* glsl */ `
  uniform sampler2D sharp;
  uniform sampler2D soft;
  uniform vec2 screenSize;
  uniform vec4 panes[${MAX_PANES}];
  uniform float corners[${MAX_PANES}];
  uniform float opacity[${MAX_PANES}];
  uniform int paneCount;
  uniform float strength;
  varying vec2 screenUV;
  void main() {
    vec2 pixel = vec2(screenUV.x, 1. - screenUV.y) * screenSize;
    float glass = 0.;
    for (int i = 0; i < ${MAX_PANES}; i++) {
      if (i >= paneCount) break;
      vec2 halfSize = panes[i].zw * .5;
      float radius = corners[i];
      vec2 q = abs(pixel - panes[i].xy - halfSize) - halfSize + radius;
      float edge = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - radius;
      glass = max(glass, opacity[i] * (1. - smoothstep(-.75, .75, edge)));
    }
    gl_FragColor = texture2D(sharp, screenUV);
    if (glass > 0. && strength > 0.) {
      vec4 blurred = texture2D(soft, screenUV);
      blurred.rgb *= blurred.rgb;
      gl_FragColor = mix(gl_FragColor, blurred, glass * strength);
    }
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function makePasses(renderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera();
  const geometry = new PlaneGeometry(2, 2);
  const material = (fragmentShader, uniforms) => new ShaderMaterial({
    vertexShader: vertex, fragmentShader, uniforms, depthTest: false, depthWrite: false,
  });
  const sample = material(downsample, { source: { value: null }, offset: { value: new Vector2() } });
  const blur = material(gaussian, {
    source: { value: null }, texel: { value: new Vector2() }, centerWeight: { value: 1 },
    pairCount: { value: 0 }, pairs: { value: Array.from({ length: MAX_PAIRS }, () => new Vector2()) },
  });
  const blend = material(composite, {
    sharp: { value: null }, soft: { value: null }, screenSize: { value: new Vector2() },
    strength: { value: 1 }, paneCount: { value: 0 },
    panes: { value: Array.from({ length: MAX_PANES }, () => new Vector4()) },
    corners: { value: new Float32Array(MAX_PANES) }, opacity: { value: new Float32Array(MAX_PANES) },
  });
  const quad = new Mesh(geometry, blend);
  quad.frustumCulled = false;
  scene.add(quad);
  const format = renderer.extensions.has('EXT_color_buffer_float') ? { type: HalfFloatType } : {};
  const context = renderer.getContext();
  const sampleCounts = context.getInternalformatParameter(context.RENDERBUFFER, format.type ? context.RGBA16F : context.RGBA8, context.SAMPLES);
  const samples = sampleCounts[0] >= 2 ? 2 : 0;
  const sharp = new WebGLRenderTarget(1, 1, format);
  const soft = new WebGLRenderTarget(1, 1, { ...format, depthBuffer: false });
  const scratch = new WebGLRenderTarget(1, 1, { ...format, depthBuffer: false });
  return {
    scene, camera, sample, blur, blend, quad, sharp, soft, scratch, samples,
    buffer: new Vector2(), lastScan: -Infinity, sigma: -1, panesDirty: true, moving: false, elements: null,
    dispose() {
      for (const item of [geometry, sample, blur, blend, sharp, soft, scratch]) item.dispose();
    },
  };
}

function scanPanes(passes, canvas) {
  const { left, top, width, height } = canvas.getBoundingClientRect();
  const { panes, corners, opacity, paneCount, screenSize } = passes.blend.uniforms;
  let count = 0;
  passes.elements ??= document.querySelectorAll('[data-scene-pane]');
  passes.moving = false;
  for (const element of passes.elements) {
    if (element.closest('[hidden]')) continue;
    const rect = element.getBoundingClientRect();
    const x = rect.left - left;
    const y = rect.top - top;
    if (!rect.width || !rect.height || x >= width || y >= height || x + rect.width <= 0 || y + rect.height <= 0) continue;
    const reveal = element.closest('[data-scene-reveal]');
    const alpha = reveal ? Number(getComputedStyle(reveal).opacity) : 1;
    if (alpha <= 0) continue;
    passes.moving ||= Boolean(element.closest('.float-card.is-floating'));
    panes.value[count].set(x, y, rect.width, rect.height);
    corners.value[count] = Math.min(Number(element.dataset.scenePane), rect.width / 2, rect.height / 2);
    opacity.value[count] = alpha;
    if (++count === MAX_PANES) break;
  }
  paneCount.value = count;
  screenSize.value.set(width, height);
  passes.panesDirty = false;
}

// Pair adjacent texels using the GPU's linear filter. Larger radii add samples
// instead of moving a handful of taps apart, which left visible copies of stars.
function setKernel(passes, sigma) {
  if (sigma === passes.sigma) return;
  passes.sigma = sigma;
  const { pairs, pairCount, centerWeight } = passes.blur.uniforms;
  const count = Math.min(MAX_PAIRS, Math.ceil(sigma * 1.65));
  const weight = pixel => Math.exp(-.5 * (pixel / sigma) ** 2);
  let total = 1;
  for (let i = 0; i < count; i++) {
    const pixel = i * 2 + 1;
    const a = weight(pixel);
    const b = weight(pixel + 1);
    const sum = a + b;
    pairs.value[i].set(pixel + b / sum, sum);
    total += sum * 2;
  }
  for (let i = 0; i < count; i++) pairs.value[i].y /= total;
  pairCount.value = count;
  centerWeight.value = 1 / total;
}

export default function SceneGlass() {
  const invalidate = useThree(state => state.invalidate);
  const renderer = useThree(state => state.gl);
  const passes = useMemo(() => makePasses(renderer), [renderer]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.sceneGlass = 'true';
    const redraw = () => { passes.panesDirty = true; invalidate(); };
    const refresh = () => { passes.elements = null; passes.lastScan = -Infinity; redraw(); };
    const observer = new ResizeObserver(refresh);
    observer.observe(document.body);
    window.addEventListener('portfolio:glass', refresh);
    window.addEventListener('scroll', redraw, { passive: true });
    window.addEventListener('resize', refresh);
    return () => {
      delete root.dataset.sceneGlass;
      observer.disconnect();
      window.removeEventListener('portfolio:glass', refresh);
      window.removeEventListener('scroll', redraw);
      window.removeEventListener('resize', refresh);
      passes.dispose();
    };
  }, [invalidate, passes]);

  useFrame(({ gl, scene, camera, frameloop }) => {
    const radius = Number(document.documentElement.dataset.glassBlur ?? 5);
    const { sharp, soft, scratch, sample, blur, blend, quad } = passes;
    const now = performance.now();
    const moving = passes.moving && document.documentElement.dataset.motion === 'on';
    if ((passes.panesDirty || moving) && (frameloop === 'demand' || now - passes.lastScan > 28)) {
      scanPanes(passes, gl.domElement);
      passes.lastScan = now;
    }
    const screen = blend.uniforms.screenSize.value;
    gl.getDrawingBufferSize(passes.buffer);
    const { x: width, y: height } = passes.buffer;
    if (!width || !height) return;
    sharp.setSize(width, height);
    // On retina displays the higher resolution itself provides edge smoothing.
    const samples = width / screen.x < 1.4 && width * height < 2_200_000
      ? passes.samples : 0;
    if (sharp.samples !== samples) {
      sharp.samples = samples;
      sharp.dispose();
    }
    const pass = (material, target) => {
      quad.material = material;
      gl.setRenderTarget(target);
      gl.render(passes.scene, passes.camera);
    };
    try {
      gl.setRenderTarget(sharp);
      gl.render(scene, camera);

      const hasBlur = radius > 0 && screen.y > 0 && blend.uniforms.paneCount.value > 0;
      if (hasBlur) {
        // The blur passes can use a smaller buffer without affecting the sharp image.
        const factor = radius >= 16 ? 4 : 2;
        soft.setSize(Math.ceil(width / factor), Math.ceil(height / factor));
        scratch.setSize(soft.width, soft.height);
        const variance = (radius * .42) ** 2 - (factor === 4 ? 3 : 0);
        setKernel(passes, Math.max(.15, Math.sqrt(variance) * soft.height / screen.y));

        sample.uniforms.source.value = sharp.texture;
        sample.uniforms.offset.value.set(factor === 4 ? 1 / width : 0, factor === 4 ? 1 / height : 0);
        pass(sample, soft);
        blur.uniforms.source.value = soft.texture;
        blur.uniforms.texel.value.set(1 / soft.width, 0);
        pass(blur, scratch);
        blur.uniforms.source.value = scratch.texture;
        blur.uniforms.texel.value.set(0, 1 / soft.height);
        pass(blur, soft);
      }

      blend.uniforms.sharp.value = sharp.texture;
      blend.uniforms.soft.value = hasBlur ? soft.texture : sharp.texture;
      blend.uniforms.strength.value = hasBlur ? Math.min(1, radius / 3) : 0;
      pass(blend, null);
    } finally {
      gl.setRenderTarget(null);
    }
  }, 1);

  return null;
}
