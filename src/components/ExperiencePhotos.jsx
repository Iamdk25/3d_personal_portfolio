import { useEffect, useRef, useState } from 'react';
import useInView from '../hooks/useInView';
import { publicUrl } from '../utils/publicUrl';

const photos = [
  ['ballpark', 'Cubs game', 'Wearing an AbbVie shirt in the stands at a Cubs game.'],
  ['poster-team', 'Poster day', 'Three people beside the Cell Painting Explorer poster at AbbVie.'],
  ['poster', 'Cell Painting Explorer', 'Standing next to my Cell Painting Explorer project poster.'],
  ['office', 'At the office', 'Standing beside the illuminated AbbVie logo.'],
];

export default function ExperiencePhotos() {
  const track = useRef(null);
  const near = useInView(track, '500px');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (near) setLoaded(true); }, [near]);
  const [current, setCurrent] = useState(0);
  function go(index) {
    const node = track.current;
    const smooth = document.documentElement.dataset.motion === 'on';
    node.scrollTo({ left: node.clientWidth * index, behavior: smooth ? 'smooth' : 'instant' });
  }
  return <div className="role-album" role="region" aria-roledescription="carousel" aria-label="AbbVie internship photos">
    <div className="album-track" ref={track} tabIndex={0}
      aria-label="Internship photos, use left and right arrows" onScroll={event => {
        const node = event.currentTarget;
        if (node.clientWidth) setCurrent(Math.min(photos.length - 1, Math.max(0, Math.round(node.scrollLeft / node.clientWidth))));
      }}
      onKeyDown={event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        go(Math.max(0, Math.min(photos.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1))));
      }}>
      {photos.map(([file, , alt]) => <img key={file} src={loaded ? publicUrl('experience/abbvie/' + file + '.webp') : undefined} loading="lazy" decoding="async" alt={alt} />)}
    </div>
    <div className="album-controls">
      <p aria-live="polite"><span>{current + 1} / {photos.length}</span>{photos[current][1]}</p>
      <button type="button" disabled={current === 0} aria-label="Previous AbbVie photo" onClick={() => go(current - 1)}>←</button>
      <button type="button" disabled={current === photos.length - 1} aria-label="Next AbbVie photo" onClick={() => go(current + 1)}>→</button>
    </div>
  </div>;
}
