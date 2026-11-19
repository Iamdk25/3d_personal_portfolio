import { Suspense, useLayoutEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { CubeUVReflectionMapping } from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { publicUrl } from '../../utils/publicUrl';
import Boundary from '../Boundary';

// Prefiltered from Three's RoomEnvironment. Each canvas uploads the same atlas
// without building a second scene, depth buffer and temporary reflection targets.
function StudioLight({ intensity }) {
  const atlas = useLoader(RGBELoader, publicUrl('models/studio-light.hdr'));
  const { scene, invalidate } = useThree();
  useLayoutEffect(() => {
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    const map = atlas.clone();
    map.mapping = CubeUVReflectionMapping;
    scene.environment = map;
    scene.environmentIntensity = intensity;
    invalidate();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = previousIntensity;
      map.dispose();
    };
  }, [scene, atlas, intensity, invalidate]);
  return null;
}

export default function StudioEnvironment({ intensity = 1 }) {
  return <Boundary fallback={null}><Suspense fallback={null}><StudioLight intensity={intensity}/></Suspense></Boundary>;
}
