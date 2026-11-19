import { useLayoutEffect, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import useSpaceModel from './useSpaceModel';
import * as THREE from 'three';
import { publicUrl } from '../../utils/publicUrl';

function useSurfaceMaps(names, colorCount = names.length) {
  const source = useLoader(THREE.TextureLoader, names.map(name => publicUrl(`models/${name}`)));
  const maps = useMemo(() => source.map(texture => texture.clone()), [source]);
  useLayoutEffect(() => {
    for (const map of maps.slice(0, colorCount)) {
      if (map.colorSpace === THREE.SRGBColorSpace && map.anisotropy === 4) continue;
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = 4;
      map.needsUpdate = true;
    }
    return () => maps.forEach(map => map.dispose());
  }, [maps, colorCount]);
  return maps;
}
export function Earth() {
  const [day, clouds] = useSurfaceMaps(['blue-marble.webp', 'earth-clouds.webp'], 1);
  return <group rotation={[.06, -.38, -.2]}>
    <mesh>
      <sphereGeometry args={[1.2, 112, 72]} />
      <meshStandardMaterial map={day} roughness={.75} />
    </mesh>
    <mesh rotation={[0, .025, 0]}>
      <sphereGeometry args={[1.214, 72, 48]} />
      <meshStandardMaterial color="#eefaff" alphaMap={clouds} transparent opacity={.44} depthWrite={false} />
    </mesh>
    <mesh>
      <sphereGeometry args={[1.25, 64, 48]} />
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 surfaceNormal;
          varying vec3 eye;
          void main() {
            vec4 view = modelViewMatrix * vec4(position, 1.);
            surfaceNormal = normalMatrix * normal;
            eye = -view.xyz;
            gl_Position = projectionMatrix * view;
          }
        `}
        fragmentShader={`
          varying vec3 surfaceNormal;
          varying vec3 eye;
          void main() {
            float facing = max(0., dot(normalize(surfaceNormal), normalize(eye)));
            float edge = pow(1. - facing, 4.) * smoothstep(0., .23, facing);
            gl_FragColor = vec4(.055, .48, .63, edge * .57);
            #include <colorspace_fragment>
          }
        `} />
    </mesh>
    <group rotation={[1.15, -.26, -.64]}>
      <mesh>
        <torusGeometry args={[1.47, .006, 6, 96]} />
        <meshBasicMaterial color="#77e5e3" transparent opacity={.33} depthWrite={false} />
      </mesh>
      <mesh position={[1.47, 0, 0]}>
        <sphereGeometry args={[.022, 12, 8]} />
        <meshBasicMaterial color="#cbffff" />
      </mesh>
      <mesh position={[-1.47, 0, 0]}>
        <sphereGeometry args={[.014, 12, 8]} />
        <meshBasicMaterial color="#89dbdc" />
      </mesh>
    </group>
  </group>;
}

export function Mars() {
  const [surface] = useSurfaceMaps(['mars-viking.webp']);
  return <mesh rotation={[.08, .4, -.16]}>
    <sphereGeometry args={[1.15, 80, 48]} />
    <meshStandardMaterial map={surface} roughness={.95} />
  </mesh>;
}

export function Saturn(){
 const [surface,ring]=useSurfaceMaps(['saturn-color.webp','saturn-rings.png']);
 const geometry=useMemo(()=>{const g=new THREE.RingGeometry(1.05,1.75,128);const pos=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<pos.count;i++){const r=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(r-1.05)/.7,.5);}return g;},[]);
 return <group rotation={[.18,0,.4]}><mesh><sphereGeometry args={[.88,96,64]}/><meshStandardMaterial map={surface} roughness={.96}/></mesh><mesh geometry={geometry} rotation={[1.05,0,0]}><meshStandardMaterial map={ring} transparent side={THREE.DoubleSide} opacity={.95} roughness={.9} depthWrite={false}/></mesh></group>;
}
export function NasaCraft({ name, size = 1 }) {
  const { scene } = useSpaceModel(publicUrl(`models/nasa-${name}.glb`));
  const { scale, position } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const extent = box.getSize(new THREE.Vector3());
    const scale = size / Math.max(extent.x, extent.y, extent.z);
    const position = box.getCenter(new THREE.Vector3()).multiplyScalar(-scale);
    return { scale, position };
  }, [scene, size]);
  return <group scale={scale} position={position}><primitive object={scene} dispose={null}/></group>;
}
export function CeramicMug(){
 const profile=useMemo(()=>[[.4,0],[.46,.02],[.49,.1],[.51,.8],[.5,.88],[.46,.9],[.43,.87],[.43,.15],[.4,.13]].map(([x,y])=>new THREE.Vector2(x,y-.45)),[]);
 return <group><mesh><latheGeometry args={[profile,64]}/><meshStandardMaterial color="#e3ded1" roughness={.22} metalness={.04}/></mesh><mesh position={[.6,.03,0]} scale={[.75,1,1]}><torusGeometry args={[.29,.075,16,48]}/><meshStandardMaterial color="#e3ded1" roughness={.22}/></mesh><mesh position={[0,.35,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.435,64]}/><meshPhysicalMaterial color="#39251b" roughness={.18} clearcoat={.8}/></mesh></group>;
}
export function Donut(){
 const icing=useMemo(()=>{const g=new THREE.TorusGeometry(.55,.235,24,80,Math.PI*2);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);pos.setZ(i,z+Math.sin(Math.atan2(y,x)*9)*.018);}g.computeVertexNormals();return g;},[]);
 return <group><mesh><torusGeometry args={[.55,.24,28,80]}/><meshStandardMaterial color="#b77a3d" roughness={.78}/></mesh><mesh geometry={icing} position={[0,0,.035]} scale={[1,1,.6]}><meshPhysicalMaterial color="#a76e74" roughness={.38} clearcoat={.25}/></mesh></group>;
}
