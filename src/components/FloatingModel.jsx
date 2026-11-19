import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSite } from '../context/SiteContext';
import useInView, { useSceneWindow } from '../hooks/useInView';
import useModelDrag from '../hooks/useModelDrag';
import useScrollProgress from '../hooks/useScrollProgress';
import { claimedBackgroundGestures, spatialHitTests } from './canvas/spatialHitTests';
import Boundary from './Boundary';

const Scene = lazy(() => import('./canvas/Gallery'));
const keyboardSteps = { ArrowLeft: [0, -.3], ArrowRight: [0, .3], ArrowUp: [-.15, 0], ArrowDown: [.15, 0] };
const displayNames = { planet: 'Earth', ufo: 'UFO', saturn: 'Saturn' };
const clampPitch = value => Math.max(-1.2, Math.min(1.2, value));

export default function FloatingModel({ object, className = '', interactive = false }) {
  const root = useRef(null);
  const stage = useRef(null);
  const rotation = useRef({ x: object === 'workstation' ? .12 : 0, y: object === 'workstation' ? -.76 : 0 });
  const dragging = useRef(false);
  const spin = useRef(0);
  const invalidate = useRef(() => {});
  const progress = useRef(.5);
  const { animate, hidden, wide } = useSite();
  const inView = useInView(root, '24px');
  useLayoutEffect(() => {
    if (object === 'astronaut' && !inView) {
      rotation.current.x = 0;
      rotation.current.y = 0;
    }
  }, [inView, object]);
  useScrollProgress(root, 1, 0, animate && inView, useCallback(value => { progress.current = value; }, []));
  const mounted = useSceneWindow(root, object === 'workstation' ? '185px' : '480px');
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!mounted) setReady(false); }, [mounted]);
  const show = useCallback(() => setReady(true), []);
  const name = displayNames[object] ?? object;
  const visibleModel = mounted && ready;
  const drag = useModelDrag(stage, {
    turn(dx, dy, _target, touch) {
      rotation.current.y += dx * (touch ? .014 : .009);
      rotation.current.x = clampPitch(rotation.current.x + dy * (touch ? .011 : .007));
      invalidate.current();
    },
    pick(point, touch) {
      if (!interactive || !visibleModel || claimedBackgroundGestures.has(point.nativeEvent)) return null;
      return spatialHitTests.get(stage.current)?.(point.clientX, point.clientY, touch ? 10 : 0) ? stage.current : null;
    },
    onActive(value) {
      dragging.current = value;
      invalidate.current();
    },
  });

  return (
    <div ref={root} className={`spatial-object ${className} ${visibleModel ? 'is-ready' : 'is-loading'}`}>
      <div
        ref={stage}
        className="spatial-canvas"
        aria-hidden={!interactive || undefined}
        aria-label={interactive ? `${name} 3D object. Drag it in any direction or use the arrow keys to turn it.` : undefined}
        aria-keyshortcuts={interactive ? 'ArrowLeft ArrowRight ArrowUp ArrowDown' : undefined}
        role={interactive ? 'group' : undefined}
        tabIndex={interactive ? 0 : undefined}
        data-drag={interactive && visibleModel ? 'true' : undefined}
        onKeyDown={event => {
          const step = keyboardSteps[event.key];
          if (!interactive || !step) return;
          event.preventDefault();
          rotation.current.x = clampPitch(rotation.current.x + step[0]);
          rotation.current.y += step[1];
          invalidate.current();
        }}
        {...drag}
      >
        {mounted && (
          <Boundary fallback={<p className="spatial-loading">The 3D view is unavailable.</p>}>
            <Suspense fallback={<div className="spatial-loading" role="status"><span className="model-orbit-placeholder" /><span>Preparing {name}…</span></div>}>
              <div className="scene-reveal">
                <Scene stageRef={stage} progressRef={progress} cinematic={wide} object={object} animate={animate && inView} active={!hidden && inView}
                  rotationRef={rotation} draggingRef={dragging} spinRef={spin} invalidateRef={invalidate} onReady={show} />
              </div>
              {!ready && <div className="spatial-loading" role="status"><span className="model-orbit-placeholder" /><span>Preparing {name}…</span></div>}
            </Suspense>
          </Boundary>
        )}
      </div>
    </div>
  );
}
