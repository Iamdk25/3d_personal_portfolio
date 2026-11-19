import {
  mobile,
  backend,
  creator,
  web,
  python,
  typescript,
  javascript,
  reactjs,
  nodejs,
  tailwind,
  mongodb,
  postgresql,
  pytorch,
  aws,
  docker,
  threejs,
  COE,
  USF,
  abbvie,
  veer,
  engcouncil,
  gwc,
  LinkedInLogo,
  GithubLogo,
} from "../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "contact",
    title: "Contact",
  },
  {
    id: "linkedin",
    title: "LinkedIn",
    href: "https://www.linkedin.com/in/dkarmariya/",
    imgSrc: LinkedInLogo,
  },
  {
    id: "github",
    title: "GitHub",
    href: "https://github.com/Iamdk25",
    imgSrc: GithubLogo,
  },
];

const services = [
  {
    title: "Full-Stack Engineering",
    icon: web,
    description:
      "React, TypeScript and Next.js front ends over Node and FastAPI services — schema, API and UI built end to end.",
  },
  {
    title: "AI / ML Engineering",
    icon: backend,
    description:
      "PyTorch and I-JEPA embeddings, RAG pipelines with LangChain, CrewAI and Pinecone, plus evaluation harnesses that keep output grounded.",
  },
  {
    title: "Data Visualization at Scale",
    icon: creator,
    description:
      "WebGPU and Web Workers rendering 1M+ concurrent interactive points at sub-100ms latency and 60 fps.",
  },
  {
    title: "iOS Development",
    icon: mobile,
    description:
      "Swift applications built through CodePath's Intermediate iOS Development program.",
  },
];

const technologies = [
  {
    name: "Python",
    icon: python,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "PostgreSQL",
    icon: postgresql,
  },
  {
    name: "PyTorch",
    icon: pytorch,
  },
  {
    name: "AWS",
    icon: aws,
  },
  {
    name: "Docker",
    icon: docker,
  },
  {
    name: "Three JS",
    icon: threejs,
  },
];

const experiences = [
  {
    title: "Software Engineering Intern",
    company_name: "AbbVie",
    icon: abbvie,
    iconBg: "#071D49",
    date: "May 2026 - August 2026",
    points: ['Built React/TypeScript bioinformatics visualizations using WebGPU and Web Workers, alongside FastAPI services on AWS S3.'],
  },
  {
    title: "AI/ML Research Assistant",
    company_name: "USF Bellini College of AI, Cybersecurity, and Computing",
    icon: USF,
    iconBg: "#006747",
    date: "May 2026 - Present",
    points: ['Building React learning interfaces and Python evaluation tooling for a Canvas-integrated AI education platform.'],
  },
  {
    title: "Procurement Card Student Assistant",
    company_name: "USF Business & Financial Support",
    icon: COE,
    iconBg: "#008631",
    date: "September 2023 - April 2026",
    points: ['Automated financial verification and reconciliation workflows with Python, and approval tracking through Jira integrations.'],
  },
  {
    title: "Business and Technology Intern",
    company_name: "Veer Pharmachem",
    icon: veer,
    iconBg: "#0E7490",
    date: "April 2022 - July 2022",
    points: ['Built Power BI reporting tools and a C inventory tracker; redesigned website lead forms in Figma.'],
  },
  {
    title: "Marketing & Communications Chair",
    company_name: "Engineering Council, University of South Florida",
    icon: engcouncil,
    iconBg: "#006747",
    date: "May 2024 - May 2026",
    points: [],
  },
  {
    title: "Technical Chair",
    company_name: "Girls Who Code College Loop, USF Chapter",
    icon: gwc,
    iconBg: "#0EA5A4",
    date: "January 2023 - May 2024",
    points: [],
  },
];

export { services, technologies, experiences };
export { projects } from "./projects";
