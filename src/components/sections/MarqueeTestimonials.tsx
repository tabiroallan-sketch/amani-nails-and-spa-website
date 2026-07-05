import { useEffect, useRef } from "preact/hooks";

const testimonials = [
  { text: "The most exquisite spa experience in Nairobi. From the moment I walked in, I felt transported.", author: "Grace M.", location: "Westlands" },
  { text: "Faith is a magician with eyebrows. I've never felt more confident. Amani is now my sanctuary.", author: "Amina K.", location: "Lavington" },
  { text: "The deep tissue massage released tension I'd been carrying for months. James has healing hands.", author: "David N.", location: "Kilimani" },
  { text: "My bridal package was flawless. Every detail — from the champagne to the gel manicure — was perfect.", author: "Wanjiku M.", location: "Runda" },
  { text: "Nairobi has needed a place like this. World-class service, genuine warmth, impeccable taste.", author: "Susan W.", location: "Karen" },
  { text: "The attention to hygiene and precision during my nose piercing put me completely at ease.", author: "Zahara A.", location: "Parklands" },
];

export default function MarqueeTestimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animFrameId: number;
    let pos = 0;
    const speed = 0.5;

    const animate = () => {
      pos -= speed;
      const half = track.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      track.style.transform = `translateX(${pos}px)`;
      animFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const doubled = [...testimonials, ...testimonials];

  return (
    <div class="overflow-hidden py-8">
      <div ref={trackRef} class="flex gap-8 will-change-transform" style="width: fit-content;">
        {doubled.map((t, i) => (
          <div
            key={i}
            class="flex-shrink-0 w-[350px] lg:w-[400px] p-6 rounded-[var(--radius-card)] glass"
          >
            <p class="font-display text-base italic text-espresso leading-relaxed">
              "{t.text}"
            </p>
            <p class="mt-3 font-body text-sm font-medium text-gold-leaf">
              — {t.author}, {t.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
