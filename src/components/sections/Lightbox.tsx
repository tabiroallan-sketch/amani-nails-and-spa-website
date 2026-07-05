import { useEffect, useRef, useCallback } from "preact/hooks";

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, currentIndex, onClose, onPrev, onNext }: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case "Escape": onClose(); break;
      case "ArrowLeft": onPrev(); break;
      case "ArrowRight": onNext(); break;
    }
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = "0";
      requestAnimationFrame(() => { overlay.style.opacity = "1"; });
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      img.style.opacity = "0";
      img.style.transform = "scale(0.95)";
      requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "scale(1)";
      });
    }
  }, [currentIndex]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      diff > 0 ? onNext() : onPrev();
    }
  };

  const current = images[currentIndex];
  if (!current) return null;

  const hasMultiple = images.length > 1;

  return (
    <div
      ref={overlayRef}
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-luxury)]"
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={onClose}
    >
      {/* Close */}
      <button
        class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center transition-all duration-[var(--duration-fast)]"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Prev */}
      {hasMultiple && (
        <button
          class="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center transition-all duration-[var(--duration-fast)]"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <div
        ref={imageRef}
        class="relative max-w-[90vw] max-h-[85vh] transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div class="w-full h-full min-w-[280px] min-h-[200px] rounded-[var(--radius-lg)] shadow-luxury overflow-hidden">
          <img
            src={current.src}
            alt={current.alt}
            class="w-full h-full object-contain"
            style={{ maxHeight: "85vh" }}
          />
        </div>
        {current.caption && (
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-center max-w-xl px-4">
            <p class="font-body text-sm text-ivory/80 bg-espresso/40 backdrop-blur-sm px-4 py-2 rounded-full">{current.caption}</p>
          </div>
        )}
      </div>

      {/* Next */}
      {hasMultiple && (
        <button
          class="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-ivory/10 hover:bg-ivory/20 text-ivory flex items-center justify-center transition-all duration-[var(--duration-fast)]"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Counter */}
      {hasMultiple && (
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 font-accent text-xs uppercase tracking-[0.15em] text-ivory/60">
          {String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>
      )}
    </div>
  );
}
