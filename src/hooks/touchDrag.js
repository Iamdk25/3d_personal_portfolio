// Reserve the gesture on touchstart, before Safari can commit it to page scroll.
// Only actual hits call preventDefault. Empty space keeps the browser's scrolling.
export function watchTouchDrag(element, begin) {
  if (!element) return;
  let active = null;

  function finish(event) {
    if (!active) return;
    const gesture = active;
    active = null;
    window.removeEventListener('touchmove', move);
    window.removeEventListener('touchend', end);
    window.removeEventListener('touchcancel', end);
    window.removeEventListener('touchstart', interrupt);
    window.removeEventListener('blur', finish);
    gesture.end?.(event?.type === 'touchend');
  }

  function interrupt(event) {
    if (event.touches.length > 1) finish();
  }

  function changed(event) {
    return Array.from(event.changedTouches).find(touch => touch.identifier === active?.identifier);
  }

  function move(event) {
    if (event.touches.length > 1) {
      finish();
      return;
    }
    const touch = changed(event);
    if (!touch) return;
    if (event.cancelable) event.preventDefault();
    active.move(touch);
  }

  function end(event) {
    if (changed(event)) finish(event);
  }

  function start(event) {
    if (active || event.defaultPrevented || !event.cancelable || event.touches.length !== 1) return;
    const touch = event.changedTouches[0];
    const gesture = begin(touch);
    if (!gesture) return;
    event.preventDefault();
    active = { ...gesture, identifier: touch.identifier };
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end, { passive: true });
    window.addEventListener('touchcancel', end, { passive: true });
    window.addEventListener('touchstart', interrupt, { passive: true });
    window.addEventListener('blur', finish);
  }

  element.addEventListener('touchstart', start, { passive: false });
  return () => {
    element.removeEventListener('touchstart', start);
    finish();
  };
}
