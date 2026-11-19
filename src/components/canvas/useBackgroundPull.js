import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Box3, MathUtils, Raycaster, Sphere, Vector2, Vector3 } from 'three';
import { claimedBackgroundGestures, spatialHitTests } from './spatialHitTests';
import { watchTouchDrag } from '../../hooks/touchDrag';

import { pulse } from '../../utils/haptics';

const foreground = 'a, button, input, textarea, select, label, summary, dialog, [contenteditable], .glass-panel, .glass-chrome, .text-shield';
const stiffness = 68;
const damping = 8.5;

export function makePullBody(object) {
  object.updateWorldMatrix(true, true);
  const sphere = new Box3().setFromObject(object).getBoundingSphere(new Sphere());
  const center = new Vector3().setFromMatrixPosition(object.matrixWorld);
  const radius = (sphere.radius + center.distanceTo(sphere.center)) / object.scale.x;
  return { object, radius, held: false, x: 0, y: 0, vx: 0, vy: 0, screenX: 0, screenY: 0 };
}

function springHome(body, dt) {
  if (Math.abs(body.x) + Math.abs(body.y) + Math.abs(body.vx) + Math.abs(body.vy) < .002) {
    body.x = body.y = body.vx = body.vy = 0;
    return;
  }
  const steps = Math.max(1, Math.ceil(dt / .01));
  const step = dt / steps;
  for (let i = 0; i < steps; i++) {
    body.vx -= (stiffness * body.x + damping * body.vx) * step;
    body.vy -= (stiffness * body.y + damping * body.vy) * step;
    body.x += body.vx * step;
    body.y += body.vy * step;
  }
}

export default function useBackgroundPull(bodies, enabled) {
  const grab = useRef(null);
  const camera = useThree(state => state.camera);
  const canvas = useThree(state => state.gl.domElement);
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    const objects = bodies.current;
    const ray = new Raycaster();
    const pointer = new Vector2();
    const center = new Vector3();
    const hits = [];
    let hoverFrame = 0;
    let hovering = null;

    function setCursor(mode) {
      if (root.dataset.spacePointer === mode) return;
      if (mode) root.dataset.spacePointer = mode;
      else delete root.dataset.spacePointer;
    }

    function position(event) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      pointer.set(
        2 * (event.clientX - rect.left) / rect.width - 1,
        1 - 2 * (event.clientY - rect.top) / rect.height,
      );
      return rect.height;
    }

    function pick(point, touch = false) {
      if (point.target.closest?.(foreground) || (!touch && point.target.closest?.('.skill-wrap'))) return null;
      const height = position(point);
      if (!height) return null;
      ray.setFromCamera(pointer, camera);
      let closest = Infinity;
      let match = null;
      let nearestTouch = Infinity;
      let touchMatch = null;
      for (const body of objects.values()) {
        center.setFromMatrixPosition(body.object.matrixWorld);
        const radius = body.radius * body.object.scale.x;
        const distance = ray.ray.distanceSqToPoint(center);
        if (touch) {
          const slop = (camera.position.z - center.z) * Math.tan(MathUtils.degToRad(camera.fov / 2)) * 14 / height;
          if (distance < (radius * .72 + slop) ** 2 && distance < nearestTouch) {
            nearestTouch = distance;
            touchMatch = body;
          }
        }
        if (distance > radius ** 2) continue;
        hits.length = 0;
        ray.intersectObject(body.object, true, hits);
        if (hits[0]?.distance < closest) {
          closest = hits[0].distance;
          match = body;
        }
      }
      const stage = !touch && match && point.target.closest?.('.spatial-canvas');
      if (stage && spatialHitTests.get(stage)?.(point.clientX, point.clientY)) return null;
      return match ?? touchMatch;
    }

    function begin(point, touch) {
      if (grab.current) return null;
      cancelAnimationFrame(hoverFrame);
      hoverFrame = 0;
      const body = pick(point, touch);
      if (!body) { setCursor(); return null; }
      const pull = {
        body, id: point.pointerId, target: point.target,
        startX: pointer.x, startY: pointer.y, x: pointer.x, y: pointer.y,
        homeX: body.screenX, homeY: body.screenY,
      };
      grab.current = pull;
      setCursor('held');
      return pull;
    }

    function down(event) {
      if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0 || !begin(event, false)) return;
      claimedBackgroundGestures.add(event);
      event.preventDefault();
      event.target.setPointerCapture?.(event.pointerId);
    }

    function reposition(point, pull) {
      if (!position(point)) return;
      pull.x = pointer.x;
      pull.y = pointer.y;
    }

    function move(event) {
      if (event.pointerType === 'touch') return;
      const pull = grab.current;
      if (pull?.id === event.pointerId) {
        reposition(event, pull);
        return;
      }
      if (!event.isPrimary || grab.current) return;
      hovering = event;
      if (!hoverFrame) hoverFrame = requestAnimationFrame(() => {
        hoverFrame = 0;
        setCursor(pick(hovering) ? 'pull' : undefined);
      });
    }

    function release(event) {
      const pull = grab.current;
      if (event?.pointerId != null && pull?.id !== event.pointerId) return;
      grab.current = null;
      if (pull?.id !== undefined && pull.target.hasPointerCapture?.(pull.id)) pull.target.releasePointerCapture(pull.id);
      setCursor();
    }

    const hoverLeave = () => {
      cancelAnimationFrame(hoverFrame);
      hoverFrame = 0;
      if (!grab.current) setCursor();
    };
    const removeTouch = watchTouchDrag(window, touch => {
      const pull = begin(touch, true);
      if (!pull) return null;
      pulse('grab');
      return {
        move: point => reposition(point, pull),
        end(completed) {
          if (completed && Math.hypot(pull.x - pull.startX, pull.y - pull.startY) > .04) pulse('spring');
          release();
        },
      };
    });
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move, { capture: true, passive: true });
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('lostpointercapture', release, true);
    window.addEventListener('blur', release);
    window.addEventListener('scroll', hoverLeave, { passive: true });
    root.addEventListener('pointerleave', hoverLeave);
    return () => {
      removeTouch();
      hoverLeave();
      release();
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
      window.removeEventListener('lostpointercapture', release, true);
      window.removeEventListener('blur', release);
      window.removeEventListener('scroll', hoverLeave);
      root.removeEventListener('pointerleave', hoverLeave);
      for (const body of objects.values()) body.x = body.y = body.vx = body.vy = 0;
      invalidate();
    };
  }, [bodies, camera, canvas, enabled, invalidate]);

  return function update(body, x, y, dt) {
    const pull = grab.current;
    body.held = pull?.body === body;
    if (body.held) {
      const desiredX = pull.homeX + pull.x - pull.startX;
      const desiredY = pull.homeY + pull.y - pull.startY;
      const dx = MathUtils.clamp(MathUtils.clamp(desiredX, -.98, .98) - x, -.72, .72);
      const dy = MathUtils.clamp(MathUtils.clamp(desiredY, -.98, .98) - y, -.70, .70);
      const prevX = body.x;
      const prevY = body.y;
      body.x = MathUtils.damp(prevX, dx, 42, dt);
      body.y = MathUtils.damp(prevY, dy, 42, dt);
      if (dt > 0) {
        body.vx = MathUtils.clamp((body.x - prevX) / dt, -2.2, 2.2);
        body.vy = MathUtils.clamp((body.y - prevY) / dt, -2.2, 2.2);
      }
    } else {
      springHome(body, dt);
    }
    body.screenX = x + body.x;
    body.screenY = y + body.y;
  };
}
