export default function Glass({
  children,
  className = '',
  radius = 28,
  block = false,
  panel = false,
}) {
  return (
    <div
      className={`${block ? 'glass-block' : 'glass-inline'} ${panel ? 'glass-panel' : 'glass-chrome'}`}
      data-scene-pane={radius}
      style={{ borderRadius: radius }}
      onPointerMove={panel ? event => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - box.left}px`);
        event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - box.top}px`);
      } : undefined}
    >
      <div className={`glass-fallback ${className}`} style={{ borderRadius: radius }}>
        <div className="glass-content">{children}</div>
      </div>
    </div>
  );
}
