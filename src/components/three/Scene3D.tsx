import { useEffect, useRef } from "preact/hooks";

interface Props {
  scene: "lotus" | "marble" | "bottle" | "silk";
  className?: string;
}

export default function Scene3D({ scene, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let instance: { dispose: () => void } | null = null;

    const init = async () => {
      const w = container.clientWidth;
      const h = container.clientHeight;

      if (w < 1 || h < 1) return;

      switch (scene) {
        case "lotus": {
          const { LotusScene } = await import("./LotusFlower");
          instance = new LotusScene(container);
          break;
        }
        case "marble": {
          const { MarbleScene } = await import("./MarbleSphere");
          instance = new MarbleScene(container);
          break;
        }
        case "bottle": {
          const { BottleScene } = await import("./NailPolishBottle");
          instance = new BottleScene(container);
          break;
        }
        case "silk": {
          const { SilkHeroScene } = await import("./SilkHero");
          instance = new SilkHeroScene(container);
          break;
        }
      }
    };

    init();

    return () => {
      instance?.dispose();
    };
  }, [scene]);

  return <div ref={containerRef} class={`w-full h-full ${className ?? ""}`} />;
}
