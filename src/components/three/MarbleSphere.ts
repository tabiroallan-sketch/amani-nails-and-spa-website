import type * as THREE from "three";

export class MarbleScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private sphere: THREE.Mesh;
  private animFrameId: number;
  private mouseX = 0;
  private mouseY = 0;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.camera.position.z = 4;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = 1;
    container.appendChild(this.renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xc9a86c, 0.9);
    dir.position.set(5, 3, 5);
    this.scene.add(dir);

    const rim = new THREE.DirectionalLight(0xf5e6d0, 0.5);
    rim.position.set(-3, -1, -4);
    this.scene.add(rim);

    const geo = new THREE.SphereGeometry(1.2, 64, 64);
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xf5e6d0,
      metalness: 0.1,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
    });
    this.sphere = new THREE.Mesh(geo, mat);
    this.scene.add(this.sphere);

    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
    });

    this.animate();
    this.handleResize(container);
  }

  private animate = () => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    this.sphere.rotation.x += (this.mouseY * 0.3 - this.sphere.rotation.x) * 0.05;
    this.sphere.rotation.y += (this.mouseX * 0.3 - this.sphere.rotation.y) * 0.05;

    this.renderer.render(this.scene, this.camera);
  };

  private handleResize(container: HTMLElement) {
    const onResize = () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);
  }

  dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}
