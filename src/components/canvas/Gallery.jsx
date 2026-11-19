import { Earth, Saturn } from './RealisticObjects';
import StudioEnvironment from './StudioEnvironment';
import { Saucer } from './SpaceObjects';
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import useSpaceModel from './useSpaceModel';
import * as THREE from 'three';
import { models } from '../../utils/publicUrl';
import SceneLights from './lights';
import InvalidateBridge from './bridge';
import FirstFrame from './FirstFrame';
import { spatialHitTests } from './spatialHitTests';

const URLS = {
  workstation: models.workstation,
  astronaut: models.astronaut,
};

function fitScene(scene, workstation, sourceMaterials, anisotropy) {
  if (scene.userData.fitVersion === 8) return scene.userData.frameCorners;
  scene.position.set(0, 0, 0);
  scene.rotation.set(0, 0, 0);
  scene.scale.set(1, 1, 1);
  scene.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const max = Math.max(size.x, size.y, size.z) || 1;
  const scale = (workstation ? 5.3 : 2.75) / max;
  scene.scale.setScalar(scale);
  scene.position.copy(center).multiplyScalar(-scale);
  const half = size.multiplyScalar(scale * .5);
  const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(y =>
    [-1, 1].map(z => new THREE.Vector3(half.x * x, half.y * y, half.z * z))
  ));
  if (scene.userData.materialVersion !== 3) {
    scene.traverse((node) => {
      if (!node.isMesh || !node.material) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material.isMeshStandardMaterial) return;
        if (workstation) {
          material.metalness = Math.min(material.metalness, .45);
          material.roughness = Math.max(material.roughness, .42);
          for (const texture of [material.map, material.emissiveMap, material.normalMap, material.roughnessMap]) {
            if (!texture) continue;
            texture.anisotropy = anisotropy;
            texture.needsUpdate = true;
          }
        }
        if(!workstation){
          const source=sourceMaterials?.find(item=>item.name===material.name);
          if(source){material.color.fromArray(source.pbrMetallicRoughness?.baseColorFactor??[1,1,1]);}
          material.transmission=0;material.transparent=false;material.opacity=1;
          const metal=/steel|bodyrings/i.test(material.name);
          material.metalness=metal?.65:0;material.roughness=metal?.3:.82;
          if(/_blinn1SG$/.test(material.name)){material.color.set('#554733');material.metalness=.6;material.roughness=.12;}
        }
        material.flatShading=false;
        material.needsUpdate = true;
      });
    });
    scene.userData.materialVersion = 3;
  }
  scene.userData.fitVersion = 8;
  scene.userData.frameCorners = corners;
  return corners;
}

function GlbModel({ url, bounds }) {
  const { scene, parser } = useSpaceModel(url);


  const anisotropy = useThree(state => Math.min(8, state.gl.capabilities.getMaxAnisotropy()));
  useLayoutEffect(() => {
    bounds.current = fitScene(scene, url.includes('workstation'), parser.json.materials, anisotropy);
  }, [scene, url, parser, anisotropy, bounds]);

  return <primitive object={scene} dispose={null} />;
}

function Turntable({ group, rotationRef, draggingRef, spinRef, animate, object, children }) {
  useFrame((state, delta) => {
    if (!group.current) return;
    const dragging = draggingRef?.current;
    const astronaut = object === 'astronaut';
    if (animate && !dragging && !astronaut) {
      if (object === 'workstation') spinRef.current = Math.sin(state.clock.elapsedTime * .3) * .16;
      else spinRef.current += Math.min(delta, .05) * .035;
    }
    group.current.position.y = animate ? Math.sin(state.clock.elapsedTime * .65) * .11 : 0;
    const roll = astronaut ? -.2 : 0;
    group.current.rotation.z = roll + (animate ? Math.sin(state.clock.elapsedTime * .3) * .025 : 0);
    const ease = animate && !dragging && !astronaut ? 1 - Math.exp(-Math.min(delta, .05) * 14) : 1;
    group.current.rotation.x += (rotationRef.current.x - group.current.rotation.x) * ease;
    // The Mark III asset's visor faces local -Z. Present it to the +Z camera.
    const yaw = rotationRef.current.y + (astronaut ? Math.PI : spinRef.current);
    const diff = yaw - group.current.rotation.y;
    group.current.rotation.y += Math.atan2(Math.sin(diff), Math.cos(diff)) * ease;
  }, -1);

  return <group ref={group}>{children}</group>;
}

