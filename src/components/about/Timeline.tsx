import { useEffect, useRef } from "preact/hooks";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  side: "left" | "right";
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const init = async () => {
      const gsap = (await import("gsap")).gsap;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const cards = el.querySelectorAll("[data-timeline-card]");
      const line = el.querySelector("[data-timeline-line]");

      // Animate the vertical line
      if (line) {
        gsap.fromTo(
          line,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 1.5,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: el,
              start: "top 70%",
              end: "bottom 30%",
              scrub: 1,
            },
          }
        );
      }

      // Animate each card on scroll
      cards.forEach((card, i) => {
        const direction = card.getAttribute("data-side");
        const x = direction === "right" ? 60 : -60;

        gsap.fromTo(
          card,
          { opacity: 0, x, y: 30 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              once: true,
            },
          }
        );
      });
    };

    init();
  }, []);

  return (
    <div ref={sectionRef} class="relative max-w-3xl mx-auto">
      {/* Vertical line */}
      <div
        data-timeline-line
        class="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-leaf via-champagne-gold to-gold-leaf/20 -translate-x-1/2 hidden md:block"
      />

      <div class="space-y-12 md:space-y-16">
        {events.map((event, i) => (
          <div
            key={i}
            data-timeline-card
            data-side={event.side}
            class={`relative flex flex-col md:flex-row items-start gap-6 ${
              event.side === "right" ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* Year badge (desktop: on the line) */}
            <div class="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10 w-14 h-14 rounded-full bg-espresso border-2 border-gold-leaf items-center justify-center">
              <span class="font-accent text-xs font-bold text-gold-leaf">{event.year}</span>
            </div>

            {/* Content card */}
            <div class={`flex-1 ${event.side === "left" ? "md:pr-16 md:text-right" : "md:pl-16"} ${event.side === "right" ? "md:text-left" : ""}`}>
              {/* Year badge (mobile) */}
              <span class="md:hidden inline-flex items-center gap-2 px-3 py-1 rounded-full bg-espresso border border-gold-leaf mb-3">
                <span class="font-accent text-xs font-bold text-gold-leaf">{event.year}</span>
              </span>

              <div class="p-5 rounded-[var(--radius-lg)] bg-warm-white border border-champagne shadow-soft hover:shadow-elevated transition-shadow duration-[var(--duration-normal)]">
                <h3 class="font-display text-lg font-semibold text-espresso">{event.title}</h3>
                <p class="mt-2 font-body text-sm text-warm-taupe leading-relaxed">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
