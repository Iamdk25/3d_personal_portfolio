import { useEffect, useState } from 'react';

const observers = new Map();

function observe(element, margin, update) {
  let pool = observers.get(margin);
  if (!pool) {
    const subscribers = new Map();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) subscribers.get(entry.target)?.(entry.isIntersecting);
    }, { rootMargin: margin });
    pool = { observer, subscribers };
    observers.set(margin, pool);
  }
  const { observer, subscribers } = pool;
  subscribers.set(element, update);
  observer.observe(element);
  return () => {
    subscribers.delete(element);
    observer.unobserve(element);
    if (!subscribers.size) {
      observer.disconnect();
      observers.delete(margin);
    }
  };
}

export default function useInView(ref, rootMargin = '180px', initial = false) {
  const [inView, setInView] = useState(() => initial || typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    return observe(element, rootMargin, setInView);
  }, [ref, rootMargin]);

  return inView;
}

// Keep loaded scenes near the viewport, with a wider exit margin to avoid
// rebuilding a canvas when the visitor scrolls around a section boundary.
export function useSceneWindow(ref, preload = '480px') {
  const near = useInView(ref, preload);
  const resident = useInView(ref, '1050px');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (near) setMounted(true);
    else if (!resident) setMounted(false);
  }, [near, resident]);
  return mounted;
}
