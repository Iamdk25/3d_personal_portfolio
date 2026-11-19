export function publicUrl(path) {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = base.endsWith('/') ? base : `${base}/`;
  return `${normalized}${String(path).replace(/^\//, '')}`;
}

export const EMAIL = 'divyarajsinhkarmariya@gmail.com';

export const resumeUrl = publicUrl('resume/Divyarajsinh_Karmariya_Resume.pdf');

export const links = {
  linkedin: 'https://www.linkedin.com/in/dkarmariya/',
  github: 'https://github.com/Iamdk25',
  paal: 'https://github.com/Iamdk25/PAALapp',
  eeris: 'https://github.com/deshninad/EERIS',
  quantum: 'https://github.com/Iamdk25/QuantumStock',
};

export const models = {
  workstation: publicUrl('models/workstation.glb'),
  compactWorkstation: publicUrl('models/workstation-compact.glb'),
  planet: publicUrl('models/planet.gltf'),
  astronaut: publicUrl('models/nasa-markiii.glb'),
};
