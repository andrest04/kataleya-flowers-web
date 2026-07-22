"use client";

import { MotionConfig } from "framer-motion";
import type React from "react";

interface MotionProviderProps {
  children: React.ReactNode;
}

export function MotionProvider({
  children,
}: MotionProviderProps): React.ReactElement {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
