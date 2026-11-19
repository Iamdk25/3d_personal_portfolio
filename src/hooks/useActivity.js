import { useEffect, useSyncExternalStore } from 'react';

// GitHub Pages can serve the site, but only a separate service can record events.
const endpoint = import.meta.env.VITE_ACTIVITY_URL || (location.hostname.endsWith('.github.io') ? null : '/api/activity');
const listeners = new Set();
const pending = new Map();
let state = { visit: null, download: null, live: false };
let started = false;
let refreshing = false;
let timer;

function publish(next) {
  state = next;
  listeners.forEach(listener => listener());
}

async function request(event) {
  const url = new URL(endpoint, location.href);
  if (event) {
    url.searchParams.set('kind', event.kind);
    url.searchParams.set('id', event.id);
  }
  const response = await fetch(url, { method: event ? 'POST' : 'GET', cache: 'no-store', credentials: 'omit', keepalive: !!event });
  if (!response.ok) throw new Error('Counter unavailable');
  const totals = await response.json();
  if (![totals.visit, totals.download].every(value => Number.isSafeInteger(value) && value >= 0)) throw new Error('Invalid totals');
  publish({
    visit: Math.max(state.visit ?? 0, totals.visit),
    download: Math.max(state.download ?? 0, totals.download),
    live: true,
  });
}

async function send(event) {
  if (event.inFlight) return;
  event.inFlight = true;
  try {
    await request(event);
    pending.delete(event.id);
  } catch {
    if (state.live) publish({ ...state, live: false });
  } finally {
    event.inFlight = false;
  }
}

function record(kind) {
  if (!endpoint) return;
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  const event = { kind, id };
  pending.set(id, event);
  void send(event);
}

export function recordDownload() { record('download'); }

async function refresh() {
  if (document.hidden || refreshing) return;
  refreshing = true;
  try {
    if (pending.size) await Promise.all(Array.from(pending.values(), send));
    else await request();
  } catch {
    if (state.live) publish({ ...state, live: false });
  } finally {
    refreshing = false;
  }
}

function subscribe(listener) {
  if (!endpoint) return () => {};
  listeners.add(listener);
  if (listeners.size === 1) {
    timer = window.setInterval(refresh, 12000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', markOffline);
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', markOffline);
    }
  };
}
function markOffline() { publish({ ...state, live: false }); }

export function useActivity() {
  useEffect(() => {
    if (!started) {
      started = true;
      record('visit');
    }
  }, []);
  return useSyncExternalStore(subscribe, () => state);
}
