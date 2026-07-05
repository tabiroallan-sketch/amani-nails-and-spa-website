import { useEffect, useRef } from "preact/hooks";

export default function HeroAnimation() {
  const mountRef = useRef(false);

  useEffect(() => {
    if (mountRef.current) return;
    mountRef.current = true;

    let gsap: any;
    let cleanups: (() => void)[] = [];

    const init = async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap = gsapModule.gsap;
      gsap.registerPlugin(ScrollTrigger);

      const hero = document.querySelector("[data-hero-section]");
      if (!hero) return;

      const subtitle = hero.querySelector("[data-hero-subtitle]");
      const heading = hero.querySelector("[data-hero]");
      const description = hero.querySelector("[data-hero-desc]");
      const ctaGroup = hero.querySelector("[data-hero-cta]");
      const scrollIndicator = hero.querySelector("[data-hero-scroll]");
      const overlay = hero.querySelector("[data-hero-overlay]");
      const contentLayer = hero.querySelector("[data-hero-content]");

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isMobile = window.innerWidth < 768;

      const tl = gsap.timeline({
        defaults: { ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" },
        delay: prefersReduced ? 0 : 0.3,
      });

      if (overlay) {
        tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 1.5 }, 0);
      }

      if (subtitle) {
        tl.fromTo(subtitle, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 0.2);
      }

      if (heading && !prefersReduced) {
        try {
          const { SplitText } = await import("gsap/SplitText");
          gsap.registerPlugin(SplitText);
          const split = new SplitText(heading, { type: "chars", charsClass: "hero-char" });
          gsap.set(split.chars, { y: 80, opacity: 0 });
          tl.to(split.chars, {
            y: 0, opacity: 1, duration: 0.65, stagger: 0.035,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }, 0.4);
        } catch {
          tl.fromTo(heading, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 0.4);
        }
      } else if (heading) {
        tl.fromTo(heading, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.4);
      }

      if (description) {
        tl.fromTo(description, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.9);
      }

      if (ctaGroup) {
        const buttons = Array.from(ctaGroup.children);
        tl.fromTo(buttons, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.15 }, 1.2);
      }

      if (scrollIndicator) {
        tl.fromTo(scrollIndicator, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.7);
      }

      if (!prefersReduced) {
        const floatDuration = 3;
        const floatEl = scrollIndicator?.querySelector("svg") || scrollIndicator?.querySelector("[class*='animate-float']");
        if (floatEl) {
          gsap.to(floatEl, {
            y: 6, duration: floatDuration, repeat: -1, yoyo: true,
            ease: "sine.inOut",
          });
        }
      }

      if (!prefersReduced) {
        gsap.to(hero, {
          y: () => window.innerHeight * 0.2,
          ease: "none",
          scrollTrigger: {
            trigger: hero, start: "top top", end: "bottom top", scrub: 0.8,
          },
        });
      }

      if (contentLayer && !prefersReduced) {
        const handleMove = (e: MouseEvent) => {
          const rect = hero.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
          gsap.to(contentLayer, {
            x: x * 8, y: y * 4, duration: 1.2, ease: "power2.out", overwrite: "auto",
          });
        };
        const handleLeave = () => {
          gsap.to(contentLayer, { x: 0, y: 0, duration: 1.5, ease: "power2.out" });
        };
        hero.addEventListener("mousemove", handleMove);
        hero.addEventListener("mouseleave", handleLeave);
        cleanups.push(() => {
          hero.removeEventListener("mousemove", handleMove);
          hero.removeEventListener("mouseleave", handleLeave);
        });
      }

      if (!prefersReduced && !isMobile) {
        const glows = hero.querySelectorAll("[class*='blur-3xl']");
        glows.forEach((glow: any) => {
          gsap.to(glow, {
            x: "random(-20, 20)", y: "random(-20, 20)", duration: "random(4, 7)",
            repeat: -1, yoyo: true, ease: "sine.inOut",
          });
        });
      }

      if (!prefersReduced && !isMobile) {
        const bgImage = hero.querySelector("img");
        if (bgImage) {
          gsap.to(bgImage, {
            scale: 1.08, duration: 1.5,
            scrollTrigger: {
              trigger: hero, start: "top bottom", end: "bottom top", scrub: 1.5,
            },
          });
        }
      }

      ScrollTrigger.refresh();
    };

    init();

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
