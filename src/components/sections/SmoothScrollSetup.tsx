import { useEffect, useRef } from "preact/hooks";

export default function SmoothScrollSetup() {
  const instance = useRef<any>(null);

  useEffect(() => {
    let active = true;

    const init = async () => {
      if (!active) return;

      const LenisMod = await import("lenis");
      const LenisCtor = LenisMod.default || LenisMod.Lenis;
      if (!LenisCtor) return;

      const lenis = new LenisCtor({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
      });

      instance.current = lenis;

      let gsapMod: any, ScrollTriggerMod: any;
      try {
        gsapMod = await import("gsap");
        const stMod = await import("gsap/ScrollTrigger");
        ScrollTriggerMod = stMod.ScrollTrigger;
        gsapMod.gsap.registerPlugin(ScrollTriggerMod);

        lenis.on("scroll", () => {
          ScrollTriggerMod.update();
        });

        const origRaf = lenis.raf.bind(lenis);
        lenis.raf = (time: number) => {
          origRaf(time);
          ScrollTriggerMod.update();
        };
      } catch {}

      if (!active) {
        lenis.destroy();
        return;
      }

      const raf = (time: number) => {
        if (!active) return;
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    };

    init();

    return () => {
      active = false;
      if (instance.current) {
        instance.current.destroy();
        instance.current = null;
      }
    };
  }, []);

  return null;
}
