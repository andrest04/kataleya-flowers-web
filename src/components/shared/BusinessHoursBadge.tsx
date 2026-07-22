"use client";

import { useEffect, useState } from "react";

import { BUSINESS } from "@/lib/constants";

function isBusinessOpen(): boolean {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const peruMs = utcMs - 5 * 60 * 60 * 1_000;
  const peru = new Date(peruMs);

  const day = peru.getDay();
  const hour = peru.getHours();

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

    const timeoutId = window.setTimeout(updateOpenState, 0);

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
