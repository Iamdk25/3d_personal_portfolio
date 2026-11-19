import { useEffect, useRef } from 'react';
import { useSite } from '../context/SiteContext';

import { spatialHitTests } from './canvas/spatialHitTests';

const plume = [4, 3.4, 2.8, 2.3, 1.8, 1.4];
const controls = 'a,button,summary,input,textarea,select,[data-drag="true"]';
const nativePointer = 'dialog[open],textarea,input:not([type="range"]):not([type="button"]),[contenteditable="true"]';

export default function CursorHalo() {
  const { finePointer, animate } = useSite();
  const halo = useRef(null);
  const pin = useRef(null);
  const trails = useRef([]);

  useEffect(() => {
    if (!finePointer || !animate) return;
    const root = document.documentElement;
    const ring = halo.current;
    const tail = trails.current;
    const points = plume.map(() => ({ x: 0, y: 0 }));
    let ringX = 0, ringY = 0, lastFrame = 0;
    let heldCue = '', refreshCue = false;
    let previousCue = '';
    let frame = 0;
    let visible = false;
    let target = null;
    let x = 0, y = 0, aimX = 0, aimY = 0;

    function place(node, px, py) {
      node.style.transform = `translate3d(${px}px,${py}px,0)`;
    }
    function cueAt() {
      if (!target) return '';
      if (root.dataset.spacePointer === 'held') return 'Release';
      if (heldCue) return heldCue;
      if (root.dataset.spacePointer === 'pull') return 'Pull';
      if (target.closest?.('.hero-blob[data-ready=true] .hero-blob-hit')) return 'Ripple';
      const control = target.closest?.(controls);
      if (!control || control.matches(':disabled')) return '';
      if (control.matches('input[type=range]')) return 'Slide';
      if (control.dataset.drag === 'true') {
        const hit = spatialHitTests.get(control);
        return (!hit || hit(x, y)) ? 'Drag' : '';
      }
      return 'Click';
    }
    function mode() {
      const cue = cueAt();
      if (cue !== previousCue) {
        ring.dataset.cue = previousCue = cue;
        ring.dataset.active = String(Boolean(cue));
      }
    }
    function draw(now) {
      frame = 0;
      const dt = lastFrame ? Math.min(48, now - lastFrame) : 16;
      lastFrame = now;
      const follow = 1 - Math.exp(-dt / 27);
      ringX += (aimX - ringX) * follow;
      ringY += (aimY - ringY) * follow;
      const gap = Math.hypot(ringX - x, ringY - y);
      if (gap > 7) {
        ringX = x + (ringX - x) * 7 / gap;
        ringY = y + (ringY - y) * 7 / gap;
      }
      place(ring, ringX, ringY);
      if (refreshCue) { refreshCue = false; mode(); }
      let leadX = x, leadY = y;
      let moving = Math.hypot(ringX - aimX, ringY - aimY) > .12;
      const drift = 1 - Math.exp(-dt / 32);
      points.forEach((point, index) => {
        point.x += (leadX - point.x) * drift;
        point.y += (leadY - point.y) * drift;
        const dx = leadX - point.x, dy = leadY - point.y;
        const distance = Math.hypot(dx, dy);
        const opacity = Math.min(distance / 4, 1) * (.76 - index * .09);
        const length = Math.min(distance, 24 - index * 2);
        const node = tail[index];
        node.style.transform = `translate3d(${leadX}px,${leadY}px,0) rotate(${Math.atan2(-dy, -dx)}rad) scaleX(${Math.max(1, length / plume[index])})`;
        node.style.opacity = opacity < .025 ? '0' : String(opacity);
        moving ||= distance > .12;
        leadX = point.x;
        leadY = point.y;
      });
      if (moving) frame = requestAnimationFrame(draw);
      else lastFrame = 0;
    }
    function scheduleMode() {
      if (!visible) return;
      refreshCue = true;
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function release() {
      heldCue = '';
      ring.style.setProperty('--press', '0');
      scheduleMode();
    }
    function hide() {
      visible = false;
      target = null;
      delete root.dataset.orbitCursor;
      cancelAnimationFrame(frame);
      frame = lastFrame = 0;
      release();
      ring.style.opacity = '0';
      tail.forEach(node => { node.style.opacity = '0'; });
      pin.current.style.opacity = '0';
    }
    function move(event) {
      if (event.pointerType === 'touch' || event.target.closest?.(nativePointer) || document.querySelector('dialog[open]')) {
        if (visible) hide();
        return;
      }
      target = event.target;
      x = aimX = event.clientX;
      y = aimY = event.clientY;
      const active = target.closest?.(controls);
      if (active) {
        const rect = active.getBoundingClientRect();
        if (rect.width < 220 && rect.height < 80) {
          aimX += Math.max(-4, Math.min(4, (rect.left + rect.width / 2 - x) * .10));
          aimY += Math.max(-4, Math.min(4, (rect.top + rect.height / 2 - y) * .10));
        }
      }
      refreshCue = true;
      if (event.type === 'pointerdown') {
        const action = cueAt();
        if (action === 'Drag' || action === 'Ripple') heldCue = action;
      }
      ring.dataset.labelSide = x > window.innerWidth - 92 ? 'left' : 'right';
      ring.style.setProperty('--press', String(event.buttons & 1 ? Math.max(.35, event.pressure || .5) : 0));
      place(pin.current, x, y);
      if (!visible) {
        points.forEach(point => { point.x = x; point.y = y; });
        ringX = x; ringY = y;
        place(ring, x, y);
        visible = true;
        root.dataset.orbitCursor = 'on';
        pin.current.style.opacity = ring.style.opacity = '1';
      }
      if (!frame) frame = requestAnimationFrame(draw);
    }

    const observer = new MutationObserver(scheduleMode);
    observer.observe(root, { attributes: true, attributeFilter: ['data-space-pointer'] });
    const scrolled = () => {
      if (!visible || heldCue) return;
      target = document.elementFromPoint(x, y);
      if (target?.closest(nativePointer)) { hide(); return; }
      aimX = x; aimY = y;
      scheduleMode();
    };
    const focus = event => { if (visible && event.target.closest?.(nativePointer)) hide(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', move, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', hide, true);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', scrolled, { passive: true });
    document.addEventListener('focusin', focus);
    root.addEventListener('pointerleave', hide);
    return () => {
      cancelAnimationFrame(frame);
      delete root.dataset.orbitCursor;
      observer.disconnect();
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', move, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', hide, true);
      window.removeEventListener('blur', hide);
      window.removeEventListener('scroll', scrolled);
      document.removeEventListener('focusin', focus);
      root.removeEventListener('pointerleave', hide);
    };
  }, [finePointer, animate]);

  if (!finePointer || !animate) return null;
  return <>
    <span ref={pin} className="cursor-pin" aria-hidden="true"/>
    <div ref={halo} className="cursor-halo" aria-hidden="true"><i className="cursor-lens"><i className="cursor-bezel"/></i></div>
    {plume.map((size, index) => <i key={index} style={{ width: size, height: size, marginTop: -size / 2 }} ref={node => { trails.current[index] = node; }} className="cursor-trail" aria-hidden="true"/>)}
  </>;
}
