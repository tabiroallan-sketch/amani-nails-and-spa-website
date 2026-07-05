import type * as THREE from "three";

export class BottleScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private group: THREE.Group;
  private animFrameId: number;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.z = 4;
    this.camera.position.y = 0.5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xd4af37, 0.7);
    key.position.set(3, 5, 5);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xc9a86c, 0.3);
    fill.position.set(-3, 1, 2);
    this.scene.add(fill);

    this.createBottle();
    this.animate();
    this.handleResize(container);
  }

  private createBottle() {
    // Body
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xc9a86c,
      metalness: 0.3,
      roughness: 0.2,
      clearcoat: 0.5,
      transparent: true,
      opacity: 0.6,
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.6, 32), bodyMat);
    this.group.add(body);

    // Cap
    const capMat = new THREE.MeshPhysicalMaterial({
      color: 0x2c1810,
      metalness: 0.5,
      roughness: 0.3,
    });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 32), capMat);
    cap.position.y = 0.95;
    this.group.add(cap);

    // Liquid visible through glass
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0xc9a86c,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.3,
    });
    const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.2, 32), liquidMat);
    liquid.position.y = 0.1;
    this.group.add(liquid);
  }

  private animate = () => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);
    this.group.position.y = Math.sin(Date.now() * 0.0008) * 0.05;
    this.group.rotation.y += 0.005;
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
