import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SiteContext = createContext(null);

const FINE_QUERY = '(hover: hover) and (pointer: fine)';
const WIDE_QUERY = '(min-width: 1100px)';

function useMatch(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function SiteProvider({ children }) {
  const osReduced = useMatch('(prefers-reduced-motion: reduce)');
  const finePointer = useMatch(FINE_QUERY);
  const wide = useMatch(WIDE_QUERY);
  const [override, setOverride] = useState(null);
  const [hidden, setHidden] = useState(() => document.hidden);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const motion = override === null ? !osReduced : override;

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
  }, [motion]);

  const value = useMemo(() => ({
    motion,
    animate: motion && !hidden,
    hidden,
    finePointer,
    wide,
    toggleMotion: () => setOverride((current) => {
      const active = current === null ? !osReduced : current;
      return !active;
    }),
  }), [motion, hidden, finePointer, wide, osReduced]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite must be used within SiteProvider');
  return value;
}
