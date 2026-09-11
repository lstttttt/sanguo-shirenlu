"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Props = HTMLMotionProps<"button"> & { children: ReactNode; tone?: "ink" | "seal" };

export function AncientButton({ children, className = "", tone = "ink", ...props }: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      className={`ancient-button ancient-button--${tone} ${className}`}
      {...props}
    >
      <span>{children}</span>
    </motion.button>
  );
}
