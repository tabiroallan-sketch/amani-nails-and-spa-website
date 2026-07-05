import { useState, useRef, useEffect, useMemo } from "preact/hooks";
import Lightbox from "./Lightbox";

interface GalleryItem {
  slug: string;
  title: string;
  category: string;
  image?: string;
  before?: string;
  after?: string;
  description?: string;
  featured?: boolean;
}

interface GalleryFilterProps {
  items: GalleryItem[];
}

const categoryConfig: Record<string, { label: string; gradient: string; icon: string }> = {
  nails: {
    label: "Nails",
    gradient: "from-rose-gold-light via-champagne to-rose-gold/20",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-1.5 0-3 1-3 3v5c0 1.5 1 3 3 3s3-1.5 3-3V6c0-2-1.5-3-3-3z"/><path d="M9 11c0 2 1.5 3 3 3s3-1 3-3"/><path d="M8 17c0-1 1-2 2-2h4c1 0 2 1 2 2v2c0 1-1 2-2 2h-4c-1 0-2-1-2-2v-2z"/></svg>`,
  },
  "nail-art": {
    label: "Nail Art",
    gradient: "from-rose-gold via-champagne-gold to-gold-leaf/15",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`,
  },
  spa: {
    label: "Spa",
    gradient: "from-sage-whisper via-champagne-light to-sage-whisper/20",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c-4-3-8-6-8-11 0-4 3.5-7.5 8-7.5S20 7 20 11c0 5-4 8-8 11z"/></svg>`,
  },
  massage: {
    label: "Massage",
    gradient: "from-sage-light via-warm-white to-sage-light/15",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 9a5 5 0 0 0-10 0c0 3 2.5 5.5 5 7 2.5-1.5 5-4 5-7z"/><path d="M7 15c0 2 2 4 5 4s5-2 5-4"/></svg>`,
  },
  interior: {
    label: "Interior",
    gradient: "from-champagne via-soft-beige to-champagne/20",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>`,
  },
  "before-after": {
    label: "Before & After",
    gradient: "from-gold-leaf-light via-champagne to-gold-leaf/15",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20M9 3v18"/></svg>`,
  },
};

const categories = [
  { id: "all", label: "All" },
  ...Object.entries(categoryConfig).map(([id, c]) => ({ id, label: c.label })),
];

export default function GalleryFilter({ items }: GalleryFilterProps) {
  const [active, setActive] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const filtered = useMemo(
    () => active === "all" ? items : items.filter((item) => item.category === active),
    [active, items]
  );

  const lightboxImages = useMemo(
    () => filtered.map((item) => ({
      src: item.image || item.after || "",
      alt: item.title,
      caption: item.description,
    })),
    [filtered]
  );

  useEffect(() => {
    const runFilters = async () => {
      const gsap = (await import("gsap")).gsap;
      const items = Array.from(itemRefs.current.values()).filter(Boolean);
      if (items.length === 0) return;

      gsap.fromTo(
        items,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: { each: 0.04, from: "start" },
          ease: "power3.out",
        }
      );
    };
    runFilters();
  }, [active]);

  useEffect(() => {
    let observer: IntersectionObserver;
    const init = async () => {
      const gsap = (await import("gsap")).gsap;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                entry.target,
                { opacity: 0, y: 40 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
              );
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px 100px 0px" }
      );

      document.querySelectorAll("[data-lazy-gallery]").forEach((el) => observer.observe(el));
    };
    init();

    return () => observer?.disconnect();
  }, [filtered]);

  const setItemRef = (slug: string) => (el: HTMLDivElement | null) => {
    if (el) itemRefs.current.set(slug, el);
    else itemRefs.current.delete(slug);
  };

  return (
    <div>
      {/* Filters */}
      <div class="flex flex-wrap justify-center gap-2 mb-12" role="tablist" aria-label="Gallery categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={active === cat.id}
            onClick={() => setActive(cat.id)}
            class={`px-5 py-2.5 rounded-full font-accent text-xs uppercase tracking-[0.12em] font-semibold transition-all duration-[var(--duration-normal)] ease-[var(--ease-luxury)] ${
              active === cat.id
                ? "bg-gold-leaf text-espresso shadow-glow-gold scale-105"
                : "bg-ivory-silk text-warm-taupe hover:bg-champagne hover:text-espresso border border-gold-leaf-light/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      {filtered.length === 0 ? (
        <div class="text-center py-20">
          <p class="font-body text-warm-taupe">No images in this category yet.</p>
        </div>
      ) : (
        <div
          ref={gridRef}
          class="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
        >
          {filtered.map((item, index) => {
            const isBeforeAfter = item.category === "before-after";
            const isFeatured = item.featured;
            const cat = categoryConfig[item.category] || categoryConfig.nails;

            return (
              <div
                key={item.slug}
                ref={setItemRef(item.slug)}
                data-lazy-gallery
                role="button"
                tabIndex={0}
                aria-label={`Open ${item.title} in lightbox`}
                class={`break-inside-avoid rounded-[var(--radius-xl)] overflow-hidden cursor-pointer group relative transition-shadow duration-[var(--duration-normal)] hover:shadow-luxury ${
                  isFeatured ? "sm:col-span-2" : ""
                }`}
                onClick={() => setLightboxIndex(index)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setLightboxIndex(index); } }}
              >
                <div class={`relative w-full ${isFeatured ? "min-h-[320px]" : "min-h-[220px]"}`}>
                  <img
                    src={item.image || item.after || ""}
                    alt={item.title}
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  {/* Category icon */}
                  <div class="absolute top-3 left-3 z-10">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ivory/80 backdrop-blur-sm font-accent text-[10px] uppercase tracking-[0.12em] text-espresso">
                      <span class="w-3 h-3" dangerouslySetInnerHTML={{ __html: cat.icon }} />
                      {cat.label}
                    </span>
                  </div>

                  {/* Featured indicator */}
                  {isFeatured && (
                    <div class="absolute top-3 right-3 z-10">
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold-leaf/90 text-espresso font-accent text-[10px] uppercase tracking-[0.1em] font-semibold">
                        Featured
                      </span>
                    </div>
                  )}

                  {/* Before/After overlay */}
                  {isBeforeAfter && (
                    <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                      <div class="flex items-center gap-3 px-4 py-2 rounded-full bg-espresso/60 backdrop-blur-sm">
                        <span class="font-accent text-[10px] uppercase tracking-[0.15em] text-ivory/80">Before</span>
                        <div class="w-6 h-px bg-gold-leaf" />
                        <span class="font-accent text-[10px] uppercase tracking-[0.15em] text-gold-leaf">After</span>
                      </div>
                    </div>
                  )}

                  {/* Content overlay */}
                  <div class="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-luxury)] flex flex-col justify-end p-5">
                    <h3 class="font-display text-lg text-ivory mb-1">{item.title}</h3>
                    {item.description && (
                      <p class="font-body text-sm text-ivory/70 line-clamp-2">{item.description}</p>
                    )}
                  </div>

                  {/* Focus ring */}
                  <div class="absolute inset-0 rounded-[var(--radius-xl)] ring-1 ring-inset ring-espresso/5 group-hover:ring-gold-leaf/20 transition-all duration-[var(--duration-normal)]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((prev) => prev !== null ? (prev - 1 + lightboxImages.length) % lightboxImages.length : 0)}
          onNext={() => setLightboxIndex((prev) => prev !== null ? (prev + 1) % lightboxImages.length : 0)}
        />
      )}
    </div>
  );
}
