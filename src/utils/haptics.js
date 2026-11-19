const key = 'portfolio-touch-feedback';
const patterns = {
  select: 10,
  grab: 18,
  ripple: [9, 30, 9],
  spring: [22, 32, 12, 33, 7],
};
let enabled = false;
try { enabled = localStorage.getItem(key) === 'on'; } catch { /* Private browsing can disable storage. */ }

export function supportsHaptics() {
  return navigator.maxTouchPoints > 0 && typeof navigator.vibrate === 'function';
}

export function hapticsEnabled() { return enabled; }

function vibrate(pattern) {
  if (!supportsHaptics()) return;
  try { navigator.vibrate(pattern); } catch { /* A restricted frame may deny vibration. */ }
}

export function pulse(action) {
  if (enabled && !document.hidden) vibrate(patterns[action]);
}

export function setHaptics(value) {
  enabled = value;
  try { localStorage.setItem(key, value ? 'on' : 'off'); } catch { /* Keep the in-memory choice. */ }
  if (value) pulse('select');
  else vibrate(0);
}
