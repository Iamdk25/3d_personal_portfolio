import { useMemo } from 'react';
import * as THREE from 'three';

// Original geometry keeps these scenes small and independent of model downloads.
export function Saucer() {
 const profile=useMemo(()=>[[0,-.23],[.42,-.22],[.9,-.12],[1.25,0],[1.2,.08],[.86,.18],[.57,.3],[.48,.35]].map(([x,y])=>new THREE.Vector2(x,y)),[]);
 return <group rotation={[.12,0,.12]}>
  <mesh><latheGeometry args={[profile,128]}/><meshStandardMaterial color="#9baaa8" metalness={.88} roughness={.24}/></mesh>
  <mesh position={[0,.3,0]} scale={[1,.7,1]}><sphereGeometry args={[.48,40,24,0,Math.PI*2,0,Math.PI/2]}/><meshPhysicalMaterial color="#162c31" metalness={.45} roughness={.08} clearcoat={1} clearcoatRoughness={.06}/></mesh>
  <mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.21,.035,8,80]}/><meshStandardMaterial color="#cad7cf" metalness={.75} roughness={.22}/></mesh>
  <mesh position={[0,-.18,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.65,.035,8,64]}/><meshStandardMaterial color="#91c5b4" emissive="#7bcbac" emissiveIntensity={1.5}/></mesh>
  {Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <group key={i} position={[Math.cos(a)*1.05,.1,Math.sin(a)*1.05]}><mesh rotation={[0,-a,0]}><boxGeometry args={[.065,.025,.15]}/><meshStandardMaterial color="#d6e6cf" emissive="#a9c7b3" emissiveIntensity={.9}/></mesh></group>})}
  {[ [.58,.285],[.85,.19],[1.08,.1] ].map(([r,y])=><mesh key={r} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[r,.007,6,128]}/><meshStandardMaterial color="#24312f" metalness={.7} roughness={.32}/></mesh>)}
  <mesh position={[0,-.19,0]}><sphereGeometry args={[.23,24,12]}/><meshStandardMaterial color="#283c35" metalness={.65} roughness={.2}/></mesh>
 </group>;
}
export function RingedPlanet(){
 return <group rotation={[.15,0,.35]}>
  <mesh><sphereGeometry args={[.8,48,32]}/><meshStandardMaterial color="#c0a47b" roughness={.85}/></mesh>
  {[-.42,-.18,.12,.34].map((y,i)=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[Math.sqrt(.8*.8-y*y)+.002,.012+i*.003,4,64]}/><meshStandardMaterial color={i%2?'#a58d6d':'#dac49c'} roughness={.9}/></mesh>)}
  <group rotation={[1.2,0,0]}>{[[1.03,1.15,'#a99b7e'],[1.18,1.43,'#c1b38e'],[1.46,1.58,'#8d8b77']].map(([a,b,color])=><mesh key={a}><ringGeometry args={[a,b,96]}/><meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={.8}/></mesh>)}</group>
 </group>;
}

export function BlackHole() {
  const disk = useMemo(() => {
    const geometry = new THREE.RingGeometry(.58, 1.65, 80, 16);
    const positions = geometry.attributes.position;
    const colors = [];
    const color = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i);
      const radius = Math.hypot(x, y), angle = Math.atan2(y, x);
      const heat = Math.exp(-2.5 * (radius - .58));
      const filament = .69 + .26 * Math.cos(radius * 53 + 3 * Math.sin(angle));
      color.setRGB(1, .32 + .49 * heat, .10 + .47 * heat).multiplyScalar(heat * filament);
      colors.push(color.r, color.g, color.b);
    }
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, []);
  return <group rotation={[0, 0, -.22]}>
    <mesh><sphereGeometry args={[.54, 32, 20]}/><meshBasicMaterial color="#030303"/></mesh>
    <mesh><torusGeometry args={[.56, .024, 8, 72]}/><meshBasicMaterial color="#ffd5a6"/></mesh>
    <mesh geometry={disk} rotation={[1.28, 0, 0]}>
      <meshBasicMaterial vertexColors side={THREE.DoubleSide} transparent blending={THREE.AdditiveBlending} depthWrite={false}/>
    </mesh>
  </group>;
}

export function BathDuck() {
  return <group rotation={[.13, -.38, .1]}>
    <mesh scale={[.91, .58, .60]}><sphereGeometry args={[1, 28, 18]}/><meshStandardMaterial color="#e6ae36" roughness={.32}/></mesh>
    <mesh position={[.44, .57, .04]}><sphereGeometry args={[.47, 28, 18]}/><meshStandardMaterial color="#f8c749" roughness={.32}/></mesh>
    <mesh position={[.87, .48, .04]} scale={[.28, .09, .24]}><sphereGeometry args={[1, 18, 12]}/><meshStandardMaterial color="#ed812e"/></mesh>
    {[-.31,.39].map(z => <mesh key={z} position={[.63, .68, z]}><sphereGeometry args={[.062, 12, 8]}/><meshStandardMaterial color="#171b20"/></mesh>)}
    <mesh position={[-.72,.2,0]} rotation={[0,0,.8]} scale={[.34,.16,.27]}><sphereGeometry args={[1, 18, 12]}/><meshStandardMaterial color="#efb735"/></mesh>
  </group>;
}
