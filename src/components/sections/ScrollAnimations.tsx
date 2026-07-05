import { useEffect } from "preact/hooks";

export default function ScrollAnimations() {
  useEffect(() => {
    let gsap: any;
    let ScrollTrigger: any;
    let cleanups: (() => void)[] = [];

    const init = async () => {
      const gsapModule = await import("gsap");
      const st = await import("gsap/ScrollTrigger");
      gsap = gsapModule.gsap;
      ScrollTrigger = st.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      animateSections();
      animateStagger();
      animateHero();
      animateCounters();
      animateParallax();
      animateReveal();
      animateFAQ();
      animateDirectional();
      animateScale();
      animateBlurIn();
      animateImageReveal();
      animateSlideContent();
      ScrollTrigger.refresh();
    };

    function hasDedicatedHero() {
      return !!document.querySelector("[data-hero-section]");
    }

    function animateSections() {
      document.querySelectorAll("[data-animate]:not([data-animate-stagger])").forEach((el) => {
        if (el.closest("[data-hero-section]")) return;
        const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
        const dir = el.getAttribute("data-direction") || "up";
        const dist = 60;
        const vars: any = { opacity: 0, duration: 0.8, delay: delay / 1000, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" };
        if (dir === "up") vars.y = dist;
        else if (dir === "down") vars.y = -dist;
        else if (dir === "left") vars.x = dist;
        else if (dir === "right") vars.x = -dist;

        const ctx = gsap.context(() => {
          gsap.from(el, { ...vars, scrollTrigger: { trigger: el, start: "top 85%", once: true } });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateDirectional() {
      document.querySelectorAll("[data-fade-left]").forEach((el) => {
        const ctx = gsap.context(() => {
          gsap.from(el, {
            x: 80, opacity: 0, duration: 0.9, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
      document.querySelectorAll("[data-fade-right]").forEach((el) => {
        const ctx = gsap.context(() => {
          gsap.from(el, {
            x: -80, opacity: 0, duration: 0.9, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateScale() {
      document.querySelectorAll("[data-scale-in]").forEach((el) => {
        const ctx = gsap.context(() => {
          gsap.from(el, {
            scale: 0.88, opacity: 0, duration: 0.9, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateBlurIn() {
      document.querySelectorAll("[data-blur-in]").forEach((el) => {
        const ctx = gsap.context(() => {
          gsap.from(el, {
            filter: "blur(12px)", opacity: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateImageReveal() {
      document.querySelectorAll("[data-img-reveal]").forEach((el) => {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "overflow:hidden;display:inline-block;vertical-align:top;";
        el.parentNode?.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        const ctx = gsap.context(() => {
          gsap.set(el, { scale: 1.15, willChange: "transform" });
          gsap.from(wrapper, {
            clipPath: "inset(0 100% 0 0)", duration: 1.2, ease: "cubic-bezier(0.77, 0, 0.175, 1)",
            scrollTrigger: { trigger: wrapper, start: "top 80%", once: true },
            onComplete: () => { gsap.set(el, { willChange: "auto" }); },
          });
          gsap.to(el, {
            scale: 1, duration: 1.4, ease: "cubic-bezier(0.77, 0, 0.175, 1)",
            scrollTrigger: { trigger: wrapper, start: "top 80%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateSlideContent() {
      document.querySelectorAll("[data-slide]").forEach((el) => {
        const dir = el.getAttribute("data-slide") || "up";
        const dist = 40;
        const fromVars: any = { opacity: 0, duration: 0.7, ease: "power2.out" };
        if (dir === "up") fromVars.y = dist;
        else if (dir === "down") fromVars.y = -dist;
        else if (dir === "left") fromVars.x = dist;
        else if (dir === "right") fromVars.x = -dist;

        const ctx = gsap.context(() => {
          gsap.from(el, {
            ...fromVars, scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateStagger() {
      document.querySelectorAll("[data-animate-stagger]").forEach((parent) => {
        const children = Array.from(parent.children).filter(
          (c) => c.tagName !== "TEMPLATE"
        );
        if (children.length === 0) return;
        const ctx = gsap.context(() => {
          gsap.from(children, {
            y: 40, opacity: 0, duration: 0.6, stagger: 0.1,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: parent, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateHero() {
      if (hasDedicatedHero()) return;
      const heroHeading = document.querySelector("[data-hero]");
      if (!heroHeading) return;

      const splitText = async () => {
        const { SplitText } = await import("gsap/SplitText");
        gsap.registerPlugin(SplitText);
        const split = new SplitText(heroHeading, { type: "chars", charsClass: "hero-char" });
        gsap.set(split.chars, { y: 80, opacity: 0 });
        const ctx = gsap.context(() => {
          gsap.to(split.chars, {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.04, delay: 0.3,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          });
        });
        cleanups.push(() => ctx.revert());
      };
      splitText();
    }

    function animateCounters() {
      document.querySelectorAll("[data-counter]").forEach((el) => {
        const target = parseInt(el.getAttribute("data-counter") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";
        const obj = { val: 0 };
        const ctx = gsap.context(() => {
          gsap.to(obj, {
            val: target, duration: 2, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => {
              el.textContent = `${Math.round(obj.val).toLocaleString()}${suffix}`;
            },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateParallax() {
      document.querySelectorAll("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.getAttribute("data-parallax") || "0.3");
        const ctx = gsap.context(() => {
          gsap.to(el, {
            y: () => window.innerHeight * speed, ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateReveal() {
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        const direction = el.getAttribute("data-reveal-direction") || "right";
        const clipStart = direction === "left" ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
        const ctx = gsap.context(() => {
          gsap.from(el, {
            clipPath: clipStart, duration: 1,
            ease: "cubic-bezier(0.77, 0, 0.175, 1)",
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function animateFAQ() {
      document.querySelectorAll("details").forEach((el) => {
        el.addEventListener("toggle", () => {
          if (el.open) {
            const content = el.querySelector("div");
            if (content) {
              gsap.fromTo(content,
                { opacity: 0, y: -10, height: 0 },
                { opacity: 1, y: 0, height: "auto", duration: 0.35, ease: "power2.out" }
              );
            }
          }
        });
      });
    }

    init();

    return () => {
      cleanups.forEach((fn) => fn());
      if (ScrollTrigger) {
        ScrollTrigger.getAll().forEach((st: any) => st.kill());
      }
    };
  }, []);

  return null;
}
