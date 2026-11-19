export default function SectionWrapper({ id, children }) {
  return (
    <section className="sm:px-16 px-6 sm:py-16 py-10 max-w-7xl mx-auto relative z-0" id={id} tabIndex={-1}>
      {children}
    </section>
  );
}
