import {
    mobile,
    backend,
    creator,
    web,
    javascript,
    typescript,
    html,
    css,
    reactjs,
    redux,
    tailwind,
    nodejs,
    mongodb,
    git,
    figma,
    docker,
    meta,
    starbucks,
    tesla,
    sglogo,
    COE,
    shopify,
    USF,
    carrent,
    LinkedInLogo,
    GithubLogo,
    Nischal,
    Eric,
    jobit,
    tripguide,
    threejs,
    OpenCVShow,
    DNSFinalProjectShow,
    PortfolioWebsiteShow,

  } from "../assets";
  
  export const navLinks = [
    {
      id: "about",
      title: "About",
    },
    {
      id: "work",
      title: "Work",
    },
    {
      id: "contact", 
      title: "Contact",
    },
    {
      id: "linkedin", 
      title: "LinkedIn",
      href : "https://www.linkedin.com/in/dkarmariya/",
      imgSrc : LinkedInLogo,
    },
    {
      id: "github", 
      title: "GitHub",
      href : "https://github.com/Iamdk25",
      imgSrc : GithubLogo
    }
  ];
  
  const services = [
    {
      title: "Web Developer",
      icon: web,
    },
    {
      title: "React Native Developer",
      icon: mobile,
    },
    {
      title: "iOS Developer",
      icon: backend,
    },
    {
      title: "Interactive Dashboard Designer",
      icon: creator,
    },
  ];
  
  const technologies = [
    {
      name: "HTML 5",
      icon: html,
    },
    {
      name: "CSS 3",
      icon: css,
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
      name: "Tailwind CSS",
      icon: tailwind,
    },
    {
      name: "Node JS",
      icon: nodejs,
    },
    {
      name: "MongoDB",
      icon: mongodb,
    },
    {
      name: "Three JS",
      icon: threejs,
    },
    {
      name: "git",
      icon: git,
    },
    {
      name: "figma",
      icon: figma,
    },
    {
      name: "docker",
      icon: docker,
    },
  ];
  
  const experiences = [
    {
      title: "Procurement Card Student Assistant",
      company_name: "College of Engineering - Resource Management",
      icon: COE,
      iconBg: "#008631",
      date: "September 2023 - Present",
      points: [
        "Conducting PCard verifications for 350+ professors, and maintaining financial resource management at ERM.",
        "Collaborating with JP Morgan and Chase and decrease statement processing time by 10%.",
        "Assisting in reconciling bank statements for professors, and managing multiple budgets across several departments.",
      ],
    },
    {
      title: "Campus Council Representative",
      company_name: "USF Student Government",
      icon: sglogo,
      iconBg: "#E6DEDD",
      date: "May 2023 - Sept 2023",
      points: [
        "Overlooked 1000+ student organization interim budget requests, travel grants, events requests, for etc.",
        "Ensured smooth conduct of fund distribution and fair assessment to all organizations.",
        "Validated the safe and fair conduct of elections while adhering to both ethical codes and procedural norms.",
      ],
    },
    {
      title: "Peer Mentor",
      company_name: "ACE, Office of Undergraduate Studies",
      icon: USF,
      iconBg: "#383E56",
      date: "May 2023 - Present",
      points: [
        "Conducted group meetings with 30+ students and provided them with necessary information to succeed in college.",
        "Hosted office hours and offered 1 on 1 mentorship for student facing academic challenges.",
        "Gained valuable crowd management abilities and cultivated crucial leadership and mentoring skills.",
      ],
    },
    {
      title: "Student Housing Assistant",
      company_name: "Housing and Residential Education, USF",
      icon: USF,
      iconBg: "#E6DEDD",
      date: "April 2023 - Present",
      points: [
        "Acted as a first line of response by ensuring the safety of students by conducting safe management of keys and access cards.",
        "Created a positive residential experience for students, guests, and visitors.",
        "Handled over 150 packages and mails per day at the campus mailing center.",
      ],
    },
  ];
  
  const testimonials = [
    {
      testimonial:
        "Divyarajsinh is a very knowledgeable and bright individual to study with. He never fails to impress me!",
      name: "Eric Higgins",
      designation: "Operations Analyst",
      company: "Citi",
      image: "src/assets/Eric.jpeg",
    },
    {
      testimonial:
        "Divyarajsinh Karmariya is an exceptional learner and a patient listener. Mentoring him, especially during his exams, I witnessed his eagerness to explore new technology and dedication to excellence. His proactive approach and curiosity make him an asset in any team.",
      name: "Nischal Olety Nagesh",
      designation: "Techincal Analyst Intern",
      company: "Cummins",
      image: "src/assets/Nischal.jpeg",
    },
    
  ];
  
  const projects = [
    {
      name: "Python-Based Object Detector Using OpenCV",
      description:
        "An advanced Python-based object detection system for images and videos using OpenCV and GoogleNet Frameworks.",
      tags: [
        {
          name: "Python",
          color: "blue-text-gradient",
        },
        {
          name: "OpenCV",
          color: "green-text-gradient",
        },
        {
          name: "Machine Learning",
          color: "pink-text-gradient",
        },
      ],
      image: OpenCVShow,
      source_code_link: "https://github.com/Iamdk25/Open-CV-Python-project",
    },
    {
      name: "Parking & Offense Management System",
      description:
        "A project to manage, and keep track of all the final parking citation appeals that come to the USF Student Government Supreme Court.",
      tags: [
        {
          name: "DataStructures",
          color: "blue-text-gradient",
        },
        {
          name: "BFSDFS",
          color: "green-text-gradient",
        },
        {
          name: "C++",
          color: "pink-text-gradient",
        },
      ],
      image: DNSFinalProjectShow,
      source_code_link: "https://github.com/Iamdk25/DNS_Final_Project",
    },
    {
      name: "Personal 3D Portfolio Website",
      description:
        "A visually striking 3D portfolio website that showcases my skills and projects using 3D environments, rendering, camera controls and advanced lighting effects.",
      tags: [
        {
          name: "threeJS",
          color: "blue-text-gradient",
        },
        {
          name: "ReactJS",
          color: "green-text-gradient",
        },
        {
          name: "TailwindCSS",
          color: "pink-text-gradient",
        },
      ],
      image: PortfolioWebsiteShow,
      source_code_link: "https://github.com/",
    },
  ];
  
  export {  services, technologies, experiences, testimonials, projects };