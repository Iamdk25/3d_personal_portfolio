import ActivityCount from './ActivityCount';

export default function Colophon() {
  return (
    <footer className="colophon text-shield">
      <p>Divyarajsinh Karmariya · Tampa, Florida</p>
      <dl className="portfolio-milestones" aria-label="Portfolio activity">
        <div><dt>Portfolio visits</dt><dd><ActivityCount kind="visit"/></dd></div>
      </dl>
      <details><summary>3D credits</summary><ul>
        <li>Saucer, planet geometry, liquid sculpture and novelty objects: original geometry for this site.</li>
        <li>
          Workstation:{' '}
          <a href="https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66" target="_blank" rel="noreferrer">Gaming Desktop PC</a>
          {' '}by{' '}
          <a href="https://sketchfab.com/Yolala1232" target="_blank" rel="noreferrer">Yolala1232</a>
          ,{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>
          . Relit and framed here.
        </li>
        <li>Mark III spacesuit, ICECube CubeSat and Voyager: <a href="https://github.com/nasa/NASA-3D-Resources" target="_blank" rel="noreferrer">NASA 3D Resources</a>. Relit and scaled for this site.</li>
        <li>Interactive Earth surface: <a href="https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-map/" target="_blank" rel="noreferrer">NASA Blue Marble: Next Generation</a>.</li>
        <li>Mars surface: <a href="https://science.nasa.gov/3d-resources/mars/" target="_blank" rel="noreferrer">Viking imagery via NASA/JPL-Caltech</a>.</li>
        <li>Earth cloud and Saturn maps: <a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noreferrer">Solar System Scope</a>, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. Re-encoded for web delivery.</li>
      </ul></details>
    </footer>
  );
}
