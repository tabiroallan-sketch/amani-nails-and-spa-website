import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface FadeUpOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  scrollTrigger?: boolean;
  trigger?: string | Element;
  start?: string;
}

export function fadeUp(elements: string | Element | Element[], opts: FadeUpOptions = {}) {
  const {
    y = 30,
    duration = 0.8,
    delay = 0,
    stagger = 0.15,
    ease = "power3.out",
    scrollTrigger = false,
    trigger,
    start = "top 85%",
  } = opts;

  const targets = typeof elements === "string" ? gsap.utils.toArray(elements) : Array.isArray(elements) ? elements : [elements];

  const config: gsap.TweenVars = {
    y,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease,
  };

  if (scrollTrigger || trigger) {
    (config as any).scrollTrigger = {
      trigger: trigger || targets[0],
      start,
      toggleActions: "play none none reverse",
    };
  }

  return gsap.from(targets, config);
}

export interface StaggerOptions {
  from?: "start" | "end" | "center" | "edges" | "random";
  each?: number;
  duration?: number;
  ease?: string;
  scrollTrigger?: boolean;
  start?: string;
}

export function staggerIn(
  elements: string | Element[],
  opts: StaggerOptions = {}
) {
  const {
    from = "start",
    each = 0.08,
    duration = 0.6,
    ease = "power2.out",
    scrollTrigger = false,
    start = "top 85%",
  } = opts;

  const targets = typeof elements === "string" ? gsap.utils.toArray(elements) : elements;

  const config: gsap.TweenVars = {
    y: 20,
    opacity: 0,
    duration,
    stagger: { from, each },
    ease,
  };

  if (scrollTrigger) {
    (config as any).scrollTrigger = {
      trigger: targets[0],
      start,
      toggleActions: "play none none reverse",
    };
  }

  return gsap.from(targets, config);
}

export interface CounterOptions {
  startValue?: number;
  endValue: number;
  duration?: number;
  ease?: string;
  onUpdate?: (value: number) => void;
}

export function animateCounter(
  element: string | Element,
  opts: CounterOptions
) {
  const { startValue = 0, endValue, duration = 2, ease = "power2.out", onUpdate } = opts;

  const target = typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  const obj = { value: startValue };

  return gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      const val = Math.round(obj.value);
      if (onUpdate) {
        onUpdate(val);
      } else {
        target.textContent = val.toLocaleString();
      }
    },
  });
}

export interface ParallaxOptions {
  speed?: number;
  scrub?: number;
}

export function parallaxScroll(
  elements: string | Element[],
  opts: ParallaxOptions = {}
) {
  const { speed = 0.5, scrub = 1 } = opts;

  const targets = typeof elements === "string" ? gsap.utils.toArray(elements) : elements;

  targets.forEach((el: any) => {
    gsap.to(el, {
      y: () => -(el.offsetHeight * speed),
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub,
        invalidateOnRefresh: true,
      },
    });
  });
}

export interface HoverLiftOptions {
  lift?: number;
  shadow?: boolean;
  scale?: number;
  duration?: number;
  ease?: string;
}

export function hoverLift(
  element: string | Element,
  opts: HoverLiftOptions = {}
) {
  const { lift = -4, shadow = true, scale = 1.02, duration = 0.4, ease = "power2.out" } = opts;

  const target = typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  const tl = gsap.to(target, {
    y: lift,
    scale,
    boxShadow: shadow ? "0 8px 30px rgba(44, 24, 16, 0.12)" : undefined,
    duration,
    ease,
    paused: true,
  });

  target.addEventListener("mouseenter", () => tl.play());
  target.addEventListener("mouseleave", () => tl.reverse());

  return tl;
}

export interface TextRevealOptions {
  type?: "chars" | "words" | "lines";
  duration?: number;
  stagger?: number;
  ease?: string;
  scrollTrigger?: boolean;
  start?: string;
}

export function textReveal(
  element: string | Element,
  opts: TextRevealOptions = {}
) {
  const {
    type = "words",
    duration = 0.6,
    stagger = 0.04,
    ease = "power2.out",
    scrollTrigger = false,
    start = "top 85%",
  } = opts;

  const target = typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  const text = target.textContent || "";
  target.textContent = "";

  const split = type === "chars"
    ? text.split("")
    : text.split(" ");

  const wrapper = document.createElement("div");
  wrapper.style.overflow = "hidden";

  const spans = split.map((part) => {
    const span = document.createElement("span");
    span.textContent = part === " " && type === "chars" ? "\u00A0" : part + (type === "words" ? "\u00A0" : "");
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.style.transform = "translateY(100%)";
    wrapper.appendChild(span);
    return span;
  });

  target.appendChild(wrapper);

  const config: gsap.TweenVars = {
    y: 0,
    opacity: 1,
    duration,
    stagger,
    ease,
  };

  if (scrollTrigger) {
    (config as any).scrollTrigger = {
      trigger: target,
      start,
      toggleActions: "play none none reverse",
    };
  }

  return gsap.to(spans, config);
}

export interface RippleOptions {
  color?: string;
  duration?: number;
}

export function createRipple(
  element: string | Element,
  opts: RippleOptions = {}
) {
  const { color = "rgba(201, 168, 108, 0.3)", duration = 0.6 } = opts;

  const target = typeof element === "string" ? document.querySelector(element) : element;
  if (!target) return;

  target.addEventListener("click", (e: Event) => {
    const el = target as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mouseEvent = e as MouseEvent;
    const x = mouseEvent.clientX - rect.left;
    const y = mouseEvent.clientY - rect.top;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: ${color};
      pointer-events: none;
      width: 20px;
      height: 20px;
      left: ${x - 10}px;
      top: ${y - 10}px;
      transform: scale(0);
    `;

    el.style.position = "relative";
    el.style.overflow = "hidden";
    el.appendChild(ripple);

    gsap.to(ripple, {
      scale: 15,
      opacity: 0,
      duration,
      ease: "power2.out",
      onComplete: () => ripple.remove(),
    });
  });
}

export function cleanupScrollTriggers() {
  ScrollTrigger.getAll().forEach((st) => st.kill());
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
