import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export const fadeInUp = (element: string | Element, delay = 0) => {
  const ctx = gsap.context(() => {
    gsap.from(element, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      delay,
      ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });
  return ctx;
};

export const staggerFadeInUp = (elements: string | Element[], stagger = 0.12) => {
  const ctx = gsap.context(() => {
    gsap.from(elements, {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger,
      ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      scrollTrigger: {
        trigger: elements,
        start: "top 85%",
        once: true,
      },
    });
  });
  return ctx;
};

export const scaleIn = (element: string | Element) => {
  const ctx = gsap.context(() => {
    gsap.from(element, {
      scale: 0.92,
      opacity: 0,
      duration: 0.7,
      ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
    });
  });
  return ctx;
};

export const heroTextReveal = (heading: string, subtitle?: string) => {
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" } });

    const headingEl = document.querySelector(heading);
    if (headingEl) {
      const split = new SplitText(headingEl, {
        type: "chars",
        charsClass: "hero-char",
      });

      gsap.set(split.chars, { y: 80, opacity: 0 });
      tl.to(split.chars, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.04,
      });
    }

    if (subtitle) {
      const subEl = document.querySelector(subtitle);
      if (subEl) {
        tl.from(subEl, { y: 30, opacity: 0, duration: 0.6 }, "-=0.2");
      }
    }
  });
  return ctx;
};

export const parallaxSection = (element: string | Element, speed = 0.3) => {
  const ctx = gsap.context(() => {
    gsap.to(element, {
      y: () => (window.innerHeight * speed),
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
  return ctx;
};

export const counterUp = (element: string | Element, target: number, suffix = "") => {
  const ctx = gsap.context(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        if (element instanceof HTMLElement) {
          element.textContent = `${Math.round(obj.val).toLocaleString()}${suffix}`;
        }
      },
    });
  });
  return ctx;
};
