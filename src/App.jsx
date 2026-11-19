import { lazy, Suspense } from 'react';
import { SiteProvider } from './context/SiteContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Tech from './components/Tech';
import Works from './components/Works';
import Contact from './components/Contact';
import CursorHalo from './components/CursorHalo';
import SmoothScroll from './components/SmoothScroll';
import Colophon from './components/Colophon';
import Boundary from './components/Boundary';
import SectionWrapper from './hoc/SectionWrapper';
import useAfterPaint from './hooks/useAfterPaint';
const Stars = lazy(() => import('./components/canvas/Stars'));
function Portfolio() {
 const ready = useAfterPaint();
 return <div className="live-portfolio">
  <a className="skip" href="#about">Skip to content</a>
  <div className="css-stars" aria-hidden="true"/>
  {ready && <Boundary fallback={null}><Suspense fallback={null}><Stars/></Suspense></Boundary>}
  <SmoothScroll/><CursorHalo/><Navbar/>
  <main>
    <Hero/>
    <SectionWrapper id="about"><About/></SectionWrapper>
    <SectionWrapper id="experience"><Experience/></SectionWrapper>
    <Tech/>
    <SectionWrapper id="projects"><Works/></SectionWrapper>
    <SectionWrapper id="contact"><Contact/></SectionWrapper>
  </main>
  <Colophon/>
 </div>;
}
export default function App() {
 return <SiteProvider><Portfolio/></SiteProvider>;
}
