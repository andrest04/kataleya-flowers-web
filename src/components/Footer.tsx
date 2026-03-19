export default function Footer() {
  return (
    <footer
      className="px-4 py-8 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "var(--color-cream)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <h2
          className="text-2xl leading-none"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Kataleya Flawers
        </h2>
        <p className="text-sm opacity-80">
          © 2026 Kataleya Flawers · Hecho con amor en Lima, Perú
        </p>
      </div>
    </footer>
  );
}
