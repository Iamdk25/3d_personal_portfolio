import { useEffect, useRef } from 'react';
import { pulse } from '../utils/haptics';
import { watchTouchDrag } from './touchDrag';

export default function useModelDrag(root, { turn, pick, onActive }) {
  const mouse = useRef(null);
  const callbacks = useRef({ turn, pick, onActive });
  callbacks.current = { turn, pick, onActive };

  function update(held, point) {
    callbacks.current.turn(point.clientX - held.x, point.clientY - held.y, held.target, held.touch);
    held.x = point.clientX;
    held.y = point.clientY;
  }

  useEffect(() => watchTouchDrag(root.current, touch => {
    const target = callbacks.current.pick(touch, true);
    if (!target) return null;
    pulse('grab');
    const held = { x: touch.clientX, y: touch.clientY, target, touch: true };
    callbacks.current.onActive?.(true);
    return {
      move: point => update(held, point),
      end: () => callbacks.current.onActive?.(false),
    };
  }), [root]);

  function finish(event) {
    if (mouse.current?.id !== event.pointerId) return;
    mouse.current = null;
    callbacks.current.onActive?.(false);
  }

  return {
    onPointerDown(event) {
      if (event.pointerType === 'touch' || event.defaultPrevented || !event.isPrimary || event.button !== 0) return;
      const target = callbacks.current.pick(event, false);
      if (!target) return;
      mouse.current = { id: event.pointerId, x: event.clientX, y: event.clientY, target, touch: false };
      callbacks.current.onActive?.(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      if (mouse.current?.id === event.pointerId) update(mouse.current, event);
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onLostPointerCapture: finish,
  };
}
