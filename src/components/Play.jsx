import { flushSync } from 'react-dom';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Boundary from './Boundary';
import Glass from './Glass';
import { galleryObjects } from '../constants/content';
import { useSite } from '../context/SiteContext';
import useInView from '../hooks/useInView';

const GalleryCanvas = lazy(() => import('./canvas/Gallery'));

function useNarrow() {
  const query = '(max-width: 800px)';
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return matches;
}

function Preview({ object, onExplore }) {
  const current = galleryObjects.find((item) => item.id === object);
  return (
    <div className="preview-card">
      <p className="eyebrow">Preview</p>
      <h3>{current.label}</h3>

      {current.size && <p className="meta">{current.size} download</p>}
      <button type="button" className="btn-solid" onClick={onExplore}>
        Explore in 3D
      </button>
    </div>
  );
}

function clampTilt(value) {
  return Math.max(-0.65, Math.min(0.65, value));
}

export default function Play({ compact = false }) {
  const stageRef = useRef(null);
  const sectionRef = useRef(null);
  const rotationRef = useRef({ x: 0, y: 0 });
  const spinRef = useRef(0);
  const dragRef = useRef(null);
  const invalidateRef = useRef(() => {});
  const { animate, finePointer } = useSite();
  const inView = useInView(sectionRef, '480px');
  const narrow = useNarrow();
  const [object, setObject] = useState(narrow ? 'orbit' : 'workstation');
  const [spread, setSpread] = useState(0);
  const [engaged, setEngaged] = useState(false);
  const [unlocked, setUnlocked] = useState({});
  const [status, setStatus] = useState('ready');

  const current = galleryObjects.find((item) => item.id === object);
  const gated = narrow && object !== 'orbit' && !unlocked[object];

  const onLoading = useCallback((active) => {
    setStatus(active ? 'loading' : 'ready');
  }, []);

  useEffect(() => {
    rotationRef.current = { x: object === "workstation" ? .12 : 0, y: object === "workstation" ? -1.2 : 0 };
    spinRef.current = 0;
    setEngaged(false);
    setStatus(object === 'orbit' ? 'ready' : 'loading');
  }, [object]);

  const selectObject = (id, shouldFocus = false) => {
    if (animate && document.startViewTransition) document.startViewTransition(() => flushSync(() => setObject(id)));
    else setObject(id);
    if (shouldFocus) {
      requestAnimationFrame(() => document.getElementById(`object-${id}`)?.focus());
    }
  };

  const rotateBy = (x, y) => {
    rotationRef.current.x = clampTilt(rotationRef.current.x + x);
    rotationRef.current.y += y;
    invalidateRef.current();
  };

  const reset = () => {
    rotationRef.current = { x: object === "workstation" ? .12 : 0, y: object === "workstation" ? -1.2 : 0 };
    spinRef.current = 0;
    invalidateRef.current();
  };

  const onStageKey = (event) => {
    if (gated) return;
    if (event.key === 'ArrowLeft') rotateBy(0, -0.35);
    else if (event.key === 'ArrowRight') rotateBy(0, 0.35);
    else if (event.key === 'ArrowUp') rotateBy(-0.2, 0);
    else if (event.key === 'ArrowDown') rotateBy(0.2, 0);
    else return;
    event.preventDefault();
  };

  const onPointerDown = (event) => {
    if (gated) return;
    if (!finePointer && !engaged) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    rotateBy(dy * 0.008, dx * 0.01);
    dragRef.current = { x: event.clientX, y: event.clientY };
  };

  const help = finePointer
    ? 'Drag to rotate. Buttons and arrow keys work too.'
    : engaged
      ? 'Drag to turn the model. Done returns to scrolling.'
      : 'Swipe to scroll the page. Rotate turns the model.';

  return (
    <section className={compact ? "hero-model" : "section"} id="play" tabIndex={-1} ref={sectionRef}>
      {!compact && <><p className="eyebrow">Explore</p><h2>In orbit.</h2></>}
      <p className={compact ? "model-hint" : "section-intro"} id="play-help">{help}</p>
      <div className="stage-shell">
        <div
          ref={stageRef}
          className="stage"
          tabIndex={gated ? undefined : 0}
          role={gated ? undefined : 'application'}
          aria-label={gated ? undefined : `${current.label} viewer`}
          aria-describedby="play-help"
          aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
          data-drag={!gated ? 'true' : undefined}
          data-engaged={engaged ? 'true' : 'false'}
          onKeyDown={onStageKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; }}
        >
          {gated ? (
            <Preview object={object} onExplore={() => setUnlocked((currentUnlocked) => ({ ...currentUnlocked, [object]: true }))} />
          ) : inView ? (
            <Boundary
              resetKey={object}
              fallback={<p className="stage-message" role="alert">This model could not be loaded. The other objects still work.</p>}
            >
              <Suspense fallback={<p className="stage-status">Loading viewer</p>}>
                <GalleryCanvas
                  object={object}
                  spread={spread}
                  animate={animate}
                  active
                  rotationRef={rotationRef}
                  spinRef={spinRef}
                  invalidateRef={invalidateRef}
                  onLoading={onLoading}
                />
              </Suspense>
              {object !== 'orbit' && status === 'loading' && (
                <p className="stage-status">Loading {current.label}</p>
              )}
            </Boundary>
          ) : null}
        </div>
        <Glass className="control-bar" radius={24} block>
          <div className="segments" role="radiogroup" aria-label="Object">
            {galleryObjects.map((item, index) => (
              <button
                key={item.id}
                id={`object-${item.id}`}
                type="button"
                role="radio"
                aria-checked={object === item.id}
                tabIndex={object === item.id ? 0 : -1}
                onClick={() => selectObject(item.id)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                  event.preventDefault();
                  const direction = event.key === 'ArrowRight' ? 1 : -1;
                  const next = galleryObjects[(index + direction + galleryObjects.length) % galleryObjects.length];
                  selectObject(next.id, true);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="control-actions">
            {!finePointer && !gated && (
              <button
                type="button"
                className="text-btn"
                aria-pressed={engaged}
                onClick={() => setEngaged((value) => !value)}
              >
                {engaged ? 'Done' : 'Rotate'}
              </button>
            )}
            <button type="button" className="text-btn" onClick={() => rotateBy(0, -0.4)} disabled={gated}>
              Left
            </button>
            <button type="button" className="text-btn" onClick={() => rotateBy(0, 0.4)} disabled={gated}>
              Right
            </button>
            <button type="button" className="text-btn" onClick={reset} disabled={gated}>
              Reset
            </button>
            {object === 'orbit' && (
              <button
                type="button"
                className="text-btn"
                aria-pressed={spread > 0}
                onClick={() => setSpread((value) => (value > 0 ? 0 : 1))}
              >
                {spread > 0 ? 'Gather' : 'Separate'}
              </button>
            )}
          </div>
        </Glass>
        {!compact && <p className="object-detail" aria-live="polite">{current.detail}</p>}
      </div>
    </section>
  );
}
