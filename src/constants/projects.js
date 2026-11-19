import skillsharp from "../assets/projects/skillsharp.svg";
import skillsharpApp from "../assets/projects/skillsharp-app.webp";
import paalApp from "../assets/projects/paal-app.webp";
import eerisApp from "../assets/projects/eeris-app.webp";
import paal from "../assets/projects/paal.jpg";
import eeris from "../assets/projects/eeris.jpg";
import quantumstock from "../assets/projects/quantumstock.jpg";

export const projects = [
  {
    name: "SkillSharp AI",
    description: "An AI mock interview app that generates role-specific questions, transcribes spoken answers, and provides feedback.",
    tags: [
      { name: "Next.js", color: "blue-text-gradient" },
      { name: "Gemini API", color: "pink-text-gradient" },
      { name: "PostgreSQL", color: "green-text-gradient" },
      { name: "Drizzle ORM", color: "blue-text-gradient" },
    ],
    image: skillsharp,
    screenshot: { src: skillsharpApp, alt: "SkillSharp AI showing feedback and a suggested answer for a sample interview" },
    source_code_link: "https://github.com/Iamdk25/skill-sharp-ai",
  },
  {
    name: "PAAL",
    description:
      'A study assistant that turns course material into explanations, quizzes, and study guides. Built with a teammate using React, FastAPI, and a multi-agent learning workflow.',
    tags: [
      { name: "CrewAI", color: "blue-text-gradient" },
      { name: "LangChain", color: "green-text-gradient" },
      { name: "FastAPI", color: "pink-text-gradient" },
      { name: "React 19", color: "blue-text-gradient" },
    ],
    image: paal,
    screenshot: { src: paalApp, alt: "PAAL Study Hub showing a sample tutor conversation about AI agents" },
    source_code_link: "https://github.com/Iamdk25/PAALapp",
  },
  {
    name: "EERIS",
    description:
      'Expense reporting for student organizations, with receipt uploads, OTP login, submission tracking, and administrator approvals. Built in a team of four.',
    tags: [
      { name: "React", color: "blue-text-gradient" },
      { name: "Node.js", color: "green-text-gradient" },
      { name: "Express", color: "pink-text-gradient" },
      { name: "Vite", color: "blue-text-gradient" },
    ],
    image: eeris,
    screenshot: { src: eerisApp, alt: "EERIS admin dashboard showing sample expense requests and approval totals" },
    source_code_link: "https://github.com/deshninad/EERIS",
  },
  {
    name: "QuantumStock",
    description:
      'A C# desktop app for visualizing stock data and exploring candlestick patterns. Built in a team of four using .NET and Windows Forms.',
    tags: [
      { name: "C#", color: "blue-text-gradient" },
      { name: ".NET", color: "green-text-gradient" },
      { name: "Gemini API", color: "pink-text-gradient" },
      { name: "Tableau", color: "blue-text-gradient" },
    ],
    image: quantumstock,
    source_code_link: "https://github.com/Iamdk25/QuantumStock",
  },
];
