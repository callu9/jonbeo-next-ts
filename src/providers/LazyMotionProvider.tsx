// src/providers/LazyMotionProvider.tsx

"use client";

import { LazyMotion } from "motion/react";

const loadFeatures = () => import("@/lib/feature").then((res) => res.default);

export default function LazyMotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
