import { useRef, useEffect, useState } from "preact/hooks";

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const categoryGradients: Record<string, string> = {
  nails: "from-rose-gold-light via-champagne to-rose-gold/20",
  "nail-art": "from-rose-gold via-champagne-gold to-gold-leaf/15",
  spa: "from-sage-whisper via-champagne-light to-sage-whisper/20",
  massage: "from-sage-light via-warm-white to-sage-light/15",
  interior: "from-champagne via-soft-beige to-champagne/20",
  "before-after": "from-gold-leaf-light via-champagne to-gold-leaf/15",
  team: "from-champagne-light via-warm-white to-champagne/20",
};

export default function BeforeAfter({ beforeImage, afterImage, title, beforeLabel = "Before", afterLabel = "After" }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [position, setPosition] = useState(50);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getPosition = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * 100;
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      setPosition(getPosition(e));
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      setPosition(getPosition(e));
    };

    const onEnd = () => { isDraggingRef.current = false; };

    container.addEventListener("mousedown", onStart);
    container.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      container.removeEventListener("mousedown", onStart);
      container.removeEventListener("touchstart", onStart);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      class="group relative w-full overflow-hidden rounded-[var(--radius-xl)] select-none cursor-ew-resize"
      style={{ aspectRatio: "4 / 3" }}
    >
      {/* Before (full image) */}
      <img
        src={beforeImage}
        alt={`${title} - ${beforeLabel}`}
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div class="absolute top-4 left-4 z-10">
        <span class="inline-block px-3 py-1 rounded-full bg-espresso/60 backdrop-blur-sm font-accent text-[10px] uppercase tracking-[0.15em] text-ivory">{beforeLabel}</span>
      </div>

      {/* After (clipped) */}
      <div
        class="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={afterImage}
          alt={`${title} - ${afterLabel}`}
          class="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div class="absolute top-4 right-4 z-10">
          <span class="inline-block px-3 py-1 rounded-full bg-gold-leaf/80 backdrop-blur-sm font-accent text-[10px] uppercase tracking-[0.15em] text-espresso">{afterLabel}</span>
        </div>
      </div>

      {/* Slider Handle */}
      <div
        ref={sliderRef}
        class="absolute top-0 bottom-0 w-0.5 z-20 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ivory shadow-luxury flex items-center justify-center transition-transform duration-[var(--duration-fast)] ease-[var(--ease-luxury)] group-hover:scale-110">
          <svg class="w-4 h-4 text-espresso" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 6 15 12 9 18" />
          </svg>
        </div>
      </div>
    </div>
  );
}
