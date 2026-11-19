import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function FirstFrame({ onReady }) {
  const frame = useRef(0);
  useLayoutEffect(() => () => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);
  useFrame(() => {
    if (!frame.current) frame.current = requestAnimationFrame(onReady);
  });
  return null;
}
