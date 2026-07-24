export const pageVariants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  in: { opacity: 1, y: 0, scale: 1 },
  out: { opacity: 0, y: -40, scale: 1.02 }
};

export const pageTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20
};
