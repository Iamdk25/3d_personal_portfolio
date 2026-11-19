import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Glass from './Glass';
import { publicUrl } from '../utils/publicUrl';
import GlassSettings from './GlassSettings';
import { useSite } from '../context/SiteContext';

import { pulse } from '../utils/haptics';

const links = [
  ['about', 'About'], ['experience', 'Experience'], ['skills', 'Skills'],
  ['projects', 'Projects'], ['contact', 'Contact'],
];

export default function Navbar() {
  const { motion, toggleMotion } = useSite();
  const [panel, setPanel] = useState(null);
  const explore = useRef(null);
  const glass = useRef(null);
  const menuOpen = panel === 'explore';
  const toggle = name => setPanel(current => current === name ? null : name);
  const close = () => setPanel(null);
  const navigate = () => { pulse('select'); close(); };

  useLayoutEffect(() => { window.dispatchEvent(new Event('portfolio:glass')); }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const outside = event => {
      if (event.target.closest?.('[data-nav-panel]')?.dataset.navPanel !== panel) setPanel(null);
    };
    const escape = event => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      setPanel(null);
      (panel === 'explore' ? explore : glass).current?.focus();
    };
    const desktop = window.matchMedia('(min-width: 701px)');
    const resize = event => { if (event.matches && menuOpen) setPanel(null); };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('focusin', outside);
    document.addEventListener('keydown', escape);
    desktop.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('focusin', outside);
      document.removeEventListener('keydown', escape);
      desktop.removeEventListener('change', resize);
    };
  }, [panel, menuOpen]);

  return <header className="live-nav">
    <a href="#top" className="live-brand" aria-label="DK, Divyarajsinh Karmariya, home" onClick={navigate}><img src={publicUrl('orbit-mark.svg')} alt="" width="54" height="54" /></a>
    <Glass className="live-nav-content" radius={28}>
      <nav aria-label="Main navigation">
        <div className="desktop-links">{links.map(([id, label]) =>
          <a key={id} href={`#${id}`} onClick={navigate}>{label}</a>
        )}</div>
        <button ref={explore} className="menu-toggle" type="button" data-nav-panel="explore" onClick={() => toggle('explore')}
          aria-expanded={menuOpen} aria-controls="mobile-links">Explore <span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
        <div className="mobile-links" id="mobile-links" data-nav-panel="explore" hidden={!menuOpen}>
          {links.map(([id, label]) => <a key={id} href={`#${id}`} onClick={navigate}>{label}</a>)}
        </div>
        <GlassSettings open={panel === 'glass'} onToggle={() => toggle('glass')} triggerRef={glass} />
        <button className="pause" type="button" onClick={() => { close(); toggleMotion(); }} aria-pressed={!motion}>{motion ? 'Pause' : 'Play'}</button>
      </nav>
    </Glass>
  </header>;
}
