import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useSite } from '../context/SiteContext';

export default function SmoothScroll() {
  const { motion, finePointer } = useSite();
  const initialized = useRef(false);

  useEffect(() => {
    if (!motion || !finePointer) return undefined;
    const scroll = new Lenis({
      autoRaf: true,
      lerp: .09,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: .85,
      prevent: node => !!node.closest('[data-lenis-prevent]'),
    });

    // Own anchor navigation so native smooth scrolling cannot compete with Lenis.
    const navigate = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || link.target === '_blank') return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      let target;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      history.pushState(null, '', url.hash);
      scroll.scrollTo(target, { onComplete: () => target.focus({ preventScroll: true }) });
    };
    document.addEventListener('click', navigate);

    let frame = 0;
    if (!initialized.current && location.hash) {
      frame = requestAnimationFrame(() => {
        initialized.current = true;
        let target;
        try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
        if (target) { scroll.resize(); scroll.scrollTo(target, { immediate: true, force: true }); }
      });
    }
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', navigate);
      scroll.destroy();
    };
  }, [motion, finePointer]);
  return null;
}