function ScrollCamera({ progressRef, enabled, cinematic, object, bounds, group }) {
  const orbit = useRef(new THREE.Vector3(0, .15, 7.1));
  const distance = useRef(7.1);
  const inverse = useRef(new THREE.Quaternion());
  const point = useRef(new THREE.Vector3());

  useFrame(({ camera, size }, delta) => {
    const progress = enabled ? (progressRef?.current ?? .5) : .5;
    const phase = (progress - .5) * Math.PI;
    const amount = cinematic ? 1 : .28;
    const x = Math.sin(phase) * (object === 'workstation' ? 1.4 : .85) * amount;
    const y = .15 + Math.cos(phase) * .65 * amount;
    const z = 7.6 - Math.cos(phase) * .8 * amount;
    const alpha = enabled ? 1 - Math.exp(-Math.min(delta, .05) * 5) : 1;
    const base = orbit.current;
    base.set(
      THREE.MathUtils.lerp(base.x, x, alpha),
      THREE.MathUtils.lerp(base.y, y, alpha),
      THREE.MathUtils.lerp(base.z, z, alpha),
    );
    camera.position.copy(base);
    camera.lookAt(0, 0, 0);
    if (!bounds.current || !group.current || !size.height || !size.width) return;

    // Each rotated corner has its own depth. Fit them to an inset of the
    // current perspective frustum so even fast turns never clip the model.
    group.current.updateWorldMatrix(true, false);
    const viewRotation = inverse.current.copy(camera.quaternion).invert();
    const tanY = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * .86;
    const tanX = tanY * size.width / size.height;
    const baseDistance = base.length();
    let required = baseDistance;
    for (const corner of bounds.current) {
      const projected = point.current.copy(corner)
        .applyMatrix4(group.current.matrixWorld).applyQuaternion(viewRotation);
      required = Math.max(required, projected.z + Math.max(
        Math.abs(projected.x) / tanX,
        Math.abs(projected.y) / tanY,
        camera.near,
      ));
    }
    // Move out immediately to protect the frame; ease back in as room opens.
    distance.current = Math.max(required, THREE.MathUtils.lerp(distance.current, required, alpha));
    camera.position.multiplyScalar(distance.current / baseDistance);
  });
  return null;
}

function ForegroundHitTest({ stageRef, group }) {
  const camera = useThree(state => state.camera);
  const canvas = useThree(state => state.gl.domElement);
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ray = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hits = [];
    spatialHitTests.set(stage, (clientX, clientY, slop = 0) => {
      if (!group.current) return false;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const samples = slop ? [[0, 0], [slop, 0], [-slop, 0], [0, slop], [0, -slop]] : [[0, 0]];
      return samples.some(([dx, dy]) => {
        pointer.set(2 * (clientX + dx - rect.left) / rect.width - 1, 1 - 2 * (clientY + dy - rect.top) / rect.height);
        ray.setFromCamera(pointer, camera);
        hits.length = 0;
        ray.intersectObject(group.current, true, hits);
        return hits.length > 0;
      });
    });
    return () => spatialHitTests.delete(stage);
  }, [camera, canvas, group, stageRef]);
  return null;
}

export default function GalleryCanvas({
  object,
  stageRef,
  progressRef,
  cinematic,
  animate,
  active,
  rotationRef,
  draggingRef,
  spinRef,
  invalidateRef,
  onReady,
}) {
  const frameloop = !active ? 'never' : animate ? 'always' : 'demand';
  const bounds = useRef(null);
  const modelGroup = useRef(null);
  const [lit, setLit] = useState(active);
  useEffect(() => { if (active) setLit(true); }, [active]);
  const [modelUrl] = useState(() => {
    if (object === 'workstation' && (matchMedia('(max-width: 800px)').matches || navigator.connection?.saveData)) {
      return models.compactWorkstation;
    }
    return URLS[object];
  });

  return (
    <Canvas
      dpr={object === 'workstation' ? [1, 1.75] : [1, 1.25]}
      frameloop={frameloop}
      camera={{ position: [0, 0.15, 7.1], fov: 30, near: 0.1, far: 50 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = object === 'workstation' ? .97 : 1.05;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <InvalidateBridge api={invalidateRef} signature={`${object}-${animate}-${active}`} />
      {['planet','saturn'].includes(object)?<><ambientLight intensity={.48}/><directionalLight position={[-3,2,4]} intensity={2.35}/></>:<SceneLights workstation={object === 'workstation'}/>}
      {lit && !['planet','saturn'].includes(object) && <StudioEnvironment intensity={object === 'workstation' ? .18 : .8}/>}
      <ScrollCamera progressRef={progressRef} enabled={animate} cinematic={cinematic} object={object} bounds={bounds} group={modelGroup}/>
      <Suspense fallback={null}><FirstFrame onReady={onReady}/><ForegroundHitTest stageRef={stageRef} group={modelGroup}/><Turntable group={modelGroup}
        rotationRef={rotationRef} draggingRef={draggingRef} spinRef={spinRef} animate={animate && active} object={object}>
        {object === 'ufo' ? <Saucer/> : object === 'saturn' ? <group scale={.8}><Saturn/></group> : object === 'planet' ? <Earth/> : (
          <GlbModel url={modelUrl} bounds={bounds} />
        )}
      </Turntable></Suspense>
    </Canvas>
  );
}
