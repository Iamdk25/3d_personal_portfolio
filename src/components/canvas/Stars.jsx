import SceneGlass from './SceneGlass';
import StudioEnvironment from './StudioEnvironment';
import { Mars, Saturn, NasaCraft, CeramicMug, Donut } from './RealisticObjects';
import { BlackHole, BathDuck, Saucer } from './SpaceObjects';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, Vector3 } from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
import { useSite } from '../../context/SiteContext';
import useAfterPaint from '../../hooks/useAfterPaint';
import FirstFrame from './FirstFrame';
import useBackgroundPull, { makePullBody } from './useBackgroundPull';
import { drawPullWake, makePullParticles, makePullWake, pullParticleFragment, pullParticleVertex } from './pullParticles';

function softenPoints(shader) {
  shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
    vec2 point = gl_PointCoord * 2. - 1.;
    float radius = dot(point, point);
    float edge = fwidth(radius);
    diffuseColor.a *= 1. - smoothstep(1. - edge, 1. + edge, radius);
    #include <opaque_fragment>
  `);
}

function Field({ animate, drift, controls }) {
 const ref=useRef();
 const positions=useMemo(()=>random.inSphere(new Float32Array(4998),{radius:1.2}),[]);
 useFrame((_,delta)=>{if(!animate||!ref.current)return;const dt=Math.min(delta,.05);drift.current+=dt;ref.current.rotation.x=-drift.current/10+controls.current.y*.06;ref.current.rotation.y=-drift.current/15+controls.current.x*.05;});
 return <group rotation={[0,0,Math.PI/4]}>
   <points ref={ref} frustumCulled={false}>
     <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]}/></bufferGeometry>
     <pointsMaterial transparent color="#d5e2dd" size={.0016} sizeAttenuation depthWrite={false} onBeforeCompile={softenPoints}/>
   </points>
 </group>;
}

function BackdropResolution({ animate, setResolution }) {
  const { width, height } = useThree(state => state.size);
  const samples = useRef({ elapsed: 0, frames: 0, slowWindows: 0, reduced: false });
  const maximum = Math.min(window.devicePixelRatio || 1, 1.65, Math.max(.85, Math.sqrt(2_600_000 / (width * height))));
  useLayoutEffect(() => {
    const budget = samples.current;
    const ratio = budget.reduced ? Math.min(1.1, maximum) : maximum;
    setResolution(ratio);
  }, [maximum, setResolution]);
  useFrame((_, delta) => {
    const sample = samples.current;
    if (!animate || sample.reduced || maximum <= 1.1 || delta > .15) return;
    sample.elapsed += delta;
    sample.frames++;
    if (sample.elapsed < 2) return;
    sample.slowWindows = sample.elapsed / sample.frames > .028 ? sample.slowWindows + 1 : 0;
    sample.elapsed = sample.frames = 0;
    if (sample.slowWindows >= 2) {
      sample.reduced = true;
      setResolution(1.1);
    }
  }, -10);
  return null;
}
// Screen-relative orbital paths continue outside the frame on both phone and desktop.
const lanes = [
  { phase: 2.13, rate: .096, radiusX: 1.66, radiusY: .37, centerY: .21, z: -.8 },
  { phase: 5.42, rate: .078, radiusX: 1.38, radiusY: .54, centerY: .17, z: -1.1 },
  { phase: 4.3, rate: .102, radiusX: 1.53, radiusY: .33, centerY: -.23, z: -1 },
  { phase: 1.68, rate: .27, radiusX: 1.65, radiusY: .27, centerY: .56, z: -1 },
  { phase: .93, rate: .112, radiusX: 1.39, radiusY: .44, centerY: .38, z: -1.2 },
  { phase: 3.92, rate: .082, radiusX: 1.24, radiusY: 1.29, centerY: .58, z: -1.25 },
  { phase: 4.85, rate: .095, radiusX: 1.26, radiusY: 1.15, centerY: .48, z: -1.2 },
  { phase: 5.27, rate: .071, radiusX: 1.64, radiusY: .37, centerY: -.27, z: -1.3 },
  { phase: .66, rate: .062, radiusX: 1.56, radiusY: .69, centerY: -.18, z: -1.4 },
  { phase: 3.35, rate: .081, radiusX: 1.76, radiusY: .72, centerY: .07, z: -1.32 },
].map(lane => ({ ...lane, depth: new Vector3(0, 0, lane.z) }));

function stageObject(object) {
  const materials = new Map();
  object.traverse(node => {
    if (!node.isMesh) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (materials.has(material)) continue;
      materials.set(material, { opacity: material.opacity, transparent: material.transparent });
      material.transparent = true;
      material.opacity = 0;
    }
  });
  return { materials, fade: 0 };
}

function DriftingObjects({ animate, drift, controls }) {
 const group = useRef(null);
 const staged = useRef(new Map());
 const bodies = useRef(new Map());
 const wakes = useRef(new Map());
 const wakeGeometry = useRef(null);
 const particles = useMemo(() => makePullParticles(lanes.length), []);
 const wakeUniforms = useMemo(() => ({ pixelRatio: { value: 1 } }), []);
 const updatePull = useBackgroundPull(bodies, animate);
 const viewport = useThree(state => state.viewport);
 const camera = useThree(state => state.camera);
 const layout = useMemo(() => lanes.map(lane => ({
   ...lane, frame: viewport.getCurrentViewport(camera, lane.depth),
 })), [camera, viewport]);
 useLayoutEffect(() => {
   const props = staged.current;
   const targets = bodies.current;
   const effects = wakes.current;
   wakeGeometry.current.setDrawRange(0, 0);
   return () => {
     for (const { materials } of props.values()) {
       for (const [material, original] of materials) Object.assign(material, original);
     }
     props.clear();
     targets.clear();
     effects.clear();
   };
 }, []);
 useEffect(() => {
   if (!animate) {
     for (const object of wakes.current.keys()) wakes.current.set(object, makePullWake());
   }
 }, [animate]);
 useFrame((state, delta) => {
  const dt = Math.min(delta, .05);
  const t = drift.current;
  const { x: pointerX, y: pointerY, scroll } = controls.current;
  const compact = state.size.width < 600;
  particles.clear();
  wakeUniforms.pixelRatio.value = state.gl.getPixelRatio();
  group.current.children.forEach((object, index) => {
    let prop = staged.current.get(object);
    if (!prop && object.children.length) {
      prop = stageObject(object);
      staged.current.set(object, prop);
      if (object.userData.grabbable) {
        bodies.current.set(object, makePullBody(object));
        wakes.current.set(object, makePullWake());
      }
    }
    if (prop && prop.fade < 1) {
      prop.fade = animate ? Math.min(1, prop.fade + dt * 1.6) : 1;
      for (const [material, original] of prop.materials) {
        material.opacity = original.opacity * prop.fade;
        if (prop.fade === 1) material.transparent = original.transparent;
      }
    }
    const lane = layout[index];
    const frame = lane.frame;
    const phase = lane.phase + t * lane.rate;
    const parallax = .045 + (index % 3) * .018;
    const offset = Math.sin(scroll * .9 + index * 1.8);
    const x = Math.cos(phase) * lane.radiusX + pointerX * parallax + offset * .07;
    const y = lane.centerY + Math.sin(phase) * lane.radiusY + pointerY * parallax;
    const proximity = Math.max(0, 1 - Math.hypot(pointerX - x, pointerY - y) * 2.2);
    const driftToward = proximity * .12;
    const body = bodies.current.get(object);
    const homeX = MathUtils.lerp(x, pointerX, driftToward);
    const homeY = MathUtils.lerp(y, pointerY, driftToward);
    const z = lane.z + Math.cos(phase) * .18 + proximity * .045;
    if (body) updatePull(body, homeX, homeY, dt);
    const perspective = (camera.position.z - z) / (camera.position.z - lane.z);
    const width = frame.width * perspective;
    const height = frame.height * perspective;
    object.position.set((body?.screenX ?? homeX) * width / 2, (body?.screenY ?? homeY) * height / 2, z);
    if (animate && body) drawPullWake(particles, wakes.current.get(object), body, t, width / state.size.width, height / state.size.height);
    const baseScale = object.userData.baseScale ?? 1;
    object.scale.setScalar(baseScale * (compact ? .73 : 1) * (1 + proximity * .12 + offset * .05));
    if (object.userData.comet) {
      object.rotation.z = Math.atan2(Math.cos(phase) * lane.radiusY * height, -Math.sin(phase) * lane.radiusX * width);
    } else if (animate) {
      object.rotation.y += dt * .14;
      object.rotation.z = Math.sin(phase) * .20 + pointerX * parallax * 2 + proximity * (pointerX - x) * .55 + (body?.x ?? 0) * .32;
    }
  });
  particles.flush(wakeGeometry.current);
 });
 return <><group ref={group}>
  <group position={[-.65,.38,-.8]} userData={{baseScale:.12, grabbable:true}} scale={.12}><Suspense fallback={null}><Saturn/></Suspense></group>
  <group position={[.66,-.1,-1.1]} userData={{grabbable:true}} rotation={[.1,.5,.2]}><Suspense fallback={null}><NasaCraft name="cubesat" size={.32}/></Suspense></group>
  <group position={[-.64,-.51,-1]} userData={{baseScale:.1, grabbable:true}} rotation={[.3,.2,0]} scale={.1}><Saucer/></group>
  <group userData={{comet:true}}><mesh><sphereGeometry args={[.008,16,12]}/><meshBasicMaterial color="#deefe7"/></mesh><mesh position={[-.095,0,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.006,.18,12]}/><meshBasicMaterial color="#9abdb5" transparent opacity={.2} depthWrite={false}/></mesh></group>
  <group position={[.64,.62,-1.2]} userData={{baseScale:.1, grabbable:true}} rotation={[.5,.3,0]} scale={.1}><Donut/></group>
  <group position={[-.74,-.19,-1.1]} userData={{baseScale:.12, grabbable:true}} rotation={[.3,0,.3]} scale={.12}><CeramicMug/></group>
  <group position={[.2,-.68,-1.2]} userData={{grabbable:true}} rotation={[.2,0,-.3]}><Suspense fallback={null}><NasaCraft name="voyager" size={.4}/></Suspense></group>
  <group position={[.7,-.61,-1.3]} userData={{baseScale:.11, grabbable:true}} scale={.11}><Suspense fallback={null}><Mars/></Suspense></group>
  <group userData={{baseScale:.115, grabbable:true}} scale={.115}><BlackHole/></group>
  <group userData={{baseScale:.077, grabbable:true}} scale={.077}><BathDuck/></group>
 </group><points frustumCulled={false}>
   <bufferGeometry ref={wakeGeometry} attributes-position={particles.position} attributes-appearance={particles.appearance}/>
   <shaderMaterial uniforms={wakeUniforms} vertexShader={pullParticleVertex} fragmentShader={pullParticleFragment}
     transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false}/>
 </points></>;
}
function SmoothMotion({ target, controls, animate }) {
 useFrame((_, delta) => {
   const factor = animate ? 1 - Math.exp(-Math.min(delta, .05) * 6) : 0;
   for (const key of ['x','y','scroll']) {
     controls.current[key] = MathUtils.lerp(controls.current[key], target.current[key], factor);
   }
   if (!animate) controls.current.scroll = target.current.scroll;
 });
 return null;
}

export default function Stars(){
 const {animate}=useSite();
 const [resolution, setResolution] = useState(1);
 const [painted, setPainted] = useState(false);
 const objectsReady = useAfterPaint(painted);
 const drift=useRef(0);
 const target=useRef({ x: 0, y: 0, scroll: 0 });
 const controls=useRef({ x: 0, y: 0, scroll: 0 });
 useEffect(()=>{
  const move = event => {
    if(event.pointerType === 'touch') return;
    target.current.x = 2 * event.clientX / window.innerWidth - 1;
    target.current.y = 1 - 2 * event.clientY / window.innerHeight;
  };
  const scroll = () => { target.current.scroll = window.scrollY / window.innerHeight; };
  const leave = () => { target.current.x = 0; target.current.y = 0; };
  scroll();
  window.addEventListener('pointermove', move, {passive:true});
  window.addEventListener('scroll', scroll, {passive:true});
  document.documentElement.addEventListener('pointerleave', leave);
  return ()=>{
    window.removeEventListener('pointermove', move);
    window.removeEventListener('scroll', scroll);
    document.documentElement.removeEventListener('pointerleave', leave);
  };
 },[]);
 return <div className="starfield" data-ready={painted} aria-hidden="true"><Canvas dpr={resolution} frameloop={animate?'always':'demand'} camera={{position:[0,0,1]}} gl={{antialias:true,alpha:false}} onCreated={({gl})=>{gl.setClearColor('#000000',1);gl.domElement.id='space-canvas';}}>
   <BackdropResolution animate={animate} setResolution={setResolution}/>
   <ambientLight intensity={.3}/><directionalLight position={[1,2,3]} intensity={1.7}/>
   <SmoothMotion target={target} controls={controls} animate={animate}/>
   <Field animate={animate} drift={drift} controls={controls}/><SceneGlass/>
   <FirstFrame onReady={() => setPainted(true)}/>
   {objectsReady && <><StudioEnvironment intensity={.5}/><DriftingObjects animate={animate} drift={drift} controls={controls}/></>}
 </Canvas></div>;
}
