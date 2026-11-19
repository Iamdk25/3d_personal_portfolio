import FloatingModel from './FloatingModel';
import { useCallback, useEffect, useRef } from 'react';
import useInView from '../hooks/useInView';
import useScrollProgress from '../hooks/useScrollProgress';
import { experienceDetails } from '../constants/experienceDetails';
import Glass from './Glass';
import ExperiencePhotos from './ExperiencePhotos';
import LinkIcon from './LinkIcon';
import gwc from '../assets/company/gwc.png';
import { publicUrl } from '../utils/publicUrl';
const logoPath = (name, extension = 'png') => publicUrl(`logos/${name}.${extension}`);
const logos = { abbvie: logoPath('abbvie-new'), usf: logoPath('usf', 'webp'), coe: logoPath('engineering', 'webp'), ecouncil: logoPath('ecouncil'), gwc, veer: logoPath('veer-new'), government: logoPath('government'), acm: logoPath('acm', 'svg') };
const accents = { usf:'64, 178, 134', coe:'64, 178, 134', government:'194, 176, 113', ecouncil:'153, 201, 57', abbvie:'113, 153, 237', gwc:'72, 204, 190', veer:'246, 142, 65', acm:'81, 174, 222' };
function Experience() {
 const timeline=useRef(null);
 const fill=useRef(null);
 const near=useInView(timeline, '160px');
 const update=useCallback(progress => { fill.current.style.transform = `scaleY(${progress})`; }, []);
 useScrollProgress(timeline, .5, .5, near, update);
 useEffect(() => {
   const cards = timeline.current.querySelectorAll('.float-card');
   if (typeof IntersectionObserver === 'undefined') {
     cards.forEach(card => card.classList.add('is-floating'));
     return;
   }
   const observer = new IntersectionObserver(entries => {
     for (const entry of entries) entry.target.classList.toggle('is-floating', entry.isIntersecting);
     window.dispatchEvent(new Event('portfolio:glass'));
   }, { rootMargin: '32px' });
   cards.forEach(card => observer.observe(card));
   return () => observer.disconnect();
 }, []);
 return <><div className="experience-heading"><div className="text-shield"><p className="eyebrow">Background</p><h2 className="mt-4">Experience.</h2></div><FloatingModel object="ufo" className="experience-ufo" interactive/></div>
 <div className="career-timeline" ref={timeline}><div className="timeline-track" aria-hidden="true"><div className="timeline-fill" ref={fill}/></div>{experienceDetails.map((item,index)=><article className="career-item" data-scene-reveal key={item.id} style={{'--company-accent':accents[item.logo]}}>
  <span className="career-dot" aria-hidden="true"/>
  <div className="float-card" style={{animationDelay:`${index * -.9}s`}}><Glass panel block radius={24} className="experience-glass">
   <div className="career-heading"><span className={`company-logo logo-${item.logo}`}><img src={logos[item.logo]} alt={`${item.company} logo`} loading="lazy"/></span><div><h3>{item.title}</h3><p>{item.company}</p></div></div>
   <p className="career-date">{item.date} · {item.type}</p><p className="career-summary">{item.summary}</p>
   {item.id === 'abbvie' && <ExperiencePhotos/>}
   <details className="role-details" onToggle={() => window.dispatchEvent(new Event('portfolio:glass'))}><summary>More about this role <span aria-hidden="true">+</span></summary><div className="role-expanded"><p className="career-location">{item.location}</p><ul>{item.bullets.map(point=><li key={point}>{point}</li>)}</ul><a className="icon-link" href="https://www.linkedin.com/in/dkarmariya/details/experience/" target="_blank" rel="noreferrer"><LinkIcon name="linkedin" />On LinkedIn</a></div></details>
  </Glass></div>
 </article>)}</div></>;
}
export default Experience;
