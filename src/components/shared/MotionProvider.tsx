"use client";

import { MotionConfig } from "framer-motion";
import type React from "react";

interface MotionProviderProps {
  children: React.ReactNode;
}

// Honra prefers-reduced-motion del SO para toda animación de Framer Motion
// del proyecto (WCAG 2.3.3), sin tener que instrumentar cada componente.
export function MotionProvider({
  children,
}: MotionProviderProps): React.ReactElement {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
