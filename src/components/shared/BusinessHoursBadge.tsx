"use client";

import { useEffect, useState } from "react";

import { BUSINESS } from "@/lib/constants";

function isBusinessOpen(): boolean {
  const now = new Date();
  // Peru time is UTC-5
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const peruMs = utcMs - 5 * 60 * 60 * 1_000;
  const peru = new Date(peruMs);

  const day = peru.getDay(); // 0 = Sunday, 1 = Monday ... 6 = Saturday
  const hour = peru.getHours(); // 0-23

  const opensHour = Number(BUSINESS.hours.opens.split(":")[0]);
  const closesHour = Number(BUSINESS.hours.closes.split(":")[0]);

  return BUSINESS.hours.openDays.includes(day) && hour >= opensHour && hour < closesHour;
}

export default function BusinessHoursBadge() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateOpenState = () => {
      setOpen(isBusinessOpen());
    };

    // Run right after mount without synchronous setState in effect body.
    const timeoutId = window.setTimeout(updateOpenState, 0);

    // Keep badge state in sync when hour/day changes.
    const intervalId = window.setInterval(updateOpenState, 60_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

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
