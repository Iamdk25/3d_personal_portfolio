import FloatingModel from './FloatingModel';
import LinkIcon from './LinkIcon';

function About() { return <div className="about-space"><div className="short-about text-shield"><p className="eyebrow">Introduction</p><h2>About <em>me.</em></h2><p>I’m a Computer Science senior at the University of South Florida, graduating December 2026. I work on AI-powered learning experiences at USF’s Bellini College and previously built bioinformatics visualization tools at AbbVie.</p><div className="profile-links"><a className="icon-link" href="https://www.linkedin.com/in/dkarmariya/" target="_blank" rel="noreferrer"><LinkIcon name="linkedin" />LinkedIn</a><span>USF · B.S. Computer Science · 3.81 GPA</span></div></div><FloatingModel object="astronaut" className="wandering-astronaut" interactive/></div>; }
export default About;
