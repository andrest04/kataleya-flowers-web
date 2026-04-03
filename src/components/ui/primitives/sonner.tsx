"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--color-white)",
          "--normal-text": "var(--color-dark)",
          "--normal-border": "var(--color-border)",
          "--border-radius": "0.625rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
