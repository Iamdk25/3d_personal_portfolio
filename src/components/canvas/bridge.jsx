import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';

export default function InvalidateBridge({ api, signature = '' }) {
  const { gl, invalidate } = useThree();
  const release = useRef(0);
  useEffect(() => {
    clearTimeout(release.current);
    // Fiber loses the old context. Also detach Three's DOM listeners and caches.
    // Defer one task so a development Strict Mode effect replay can cancel it.
    return () => { release.current = setTimeout(() => gl.dispose(), 0); };
  }, [gl]);

  useEffect(() => {
    if (api) api.current = invalidate;
    invalidate();
    return () => {
      if (api) api.current = () => {};
    };
  }, [api, invalidate]);

  useEffect(() => {
    invalidate();
  }, [signature, invalidate]);

  return null;
}
