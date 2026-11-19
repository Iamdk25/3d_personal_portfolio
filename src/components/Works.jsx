import { useState } from 'react';
import Glass from './Glass';
import FloatingModel from './FloatingModel';
import LinkIcon from './LinkIcon';
import { projects } from '../constants/projects';

function ProjectVisual({ project }) {
  const [failed, setFailed] = useState(false);
  const preview = failed ? null : project.screenshot;

  return (
    <a className={`project-visual${preview ? ' project-visual--screenshot' : ''}`}
      href={project.source_code_link} target="_blank" rel="noreferrer">
      <img src={preview?.src ?? project.image} alt={preview?.alt ?? `${project.name} illustration`}
        loading="lazy" decoding="async" width="800" height="500" onError={preview ? () => setFailed(true) : undefined} />
      <span className="sr-only">View {project.name} on GitHub</span>
      {!preview && <><span className="project-cross cross-a" aria-hidden="true">+</span><span className="project-cross cross-b" aria-hidden="true">+</span></>}
    </a>
  );
}

function Works() {
  return <>
    <div className="projects-heading-space">
      <div className="text-shield"><h2>Project <em>showcase</em></h2></div>
      <FloatingModel object="saturn" className="project-orbit" interactive />
    </div>
    <div className="project-grid">
      {projects.map((project, index) => (
        <article className="project-module" key={project.name}>
          <Glass panel block radius={28} className="project-console">
            <div className="project-meta"><span>0{index + 1} / PROJECT</span><span aria-hidden="true">↗</span></div>
            <ProjectVisual project={project} />
            <div className="project-copy">
              <h3>{project.name}</h3><p>{project.description}</p>
              <ul className="project-stack">{project.tags.map(tag => <li key={tag.name}>{tag.name}</li>)}</ul>
              <a className="project-source icon-link" href={project.source_code_link} target="_blank" rel="noreferrer"
                aria-label={`View source for ${project.name} on GitHub`}>View source <LinkIcon name="github" /></a>
            </div>
          </Glass>
        </article>
      ))}
    </div>
  </>;
}

export default Works;
