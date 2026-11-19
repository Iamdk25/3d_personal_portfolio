import github from '../assets/GithubLogo.png';
import linkedin from '../assets/LinkedInLogo.png';

const marks = { github, linkedin };
const strokes = {
  work: 'M3.5 8h17v11h-17z M8.5 8V5h7v3 M3.5 12.5h17 M10 12.5v2h4v-2',
  document: 'M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6 M9 16h6',
  mail: 'M3.5 6h17v12h-17z M4 7l8 6 8-6',
  send: 'M3.5 10.5l17-7-7 17-2.6-7.4-7.4-2.6z M10.9 13.1l9.6-9.6',
  download: 'M12 3v12 M7.5 11l4.5 4.5 4.5-4.5 M5 18v3h14v-3',
};

export default function LinkIcon({ name }) {
  return <span className="link-icon" aria-hidden="true">
    {marks[name]
      ? <img className="link-icon-mark" src={marks[name]} alt="" width="18" height="18" draggable={false} />
      : <svg className="link-icon-mark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={strokes[name]} />
        </svg>}
  </span>;
}
