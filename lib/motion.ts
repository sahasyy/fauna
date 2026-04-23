export const standardEase = [0.22, 1, 0.36, 1] as const;

export function reveal(
  delay = 0,
  y = 28,
  blur = 14,
  duration = 0.9
) {
  return {
    initial: { opacity: 0, y, filter: `blur(${blur}px)` },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      duration,
      delay,
      ease: standardEase,
    },
  };
}

export function fadeIn(delay = 0, duration = 0.7) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration,
      delay,
      ease: standardEase,
    },
  };
}

export function stepDelay(index: number, base = 0.12, step = 0.08) {
  return base + index * step;
}
