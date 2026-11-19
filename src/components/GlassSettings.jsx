import { useLayoutEffect, useState } from 'react';

import { hapticsEnabled, setHaptics, supportsHaptics } from '../utils/haptics';

const STORAGE_KEY = 'portfolio-blur';
const DEFAULT_BLUR = 5;
const MAX_BLUR = 28;

function readBlur() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null && Number.isFinite(Number(saved))) {
      return Math.round(Math.max(0, Math.min(MAX_BLUR, Number(saved))));
    }
  } catch {
    // The control still works when storage is unavailable.
  }
  return DEFAULT_BLUR;
}

function applyBlur(blur) {
  document.documentElement.style.setProperty('--glass-blur', `${blur}px`);
  document.documentElement.dataset.glassBlur = blur;
  window.dispatchEvent(new Event('portfolio:glass'));
}

export default function GlassSettings({ open, onToggle, triggerRef }) {
  const available = supportsHaptics();
  const [vibration, setVibration] = useState(hapticsEnabled);
  const [blur, setBlur] = useState(readBlur);
  useLayoutEffect(() => { applyBlur(blur); }, [blur]);

  function changeBlur(event) {
    const value = event.currentTarget.valueAsNumber;
    setBlur(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* optional storage */ }
  }

  return (
    <div className="glass-settings" data-nav-panel="glass">
      <button ref={triggerRef} className="glass-toggle" type="button" onClick={onToggle}
        aria-label="Adjust glass blur" aria-expanded={open} aria-controls="glass-settings-panel">Glass</button>
      <div className="glass-settings-panel" id="glass-settings-panel" hidden={!open} data-scene-pane="18" data-lenis-prevent>
        <label htmlFor="glass-blur">Glass blur <output htmlFor="glass-blur">{blur}px</output></label>
        <input id="glass-blur" aria-label="Glass blur" aria-valuetext={`${blur} pixels`} type="range" min="0" max={MAX_BLUR} step="1" value={blur} onChange={changeBlur} />
        <div className="glass-sample" aria-hidden="true"><span /></div>
        <p>Clearer ↔ Softer</p>
        <label className="haptics-choice">Touch vibration
          <input type="checkbox" disabled={!available} checked={available && vibration}
            aria-describedby={available ? undefined : 'haptics-availability'} onChange={event => {
            setHaptics(event.target.checked);
            setVibration(event.target.checked);
          }}/>
        </label>
        {!available && <p id="haptics-availability">Vibration is unavailable in this browser on this device.</p>}
      </div>
    </div>
  );
}
