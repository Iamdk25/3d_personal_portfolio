import { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import decoderUrl from 'three/addons/libs/meshopt_decoder.module.js?url';

// The upstream decoder makes a worker from its own function source. Serving
// that module intact preserves the names its generated worker calls.
const decoder = import(/* @vite-ignore */ decoderUrl).then(({ MeshoptDecoder }) => {
  if (MeshoptDecoder.supported && typeof Worker !== 'undefined') {
    const { useWorkers: startWorkers } = MeshoptDecoder;
    try { startWorkers(1); } catch { /* Fall back to main-thread decoding. */ }
  }
  return MeshoptDecoder;
});
const sharedDecoder = {
  supported: typeof WebAssembly !== 'undefined',
  ready: decoder.then(module => module.ready),
  async decodeGltfBufferAsync(...args) {
    return (await decoder).decodeGltfBufferAsync(...args);
  },
};
function configure(loader) {
  loader.setMeshoptDecoder(sharedDecoder);
}

export default function useSpaceModel(url) {
  const model = useLoader(GLTFLoader, url, configure);
  useEffect(() => () => {
    // Loaded files stay cached for return visits. Release their GPU allocations
    // and renderer callbacks when the canvas that displayed them goes away.
    const resources = new Set();
    model.scene.traverse(node => {
      if (!node.isMesh) return;
      resources.add(node.geometry);
      for (const material of [].concat(node.material)) {
        resources.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      }
    });
    for (const resource of resources) resource.dispose();
  }, [model]);
  return model;
}
