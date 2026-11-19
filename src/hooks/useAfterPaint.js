import { useEffect, useState } from 'react';

// Start optional work after the first painted frame. Give the browser an idle
// slot when available, with a deadline so an active visitor still gets the scene.
export default function useAfterPaint(enabled = true) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!enabled || ready) return;
    let frame;
    let idle;
    let timer;
    const start = () => setReady(true);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (typeof window.requestIdleCallback === 'function') {
          idle = window.requestIdleCallback(start, { timeout: 300 });
        } else {
          timer = setTimeout(start, 0);
        }
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      if (idle !== undefined) window.cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, [enabled, ready]);
  return ready;
}
