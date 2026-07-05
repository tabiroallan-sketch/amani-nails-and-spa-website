import { useEffect, useRef } from "preact/hooks";

export default function AnimationEffects() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    let gsap: any;
    let ScrollTrigger: any;
    let cleanups: (() => void)[] = [];

    const loadDeps = async () => {
      const gsapMod = await import("gsap");
      const stMod = await import("gsap/ScrollTrigger");
      const spMod = await import("gsap/ScrollToPlugin");
      gsap = gsapMod.gsap;
      ScrollTrigger = stMod.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger, spMod.ScrollToPlugin);
      return { gsap, ScrollTrigger };
    };

    const init = async () => {
      const deps = await loadDeps();
      gsap = deps.gsap;
      ScrollTrigger = deps.ScrollTrigger;

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobile = window.innerWidth < 768;

      if (!prefersReduced) {
        initScrollProgress(gsap);
        initBackToTop(gsap);
        initTextSplits(gsap, ScrollTrigger);
        initCardTilt();
        initButtonRipple(gsap);
        initButtonMagnetic(gsap, isTouch);
        initNavAnimations(gsap, ScrollTrigger);
        initImageZoom(gsap, ScrollTrigger);
        initTimelineAnimations(gsap, ScrollTrigger);
        initFooterReveal(gsap, ScrollTrigger);
        initMicroInteractions(gsap);

        if (!isTouch && !isMobile) {
          initCustomCursor();
        }

        initTestimonialAnimations(gsap, ScrollTrigger);
        initLoadingSequence(gsap);
        initPageTransition(gsap);
      }

      ScrollTrigger.refresh();
      window.addEventListener("resize", () => { ScrollTrigger?.refresh(); });
    };

    function initScrollProgress(gsap: any) {
      const bar = document.createElement("div");
      bar.id = "scroll-progress";
      bar.style.cssText = `position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#c9a86c,#d4af37,#c9a86c);z-index:9999;transform-origin:left;scaleX:0;will-change:transform;pointer-events:none;`;
      document.body.appendChild(bar);
      cleanups.push(() => bar.remove());

      gsap.to(bar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }

    function initBackToTop(gsap: any) {
      const btn = document.createElement("button");
      btn.id = "back-to-top";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>`;
      btn.style.cssText = `position:fixed;bottom:100px;right:24px;z-index:9998;width:44px;height:44px;border-radius:50%;background:#c9a86c;color:#2c1810;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(201,168,108,0.3);opacity:0;visibility:hidden;transform:translateY(20px);transition:opacity 0.3s,visibility 0.3s,transform 0.3s;`;
      document.body.appendChild(btn);
      cleanups.push(() => btn.remove());

      ScrollTrigger.create({
        start: "top -200px",
        onEnter: () => {
          btn.style.opacity = "1";
          btn.style.visibility = "visible";
          btn.style.transform = "translateY(0)";
        },
        onLeaveBack: () => {
          btn.style.opacity = "0";
          btn.style.visibility = "hidden";
          btn.style.transform = "translateY(20px)";
        },
      });

      btn.addEventListener("click", () => {
        gsap.to(window, { duration: 1.2, scrollTo: { y: 0, autoKill: false }, ease: "power3.inOut" });
      });

      btn.addEventListener("mouseenter", () => {
        gsap.to(btn, { y: -3, duration: 0.3, ease: "power2.out" });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, { y: 0, duration: 0.3, ease: "power2.out" });
      });
    }

    async function initTextSplits(gsap: any, ScrollTrigger: any) {
      const els = document.querySelectorAll("[data-text-split]");
      if (!els.length) return;

      let SplitText: any;
      try {
        const mod = await import("gsap/SplitText");
        SplitText = mod.SplitText;
        gsap.registerPlugin(SplitText);
      } catch {
        return;
      }

      els.forEach((el) => {
        const type = el.getAttribute("data-text-split") || "words";
        const stagger = parseFloat(el.getAttribute("data-stagger") || "0.04");
        const delay = parseFloat(el.getAttribute("data-delay") || "0");

        if (el.closest("[data-hero-section]")) return;

        const split = new SplitText(el, {
          type: type as "chars" | "words" | "lines",
          charsClass: "split-char",
          wordsClass: "split-word",
          linesClass: "split-line",
        });

        const targets = split[type === "chars" ? "chars" : type === "lines" ? "lines" : "words"];
        if (!targets || !targets.length) return;

        gsap.set(targets, { y: 40, opacity: 0, rotateX: -15 });

        const ctx = gsap.context(() => {
          gsap.to(targets, {
            y: 0, opacity: 1, rotateX: 0, duration: 0.7, stagger,
            delay, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function initCardTilt() {
      document.querySelectorAll("[data-card-tilt]").forEach((el) => {
        const card = el as HTMLElement;
        const maxTilt = parseFloat(card.getAttribute("data-tilt-max") || "8");

        card.style.perspective = "1200px";
        card.style.transformStyle = "preserve-3d";
        card.style.willChange = "transform";

        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          const tiltX = (y - 0.5) * maxTilt * -1;
          const tiltY = (x - 0.5) * maxTilt;
          card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`;
        };

        const handleLeave = () => {
          card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
          card.style.transition = "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          setTimeout(() => { card.style.transition = ""; }, 500);
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);
        cleanups.push(() => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        });
      });
    }

    function initButtonRipple(gsap: any) {
      document.querySelectorAll("[data-btn-ripple]").forEach((el) => {
        const btn = el as HTMLElement;
        btn.style.position = "relative";
        btn.style.overflow = "hidden";

        btn.addEventListener("click", (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const ripple = document.createElement("span");
          const size = Math.max(rect.width, rect.height) * 1.2;
          ripple.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.25);pointer-events:none;width:${size}px;height:${size}px;left:${x - size/2}px;top:${y - size/2}px;transform:scale(0);`;
          btn.appendChild(ripple);

          gsap.to(ripple, {
            scale: 1, opacity: 0, duration: 0.6, ease: "power2.out",
            onComplete: () => ripple.remove(),
          });
        });
      });
    }

    function initButtonMagnetic(gsap: any, isTouch: boolean) {
      if (isTouch) return;

      document.querySelectorAll("[data-btn-magnetic]").forEach((el) => {
        const btn = el as HTMLElement;
        const strength = parseFloat(btn.getAttribute("data-magnetic-strength") || "0.3");

        btn.addEventListener("mousemove", (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * strength;
          const y = (e.clientY - rect.top - rect.height / 2) * strength;
          gsap.to(btn, { x, y, duration: 0.4, ease: "power2.out", overwrite: "auto" });
        });

        btn.addEventListener("mouseleave", () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
        });
      });
    }

    function initNavAnimations(gsap: any, ScrollTrigger: any) {
      const header = document.querySelector("header");
      if (!header) return;

      const navHeight = header.offsetHeight;
      const brand = header.querySelector("a[aria-label]");
      const navItems = header.querySelectorAll("nav a, nav button");
      const mobileBtn = header.querySelector("[class*='lg:hidden'] button");

      ScrollTrigger.create({
        start: "top -50",
        onUpdate: (self: any) => {
          const progress = Math.min(self.progress * 2, 1);
          header.style.backdropFilter = `blur(${4 + progress * 8}px)`;
          header.style.backgroundColor = progress > 0.3
            ? "rgba(250, 245, 240, 0.92)"
            : "rgba(250, 245, 240, 0.7)";
          header.style.borderBottom = progress > 0.1
            ? "1px solid rgba(201, 168, 108, 0.15)"
            : "1px solid transparent";
          if (progress > 0.1) {
            header.style.boxShadow = "0 1px 20px rgba(44, 24, 16, 0.06)";
          } else {
            header.style.boxShadow = "none";
          }
        },
      });

      navItems.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, { y: -1, duration: 0.2, ease: "power2.out" });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(link, { y: 0, duration: 0.2, ease: "power2.out" });
        });
      });

      if (mobileBtn) {
        const spans = mobileBtn.querySelectorAll("span, div");
        mobileBtn.addEventListener("click", () => {
          const isOpen = mobileBtn.getAttribute("aria-expanded") === "true";
          spans.forEach((span: any, i: number) => {
            if (i === 1) {
              gsap.to(span, { scaleX: isOpen ? 1 : 0, duration: 0.3, ease: "power2.out" });
            } else if (i === 0) {
              gsap.to(span, { rotate: isOpen ? 0 : 45, y: isOpen ? 0 : spans[1]?.offsetHeight || 6, duration: 0.3, ease: "power2.out" });
            } else if (i === 2) {
              gsap.to(span, { rotate: isOpen ? 0 : -45, y: isOpen ? 0 : -(spans[1]?.offsetHeight || 6), duration: 0.3, ease: "power2.out" });
            }
          });
        });
      }

      const mobileMenu = header.querySelector("[class*='lg:hidden'] ~ div, [class*='mobile']");
      if (mobileMenu) {
        const menuEl = mobileMenu as HTMLElement;
        const origDisplay = menuEl.style.display;
        menuEl.style.display = "";
        const origHeight = menuEl.offsetHeight + "px";
        menuEl.style.height = "0";
        menuEl.style.overflow = "hidden";
        menuEl.style.transition = "height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.3s ease";
        menuEl.style.opacity = "0";

        mobileBtn?.addEventListener("click", () => {
          const isOpen = mobileBtn.getAttribute("aria-expanded") === "true";
          if (isOpen) {
            menuEl.style.height = "0";
            menuEl.style.opacity = "0";
          } else {
            menuEl.style.height = origHeight;
            menuEl.style.opacity = "1";
          }
        });
      }
    }

    function initImageZoom(gsap: any, ScrollTrigger: any) {
      document.querySelectorAll("[data-img-zoom]").forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;

        const ctx = gsap.context(() => {
          gsap.fromTo(img,
            { scale: 1.12, willChange: "transform" },
            {
              scale: 1, duration: 1.4, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              scrollTrigger: { trigger: el, start: "top 85%", once: true },
              onComplete: () => { gsap.set(img, { willChange: "auto" }); },
            }
          );
        });
        cleanups.push(() => ctx.revert());
      });

      document.querySelectorAll("[data-img-parallax]").forEach((el) => {
        const img = el.querySelector("img");
        if (!img) return;

        const speed = parseFloat(el.getAttribute("data-img-parallax") || "0.15");
        const ctx = gsap.context(() => {
          gsap.to(img, {
            y: () => -(el.scrollHeight * speed),
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function initTimelineAnimations(gsap: any, ScrollTrigger: any) {
      const timeline = document.querySelector("[data-timeline]");
      if (!timeline) return;

      const line = timeline.querySelector("[data-timeline-line]");
      const markers = timeline.querySelectorAll("[data-timeline-marker]");
      const steps = timeline.querySelectorAll("[data-timeline-step]");

      if (line) {
        gsap.set(line, { scaleY: 0, transformOrigin: "top center" });
        const ctx = gsap.context(() => {
          gsap.to(line, {
            scaleY: 1, duration: 1.5, ease: "cubic-bezier(0.77, 0, 0.175, 1)",
            scrollTrigger: { trigger: timeline, start: "top 80%", end: "bottom 20%", scrub: 1.5 },
          });
        });
        cleanups.push(() => ctx.revert());
      }

      markers.forEach((marker) => {
        gsap.set(marker, { scale: 0, opacity: 0 });
        const ctx = gsap.context(() => {
          gsap.to(marker, {
            scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)",
            scrollTrigger: { trigger: marker, start: "top 80%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });

      steps.forEach((step) => {
        const ctx = gsap.context(() => {
          gsap.from(step, {
            x: -30, opacity: 0, duration: 0.7, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: step, start: "top 80%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());
      });
    }

    function initFooterReveal(gsap: any, ScrollTrigger: any) {
      const footer = document.querySelector("footer");
      if (!footer) return;

      const cols = footer.querySelectorAll("[class*='grid'] > div");
      const socials = footer.querySelectorAll("a[aria-label]");
      const bottom = footer.querySelector("[class*='border-t']");

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: footer, start: "top 90%", once: true },
        });

        tl.from(footer, { y: 40, opacity: 0, duration: 0.6, ease: "power2.out" }, 0);

        if (cols.length) {
          tl.from(cols, { y: 30, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, "-=0.3");
        }

        if (socials.length) {
          tl.from(socials, {
            y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power2.out",
          }, "-=0.2");
        }

        if (bottom) {
          tl.from(bottom, { y: 15, opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.2");
        }
      });
      cleanups.push(() => ctx.revert());
    }

    function initMicroInteractions(gsap: any) {
      document.querySelectorAll("a[href], button:not([data-no-hover])").forEach((el) => {
        const isBtn = el.matches("a[class*='btn'], a[class*='button'], button, a[class*='px-']");
        if (!isBtn) return;

        el.addEventListener("mouseenter", () => {
          gsap.to(el, { y: -2, duration: 0.25, ease: "power2.out" });
        });
        el.addEventListener("mouseleave", () => {
          gsap.to(el, { y: 0, duration: 0.3, ease: "power2.out" });
        });
      });

      document.querySelectorAll("input, textarea, select").forEach((el) => {
        el.addEventListener("focus", () => {
          const wrapper = el.closest("div");
          if (!wrapper) return;
          gsap.to(wrapper, { boxShadow: "0 0 0 2px rgba(201,168,108,0.3)", duration: 0.3, ease: "power2.out" });
        });
        el.addEventListener("blur", () => {
          const wrapper = el.closest("div");
          if (!wrapper) return;
          gsap.to(wrapper, { boxShadow: "0 0 0 0px rgba(201,168,108,0)", duration: 0.3, ease: "power2.out" });
        });
      });
    }

    function initCustomCursor() {
      const cursor = document.createElement("div");
      cursor.id = "custom-cursor";
      cursor.style.cssText = `position:fixed;pointer-events:none;z-index:99999;width:12px;height:12px;border-radius:50%;background:#c9a86c;mix-blend-mode:normal;transform:translate(-50%,-50%);will-change:transform;transition:width 0.3s,height 0.3s,background 0.3s;opacity:0;`;

      const follower = document.createElement("div");
      follower.id = "cursor-follower";
      follower.style.cssText = `position:fixed;pointer-events:none;z-index:99998;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(201,168,108,0.4);transform:translate(-50%,-50%);will-change:transform;transition:width 0.3s,height 0.3s,border-color 0.3s;opacity:0;`;

      document.body.appendChild(cursor);
      document.body.appendChild(follower);

      document.body.style.cursor = "none";
      const styleEl = document.createElement("style");
      styleEl.textContent = `a,button,input,textarea,select,[role="button"],[tabindex]:not([tabindex="-1"]){cursor:none!important}`;
      document.head.appendChild(styleEl);

      let mouseX = 0, mouseY = 0;
      let followerX = 0, followerY = 0;

      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
        cursor.style.opacity = "1";
        follower.style.opacity = "1";
      });

      const animateFollower = () => {
        followerX += (mouseX - followerX) * 0.12;
        followerY += (mouseY - followerY) * 0.12;
        follower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;
        requestAnimationFrame(animateFollower);
      };
      animateFollower();

      document.addEventListener("mouseleave", () => {
        cursor.style.opacity = "0";
        follower.style.opacity = "0";
      });
      document.addEventListener("mouseenter", () => {
        cursor.style.opacity = "1";
        follower.style.opacity = "1";
      });

      const interactiveEls = document.querySelectorAll("a, button, input, textarea, select, [data-card-tilt], [role='button']");
      interactiveEls.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          cursor.style.width = "20px";
          cursor.style.height = "20px";
          cursor.style.background = "rgba(201,168,108,0.3)";
          follower.style.width = "48px";
          follower.style.height = "48px";
          follower.style.borderColor = "rgba(201,168,108,0.6)";
        });
        el.addEventListener("mouseleave", () => {
          cursor.style.width = "12px";
          cursor.style.height = "12px";
          cursor.style.background = "#c9a86c";
          follower.style.width = "36px";
          follower.style.height = "36px";
          follower.style.borderColor = "rgba(201,168,108,0.4)";
        });
      });

      cleanups.push(() => {
        cursor.remove();
        follower.remove();
        styleEl.remove();
        document.body.style.cursor = "";
      });
    }

    function initTestimonialAnimations(gsap: any, ScrollTrigger: any) {
      const testimonials = document.querySelectorAll("[data-testimonial-card]");
      if (!testimonials.length) return;

      testimonials.forEach((card, i) => {
        const ctx = gsap.context(() => {
          gsap.from(card, {
            y: 30, opacity: 0, scale: 0.95, duration: 0.7, delay: i * 0.15,
            ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            scrollTrigger: { trigger: card, start: "top 85%", once: true },
          });
        });
        cleanups.push(() => ctx.revert());

        card.addEventListener("mouseenter", () => {
          gsap.to(card, { y: -8, scale: 1.02, duration: 0.4, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" });
        });
      });

      const marquee = document.querySelector("[data-marquee]");
      if (marquee) {
        const cards = marquee.querySelectorAll("[class*='testimonial'], [class*='card']");
        if (cards.length) {
          [...cards].forEach((card, i) => {
            gsap.set(card, { opacity: 0, x: 60 + i * 20 });
            const ctx = gsap.context(() => {
              gsap.to(card, {
                opacity: 1, x: 0, duration: 0.8, delay: i * 0.1,
                ease: "power3.out",
                scrollTrigger: { trigger: card, start: "top 85%", once: true },
              });
            });
            cleanups.push(() => ctx.revert());
          });
        }
      }
    }

    function initLoadingSequence(gsap: any) {
      const existing = document.getElementById("page-loader");
      if (existing) return;

      const loader = document.createElement("div");
      loader.id = "page-loader";
      loader.innerHTML = `<div class="loader-inner"><div class="loader-logo">Amani</div><div class="loader-bar"><div class="loader-bar-fill"></div></div></div>`;
      loader.style.cssText = `position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:#faf5f0;flex-direction:column;`;

      const style = document.createElement("style");
      style.textContent = `
        .loader-inner{text-align:center;}
        .loader-logo{font-family:'Playfair Display',serif;font-size:2.5rem;font-weight:600;color:#2c1810;letter-spacing:-0.02em;margin-bottom:24px;}
        .loader-bar{width:120px;height:2px;background:rgba(201,168,108,0.2);border-radius:2px;overflow:hidden;margin:0 auto;}
        .loader-bar-fill{height:100%;width:0%;background:linear-gradient(90deg,#c9a86c,#d4af37);border-radius:2px;}
      `;
      document.head.appendChild(style);
      document.body.appendChild(loader);

      const fill = loader.querySelector(".loader-bar-fill");
      const logo = loader.querySelector(".loader-logo");

      if (fill) {
        gsap.to(fill, {
          width: "100%", duration: 1.5, ease: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          onComplete: () => {
            gsap.to(logo, { y: -20, opacity: 0, duration: 0.3, ease: "power2.in" });
            gsap.to(loader, {
              yPercent: -100, duration: 0.8, delay: 0.1, ease: "cubic-bezier(0.77, 0, 0.175, 1)",
              onComplete: () => { loader.remove(); style.remove(); },
            });
          },
        });
      }

      cleanups.push(() => { loader.remove(); style.remove(); });
    }

    function initPageTransition(gsap: any) {
      const transition = document.createElement("div");
      transition.id = "page-transition";
      transition.style.cssText = `position:fixed;inset:0;z-index:99999;pointer-events:none;background:#2c1810;transform:translateY(-100%);`;
      document.body.appendChild(transition);
      cleanups.push(() => transition.remove());

      document.querySelectorAll("a[href]:not([target='_blank']):not([href^='#']):not([href^='tel:']):not([href^='mailto:']):not([href^='wa.me']):not([href*='javascript'])").forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http") || href.includes("wa.me")) return;

        link.addEventListener("click", (e) => {
          e.preventDefault();
          const dest = href;

          gsap.to(transition, {
            y: "0%", duration: 0.5, ease: "cubic-bezier(0.77, 0, 0.175, 1)",
            onComplete: () => { window.location.href = dest; },
          });
        });
      });

      window.addEventListener("pageshow", () => {
        gsap.set(transition, { y: "-100%" });
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
