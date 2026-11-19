export default function SceneLights({ workstation = false }) {
  if (workstation) return (
    <>
      <hemisphereLight args={['#f1f6ff', '#272929', .78]} />
      <directionalLight position={[-3, 5, 5]} intensity={1.85} color="#fff2dc" />
      <directionalLight position={[4, 2, 0]} intensity={.58} color="#ccdeff" />
      <directionalLight position={[1, 3, -4]} intensity={.7} color="#edf8ff" />
    </>
  );
  return (
    <>
      <hemisphereLight args={['#f7fbfa', '#405a54', 1.15]} />
      <directionalLight position={[4.5, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-5, 1.5, -3]} intensity={0.62} color="#bce6dc" />
      <directionalLight position={[0, 2.2, -5]} intensity={0.5} color="#ffffff" />
    </>
  );
}
