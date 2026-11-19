import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { skillGroups } from '../constants/content';
import { technologies } from '../constants/tech';
import { useSite } from '../context/SiteContext';
import useInView, { useSceneWindow } from '../hooks/useInView';
import useModelDrag from '../hooks/useModelDrag';
import Boundary from './Boundary';

const SkillSpheres = lazy(() => import('./canvas/SkillSpheres'));

function clamp(value) {
  return Math.max(-0.9, Math.min(0.9, value));
}

export default function Tech() {
  const wrapRef = useRef(null);
  const slotsRef = useRef([]);
  const rotationsRef = useRef(technologies.map(() => ({ x: 0, y: 0 })));
  const invalidateRef = useRef(() => {});
  const { animate, hidden } = useSite();
  const inView = useInView(wrapRef, '60px');
  const mounted = useSceneWindow(wrapRef);
  const [ready, setReady] = useState(false);
  useEffect(() => { if (!mounted) setReady(false); }, [mounted]);

  const resetSpheres = () => { rotationsRef.current.forEach(rotation => { rotation.x = 0; rotation.y = 0; }); invalidateRef.current(); };
  const drag = useModelDrag(wrapRef, {
    turn(dx, dy, sphere, touch) {
      const rotation = rotationsRef.current[Number(sphere.dataset.sphere)];
      const sensitivity = touch ? .025 : .02;
      rotation.y += dx * sensitivity;
      rotation.x = clamp(rotation.x + dy * sensitivity);
      invalidateRef.current();
    },
    pick(point, touch) {
      const sphere = point.target.closest?.('[data-sphere]');
      if (!mounted || !ready || !sphere) return null;
      if (!touch) return sphere;
      const slot = slotsRef.current[Number(sphere.dataset.sphere)];
      if (!slot) return null;
      const rect = slot.getBoundingClientRect();
      const radius = Math.min(rect.width, rect.height) * .33 + 10;
      const distance = Math.hypot(point.clientX - rect.left - rect.width / 2, point.clientY - rect.top - rect.height / 2);
      return distance <= radius ? sphere : null;
    },
  });

  const onKeyDown = (event, index) => {
    const rotation = rotationsRef.current[index];
    const step = event.shiftKey ? 0.45 : 0.22;
    if (event.key === 'ArrowLeft') rotation.y -= step;
    else if (event.key === 'ArrowRight') rotation.y += step;
    else if (event.key === 'ArrowUp') rotation.x = clamp(rotation.x - step);
    else if (event.key === 'ArrowDown') rotation.x = clamp(rotation.x + step);
    else return;
    event.preventDefault();
    invalidateRef.current();
  };

  return (
    <section className="section" id="skills" tabIndex={-1}>
      <div className="skills-heading text-shield">
        <p className="eyebrow">Tools</p>
        <h2>Skills <span className="serif">& tools.</span></h2>
      </div>

      <button type="button" className="text-btn sphere-reset text-shield" onClick={resetSpheres}>Face forward ↺</button>
      <div className="skill-wrap" ref={wrapRef} data-model-ready={mounted && ready}>
        <ul className="skill-grid" aria-label="Interactive skill spheres">
          {technologies.map((item, index) => (
            <li key={item.name}>
              <div
                className="skill-hit"
                tabIndex={0}
                role="group"
                aria-label={`${item.name} sphere`}
                aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"
                data-sphere={index}
                data-drag={mounted && ready ? 'true' : undefined}
                {...drag}
                onKeyDown={(event) => onKeyDown(event, index)}
              >
                <div
                  className="skill-slot"
                  ref={(node) => {
                    slotsRef.current[index] = node;
                  }}
                  aria-hidden="true"
                >
                  <span className="skill-placeholder"><img src={item.icon} alt="" decoding="async" loading="lazy" /></span>
                </div>
                <span className="skill-name text-shield">{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
        {mounted && (
          <div className="skill-render" aria-hidden="true">
            <Boundary fallback={null}>
              <Suspense fallback={null}>
                <SkillSpheres
                  slotsRef={slotsRef}
                  rotationsRef={rotationsRef}
                  animate={animate && ready && inView}
                  active={!hidden && inView}
                  invalidateRef={invalidateRef}
                  onReady={setReady}
                />
              </Suspense>
            </Boundary>
          </div>
        )}
      </div>
      <div className="skill-groups">
        {skillGroups.map((group) => (
          <section className="text-shield" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
