import type * as THREE from "three";

export class LotusScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particles: THREE.Points | null = null;
  private group: THREE.Group;
  private animFrameId: number;
  private isDisposed = false;

  constructor(container: HTMLElement) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.z = 5;
    this.camera.position.y = 0.5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.setupLighting();
    this.createLotus();
    this.createParticles();
    this.animate();
    this.handleResize(container);
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xc9a86c, 0.8);
    dir.position.set(5, 10, 7);
    this.scene.add(dir);

    const back = new THREE.DirectionalLight(0xf5e6d0, 0.4);
    back.position.set(-5, 0, -5);
    this.scene.add(back);
  }

  private createLotus() {
    const petalCount = 12;
    const geometry = new THREE.SphereGeometry(1, 24, 24);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf5e6d0,
      metalness: 0.1,
      roughness: 0.3,
      transparent: true,
      opacity: 0.7,
      clearcoat: 0.2,
    });
    const core = new THREE.Mesh(geometry, material);
    core.scale.set(0.8, 0.3, 0.8);
    core.position.y = -0.2;
    this.group.add(core);

    const petalMat = new THREE.MeshPhysicalMaterial({
      color: 0xc9a86c,
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.5,
      side: 2,
    });
    const petalGeo = new THREE.SphereGeometry(0.5, 12, 12);

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.scale.set(1.2, 0.15, 0.6);
      petal.position.set(Math.sin(angle) * 1.2, -0.1, Math.cos(angle) * 1.2);
      petal.rotation.y = -angle;
      petal.rotation.x = 0.4;
      this.group.add(petal);
    }
  }

  private createParticles() {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 12;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xc9a86c,
      size: 0.03,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  private animate = () => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);
    this.group.rotation.y += 0.003;
    this.group.position.y = Math.sin(Date.now() * 0.0005) * 0.05;

    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.002;
        if (positions[i + 1] > 6) positions[i + 1] = -6;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private handleResize(container: HTMLElement) {
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
  }

  dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
  }
}
