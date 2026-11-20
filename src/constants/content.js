import { links } from '../utils/publicUrl';

export const navLinks = [
  { id: 'projects', label: 'Work' },
  { id: 'play', label: 'Play' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const skillGroups = [
  {
    title: 'Languages',
    skills: ['Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'C#', 'C++', 'C', 'Swift', 'Bash', 'PowerShell'],
  },
  {
    title: 'Backend & APIs',
    skills: ['Spring Boot', 'FastAPI', 'Node.js', 'Express.js', 'REST APIs', '.NET', 'Flask', 'Pydantic', 'SQLAlchemy', 'Drizzle ORM'],
  },
  {
    title: 'Frontend & graphics',
    skills: ['React', 'Next.js', 'HTML / CSS', 'Tailwind CSS', 'Three.js', 'WebGPU', 'TanStack Router', 'Figma'],
  },
  {
    title: 'AI & machine learning',
    skills: ['PyTorch', 'TensorFlow', 'RAG', 'AI agents', 'MLOps', 'LangChain', 'CrewAI', 'FAISS', 'OpenCV', 'CUDA'],
  },
  {
    title: 'Databases & analytics',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'DuckDB', 'Pinecone', 'pandas', 'NumPy', 'SciPy', 'Power BI', 'Tableau'],
  },
  {
    title: 'Cloud & DevOps',
    skills: ['AWS', 'Amazon S3', 'Azure', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git / GitHub', 'Ansible', 'Vercel'],
  },
];

export const experiences = [
  {
    role: 'Software Engineering Intern',
    org: 'AbbVie',
    dates: 'May 2026 – August 2026',
    icon: 'abbvie',
    summary:
      'React and TypeScript visualizations for bioinformatics data, using WebGPU, Web Workers, and TanStack routing, plus FastAPI services on AWS S3 and an ML pipeline. That visualization work drew more than a million concurrent points at 60 fps, with latency under 100 ms.',
  },
  {
    role: 'AI/ML Research Assistant',
    org: 'USF Bellini College of AI, Cybersecurity, and Computing',
    dates: 'May 2026 – Present',
    icon: 'usf',
    summary:
      'A CanvasLTI learning platform with a React generative interface and Python evaluation tooling built with LangChain and Pydantic.',
  },
  {
    role: 'Procurement Card Student Assistant',
    org: 'USF College of Engineering — Resource Management',
    dates: 'September 2023 – April 2026',
    icon: 'coe',
    summary:
      'Python automation for procurement-card checks, and Jira integrations for the approval flow.',
  },
  {
    role: 'Business and Technology Intern',
    org: 'Veer Pharmachem',
    dates: 'April 2022 – July 2022',
    icon: 'veer',
    summary:
      'Power BI reporting for QC batches, a C inventory tracker, and a Figma redesign of the lead form.',
  },
];

export const education = {
  school: 'University of South Florida',
  program: 'B.S. Computer Science',
  dates: 'December 2026',
  detail: 'GPA 3.81 · Dean’s Honors · Tampa, Florida',
  icon: 'usf',
};

export const leadership = [
  {
    role: 'Marketing & Communications Chair',
    org: 'Engineering Council, University of South Florida',
    dates: 'May 2024 – May 2026',
    icon: 'engcouncil',
  },
  {
    role: 'Technical Chair',
    org: 'Girls Who Code College Loop, USF',
    dates: 'January 2023 – May 2024',
    icon: 'gwc',
  },
];

export const projects = [
  {
    id: 'paal',
    index: '01',
    name: 'PAAL',
    full: 'Promptless AI-Assisted Learning',
    date: 'April 2026',
    team: 'Team of two · project lead and full-stack',
    problem: 'Course material is hard to turn into practice without a guided pass.',
    contribution:
      'I led the build with one teammate: the React interface and the FastAPI service behind a five-agent study workflow.',
    outcome: 'Uploaded material becomes explanations, quizzes, and study guides.',
    stack: 'React 19, FastAPI, CrewAI, Gemini, Pinecone, LlamaParse, and LangChain.',
    href: links.paal,
    study: 'paal',
    layout: 'feature',
  },
  {
    id: 'eeris',
    index: '02',
    name: 'EERIS',
    full: 'Expense and reimbursement',
    date: 'April 2025',
    team: 'Team of four · full-stack and project lead',
    problem: 'USF reimbursements were scattered across inboxes and spreadsheets.',
    contribution:
      'I worked on receipt upload, OTP login, submission tracking, and email notifications.',
    outcome:
      'A React and Node app for submitting, classifying, and reviewing expenses. The backend stores JSON and is structured so MongoDB can be added later.',
    stack: 'React, Vite, Node.js, and Express.',
    href: links.eeris,
    study: 'eeris',
    layout: 'feature flip',
  },
  {
    id: 'quantum',
    index: '03',
    name: 'QuantumStock',
    full: 'Desktop price review',
    date: 'August 2024',
    team: 'Team of four',
    problem: 'Historical prices lived in CSV files and spreadsheets.',
    contribution: 'I helped build the C# and .NET Windows Forms application.',
    outcome:
      'The app imports CSV files, draws stock charts, and lets you look through candlestick patterns. It does not predict markets.',
    stack: 'C#, .NET, and Windows Forms.',
    href: links.quantum,
    study: 'quantum',
    layout: 'support',
  },
];

export const galleryObjects = [
  {
    id: 'orbit',
    label: 'Orbit',
    detail: 'Original sculpture. Three metal rings, a lavender core, and a few satellites.',
  },
  {
    id: 'workstation',
    label: 'Workstation',
    detail: 'The floating desk from the original site. About 16 MB, so a phone loads it only when you ask.',
    size: 'About 16 MB',
  },
  {
    id: 'astronaut',
    label: 'Astronaut',
    detail: 'Astronaut by Poly, CC BY 2.0. Relit and framed here.',
    size: 'About 2.7 MB',
  },
  {
    id: 'planet',
    label: 'Planet',
    detail: 'Stylized planet by cmzw, CC BY 4.0. Relit and framed here.',
    size: 'About 3 MB',
  },
];
