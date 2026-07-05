export const loadThree = async () => {
  return await import("three");
};

export const createScene = (
  container: HTMLElement,
  setup: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => (() => void) | void
): (() => void) => {
  let cleanup: (() => void) | void;
  let animFrameId: number;

  (async () => {
    const THREE = await loadThree();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    cleanup = setup(scene, camera, renderer);

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
  })();

  return () => {
    cancelAnimationFrame(animFrameId);
    if (cleanup) cleanup();
  };
};
