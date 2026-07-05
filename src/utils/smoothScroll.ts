import Lenis from "lenis";

let lenis: Lenis | null = null;

export const initSmoothScroll = (): Lenis => {
  if (lenis) return lenis;

  lenis = new Lenis({
    lerp: 0.08,
    wheelMultiplier: 1,
    smoothWheel: true,
    touchMultiplier: 1.5,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  };

  requestAnimationFrame(raf);

  return lenis;
};

export const destroySmoothScroll = () => {
  lenis?.destroy();
  lenis = null;
};
