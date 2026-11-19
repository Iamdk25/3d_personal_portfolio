import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';
import useInView, { useSceneWindow } from '../hooks/useInView';
import useScrollProgress from '../hooks/useScrollProgress';
import { pulse } from '../utils/haptics';
import { watchTouchDrag } from '../hooks/touchDrag';
import Boundary from './Boundary';
import FloatingModel from './FloatingModel';
import ResumePreview from './ResumePreview';
import LinkIcon from './LinkIcon';

const LiquidBlob = lazy(() => import('./canvas/LiquidBlob'));

function HeroBlob() {
  const root = useRef(null);
  const hit = useRef(null);
  const invalidate = useRef(() => {});
  const interaction = useRef({ x: 0, y: 0, count: 0, inside: false, pressed: false });
  const active = useInView(root, '24px');
  const mounted = useSceneWindow(root);
  const { animate, hidden } = useSite();
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!mounted) setReady(false); }, [mounted]);
  const show = useCallback(() => setReady(true), []);

  const pointAt = useCallback((event, held = false) => {
    const rect = hit.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return;
    const input = interaction.current;
    input.x = Math.max(-1.2, Math.min(1.2, (event.clientX - rect.left) / rect.width * 2 - 1));
    input.y = Math.max(-1.2, Math.min(1.2, 1 - (event.clientY - rect.top) / rect.height * 2));
    input.inside = held || (event.clientX >= rect.left && event.clientX <= rect.right &&
      event.clientY >= rect.top && event.clientY <= rect.bottom);
    invalidate.current();
  }, []);

  useEffect(() => watchTouchDrag(root.current, touch => {
    if (!ready || touch.target !== hit.current) return null;
    pulse('ripple');
    interaction.current.pressed = true;
    interaction.current.count += 1;
    pointAt(touch, true);
    return {
      move: point => pointAt(point, true),
      end() {
        interaction.current.pressed = false;
        interaction.current.inside = false;
        invalidate.current();
      },
    };
  }), [pointAt, ready]);

  function release(event) {
    interaction.current.pressed = false;
    if (event.pointerType === 'touch' || event.type === 'pointercancel') interaction.current.inside = false;
    invalidate.current();
  }

  return (
    <div className="hero-blob" ref={root} data-ready={mounted && ready}>
      <div className="hero-blob-fallback" aria-hidden="true" />
      {mounted && <Boundary fallback={null}>
        <Suspense fallback={null}>
          <div className="hero-blob-scene">
            <LiquidBlob animate={animate && active} active={!hidden && active} interaction={interaction} invalidate={invalidate} onReady={show} />
          </div>
          <button
            className="hero-blob-hit"
            ref={hit}
            type="button"
            aria-label="Make a ripple in the liquid glass sculpture"
            onPointerEnter={event => { if (event.pointerType !== 'touch') pointAt(event); }}
            onPointerMove={event => { if (event.pointerType !== 'touch') pointAt(event, interaction.current.pressed); }}
            onPointerLeave={event => {
              if (event.pointerType === 'touch') return;
              interaction.current.inside = false;
              invalidate.current();
            }}
            onPointerDown={event => {
              if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
              interaction.current.pressed = true;
              if (event.pointerType === 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
              pointAt(event);
            }}
            onPointerUp={event => { if (event.pointerType !== 'touch') release(event); }}
            onPointerCancel={event => { if (event.pointerType !== 'touch') release(event); }}
            onLostPointerCapture={event => { if (event.pointerType !== 'touch') release(event); }}
            onBlur={() => { interaction.current.pressed = false; }}
            onClick={event => {
              if (event.detail) {
                pointAt(event);
                if (event.pointerType === 'touch' || event.nativeEvent.pointerType === 'touch') interaction.current.inside = false;
              } else {
                interaction.current.x = 0;
                interaction.current.y = 0;
              }
              interaction.current.count += 1;
              invalidate.current();
            }}
          />
        </Suspense>
      </Boundary>}
    </div>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const workstation = useRef(null);
  const { animate, wide } = useSite();
  const active = useInView(ref, '24px');
  const framing = animate && wide;
  const frameWorkstation = useCallback(progress => {
    workstation.current.style.transform = `translate3d(0, ${-45 * progress}px, 0) scale(${1 - .09 * progress})`;
  }, []);
  useScrollProgress(ref, 0, 0, framing && active, frameWorkstation);
  useLayoutEffect(() => {
    if (!framing) workstation.current.style.removeProperty('transform');
  }, [framing]);

  return (
    <section className="live-hero" id="top" ref={ref} tabIndex={-1}>
      <div className="hero-main">
        <div className="live-hero-copy text-shield">
          <div className="intro-rule" aria-hidden="true" />
          <div>
            <p className="eyebrow">Software engineer · Tampa, FL</p>
            <h1>Hi, I’m <span>Divyarajsinh.</span></h1>
            <p className="hero-summary">I use full-stack engineering, AI/ML, and data analytics to solve everyday problems.</p>
            <p className="hero-status">CS at USF · AI/ML Research Assistant · Previously at AbbVie</p>
            <div className="hero-links">
              <a className="primary-action icon-link" href="#projects"><LinkIcon name="work" />View my work</a>
              <ResumePreview />
              <a className="icon-link" href="https://github.com/Iamdk25" target="_blank" rel="noreferrer"><LinkIcon name="github" />GitHub</a>
            </div>
          </div>
        </div>
        <HeroBlob/>
      </div>
      <div className="hero-workstation-wrap" ref={workstation}>
        <FloatingModel object="workstation" className="hero-workstation" interactive/>
      </div>
      <a className="hero-scroll text-shield" href="#about"><span aria-hidden="true">↓</span>Scroll to About</a>
    </section>
  );
}
