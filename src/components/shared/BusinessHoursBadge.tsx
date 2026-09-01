"use client";

import { useEffect, useState } from "react";

import { isOpenNow, type SiteHours } from "@/lib/siteSettings";

interface BusinessHoursBadgeProps {
  hours: SiteHours;
}

export default function BusinessHoursBadge({ hours }: BusinessHoursBadgeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const updateOpenState = () => {
      setOpen(isOpenNow(hours));
    };

    const timeoutId = window.setTimeout(updateOpenState, 0);

    const intervalId = window.setInterval(updateOpenState, 60_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [hours]);

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
