# Content sources

Reviewed 17 November 2026. Content is curated locally, not live-synced.

- LinkedIn experience: https://www.linkedin.com/in/dkarmariya/details/experience/ — read directly in the owner’s signed-in browser. All 10 roles and 29 bullets retained in src/constants/experienceDetails.js. Only the collapsed summary is shortened. Includes dates, role types and locations.
- Profile: https://github.com/Iamdk25 — education, current role context and featured projects.
- PAAL: https://github.com/Iamdk25/PAALapp — README describes course explanations, quizzes, study guides, React and FastAPI. Team context from supplied resume.
- EERIS: https://github.com/deshninad/EERIS — expense submissions, OTP login, receipt upload, tracking and approvals. JSON storage; MongoDB is a possible extension, not a project technology claim.
- QuantumStock: https://github.com/Iamdk25/QuantumStock — stock visualization and candlestick exploration, supported by profile and resume.
- Resume: public/resume/Divyarajsinh_Karmariya_Resume.pdf — supplied October 2026 resume; education, team sizes and contributions.
- Employer logos: original repository’s AbbVie, USF, College of Engineering, Engineering Council, Girls Who Code and Veer assets. USF mark reused for university campus roles. ACM: https://github.com/simple-icons/simple-icons/blob/develop/icons/acm.svg (Simple Icons, CC0).

## Interaction and material references

- Apple Materials HIG: https://developer.apple.com/design/human-interface-guidelines/materials — hierarchy, legibility and restrained glass.
- Simple Liquid Glass: https://github.com/lucaperullo/simple-liquid-glass — existing package integration, version 5.6.0. Card panels use reduced refraction and no chromatic dispersion; navigation retains the stronger rim.
- Lenis: https://github.com/darkroomengineering/lenis — version 1.3.27, desktop wheel smoothing, section navigation and cleanup. Touch keeps native scroll; motion pause disables smoothing.
- Original live source in Git history — star rotation, point color, initial group framing and the original workstation/planet assets.
- Model credits remain in the footer’s 3D credits disclosure. The Mark III spacesuit is rotatable by drag or keyboard.

No WebGPU migration was made to this portfolio renderer. LinkedIn’s WebGPU claim describes the owner’s AbbVie work, not this website.

- SkillSharp AI: https://github.com/Iamdk25/skill-sharp-ai — README describes role-specific mock interview questions, speech-to-text, feedback, and the listed stack. Card artwork is an original illustration.

- EmailJS free tier: https://www.emailjs.com/pricing/ — 200 monthly requests, checked this session. Existing Gmail connection failure confirmed from an actual self-test response (412 invalid grant). Delivery repair awaits owner sign-in/reconnect.
- UFO, ringed planet, doughnut and coffee mug: original procedural geometry in this repository. UFO lighting uses a prefiltered atlas baked from Three.js’s bundled RoomEnvironment; no new model downloads or external texture requests.

- NASA models: https://github.com/nasa/NASA-3D-Resources — Mark III Spacesuit, CubeSat - ICECube, and Voyager Probe (A); NASA source models are hosted locally as Meshopt-compressed GLBs. Materials adjusted for rendering; footer credits updated.
- Earth day/cloud and Saturn surface/ring maps: https://www.solarsystemscope.com/textures/ — CC BY 4.0; based on NASA data, re-encoded as WebP. Proper equirectangular/radial mapping, not globe photographs stretched over spheres.
- The workstation uses WebP textures from the original model, with attribution retained. The deployed GLB uses glTF Transform to deduplicate resources, flatten and join compatible meshes, weld vertices, prune unused resources, and compress geometry with Meshopt at the medium setting. The compact GLB uses those same transforms with textures capped at 896 pixels on the longest edge.
