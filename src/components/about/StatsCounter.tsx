import { useEffect, useRef, useState } from "preact/hooks";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

interface StatsCounterProps {
  stats: Stat[];
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [current, setCurrent] = useState(stats.map(() => 0));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || counted) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting && !counted) {
          setCounted(true);

          const gsap = (await import("gsap")).gsap;
          const targets = stats.map((_, i) => ({ val: 0 }));

          targets.forEach((obj, i) => {
            gsap.to(obj, {
              val: stats[i].value,
              duration: 2,
              ease: "power3.out",
              delay: i * 0.15,
              onUpdate: () => {
                setCurrent((prev) => {
                  const next = [...prev];
                  next[i] = Math.round(obj.val);
                  return next;
                });
              },
            });
          });

          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [stats, counted]);

  return (
    <div ref={sectionRef} class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {stats.map((stat, i) => (
        <div key={stat.label} class="text-center p-6 rounded-[var(--radius-xl)] bg-warm-white/50 border border-champagne backdrop-blur-sm">
          <p class="font-display text-[clamp(2rem,4vw,3rem)] font-semibold text-espresso leading-none">
            {stat.prefix || ""}{current[i].toLocaleString()}{stat.suffix}
          </p>
          <p class="mt-2 font-body text-sm text-warm-taupe">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
