"use client";

function isBusinessOpen(): boolean {
  const now = new Date();
  // Peru time is UTC-5
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const peruMs = utcMs - 5 * 60 * 60 * 1_000;
  const peru = new Date(peruMs);

  const day = peru.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const hour = peru.getHours(); // 0-23

  // Open Monday–Saturday (1–6), 08:00–18:59 (i.e. before 19:00)
  return day >= 1 && day <= 6 && hour >= 8 && hour < 19;
}

export default function BusinessHoursBadge() {
  const open = isBusinessOpen();

  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={{
        backgroundColor: open ? "var(--color-accent)" : "var(--color-primary)",
        color: "var(--color-cream)",
      }}
    >
      {open ? "ABIERTO" : "CERRADO"}
    </span>
  );
}
