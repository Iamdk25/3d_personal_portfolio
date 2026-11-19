import { useLayoutEffect } from 'react';

const tracks = new Set();
let frame = 0;
let resizeObserver;

function measure() {
  frame = 0;
  const height = window.innerHeight;
  for (const track of tracks) {
    const rect = track.element.getBoundingClientRect();
    const travel = (track.start - track.end) * height + rect.height;
    track.progress = Math.max(0, Math.min(1, (track.start * height - rect.top) / (travel || 1)));
  }
  for (const track of tracks) {
    if (track.progress === track.previous) continue;
    track.previous = track.progress;
    track.update(track.progress);
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}

export default function useScrollProgress(ref, start, end, enabled, update) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    const track = { element, start, end, update };
    if (!tracks.size) {
      window.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule, { passive: true });
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(document.body);
      }
    }
    tracks.add(track);
    schedule();
    return () => {
      tracks.delete(track);
      if (tracks.size) return;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      resizeObserver?.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
    };
  }, [ref, start, end, enabled, update]);
}
