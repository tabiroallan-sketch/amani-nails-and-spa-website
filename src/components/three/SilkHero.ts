import * as THREE from "three";

const SILK_COUNT = 1200;
const STRAND_COUNT = 14;
const PETAL_COUNT = 40;

export class SilkHeroScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private group: THREE.Group;
  private silkParticles: THREE.Points;
  private petalParticles: THREE.Points;
  private clock: THREE.Clock;
  private animFrameId: number;
  private isDisposed = false;
  private mouseX = 0;
  private mouseY = 0;
  private targetRotX = 0;
  private targetRotY = 0;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    const w = container.clientWidth;
    const h = container.clientHeight;

    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xf9f6f0, 0.025);

    this.camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50);
    this.camera.position.z = 9;
    this.camera.position.y = 0.5;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.setupLighting();
    this.silkParticles = this.createSilkParticles();
    this.petalParticles = this.createPetals();
    this.setupMouseTracking();
    this.animate();
    this.handleResize();
  }

  private setupLighting() {
    const ambient = new THREE.AmbientLight(0xffeedd, 0.3);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xc9a86c, 0.7);
    key.position.set(6, 10, 8);
    this.scene.add(key);

    const warm = new THREE.DirectionalLight(0xf5e6d0, 0.4);
    warm.position.set(-4, 3, 5);
    this.scene.add(warm);

    const rim = new THREE.DirectionalLight(0xd4af37, 0.25);
    rim.position.set(-3, -2, -6);
    this.scene.add(rim);
  }

  private createSilkParticles(): THREE.Points {
    const positions = new Float32Array(SILK_COUNT * 3);
    const colors = new Float32Array(SILK_COUNT * 3);
    const sizes = new Float32Array(SILK_COUNT);
    const particlesPerStrand = Math.floor(SILK_COUNT / STRAND_COUNT);

    const palette = [
      new THREE.Color(0xc9a86c),
      new THREE.Color(0xd4af37),
      new THREE.Color(0xf5e6d0),
      new THREE.Color(0xe8b4b8),
      new THREE.Color(0xe8d5c4),
    ];

    for (let s = 0; s < STRAND_COUNT; s++) {
      const angle = (s / STRAND_COUNT) * Math.PI * 2;
      const radius = 2 + Math.random() * 2.5;

      for (let p = 0; p < particlesPerStrand; p++) {
        const idx = s * particlesPerStrand + p;
        if (idx >= SILK_COUNT) break;

        const t = p / particlesPerStrand;
        const spread = (Math.random() - 0.5) * 0.25;

        positions[idx * 3] = Math.cos(angle + t * 0.6) * radius + spread;
        positions[idx * 3 + 1] = (t - 0.5) * 7 + (Math.random() - 0.5) * 0.2;
        positions[idx * 3 + 2] = Math.sin(angle + t * 0.6) * radius + spread;

        const c = palette[idx % palette.length];
        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;

        sizes[idx] = 0.015 + Math.random() * 0.04;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const mesh = new THREE.Points(geo, mat);
    this.group.add(mesh);
    return mesh;
  }

  private createPetals(): THREE.Points {
    const positions = new Float32Array(PETAL_COUNT * 3);
    const sizes = new Float32Array(PETAL_COUNT);
    const data = new Float32Array(PETAL_COUNT * 3);

    for (let i = 0; i < PETAL_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      sizes[i] = 0.12 + Math.random() * 0.18;
      data[i * 3] = Math.random() * Math.PI * 2;
      data[i * 3 + 1] = 0.15 + Math.random() * 0.35;
      data[i * 3 + 2] = Math.random() * 0.001 + 0.001;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(212, 175, 55, 0.5)");
    gradient.addColorStop(0.3, "rgba(245, 230, 208, 0.35)");
    gradient.addColorStop(0.7, "rgba(232, 180, 184, 0.15)");
    gradient.addColorStop(1, "rgba(245, 230, 208, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(32, 32, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    const texture = new THREE.CanvasTexture(canvas);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const mesh = new THREE.Points(geo, mat);
    mesh.userData = { data };
    this.group.add(mesh);
    return mesh;
  }

  private setupMouseTracking() {
    const container = this.container;
    const onMouse = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      this.mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      this.mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * -2;
    };
    const onLeave = () => {
      this.mouseX = 0;
      this.mouseY = 0;
    };
    container.addEventListener("mousemove", onMouse);
    container.addEventListener("mouseleave", onLeave);
  }

  private animate = () => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const time = this.clock.getElapsedTime();
    const particlesPerStrand = Math.floor(SILK_COUNT / STRAND_COUNT);

    // Silk flow
    const silkPos = this.silkParticles.geometry.attributes.position
      .array as Float32Array;

    for (let s = 0; s < STRAND_COUNT; s++) {
      const angle = (s / STRAND_COUNT) * Math.PI * 2;
      const radius = 2 + Math.sin(time * 0.15 + s * 0.7) * 0.8;

      for (let p = 0; p < particlesPerStrand; p++) {
        const idx = s * particlesPerStrand + p;
        if (idx >= SILK_COUNT) break;

        const t = p / particlesPerStrand;
        const wave = Math.sin(t * 8 + time * 0.6 + s * 1.1) * 0.35;
        const wave2 = Math.cos(t * 6 + time * 0.45 + s * 0.9) * 0.35;

        silkPos[idx * 3] =
          Math.cos(angle + t * 0.7 + time * 0.04) * (radius + wave * 0.2);
        silkPos[idx * 3 + 1] =
          (t - 0.5) * 7 + Math.sin(time * 0.25 + p * 0.08 + s) * 0.3;
        silkPos[idx * 3 + 2] =
          Math.sin(angle + t * 0.7 + time * 0.04) * (radius + wave2 * 0.2);
      }
    }
    this.silkParticles.geometry.attributes.position.needsUpdate = true;

    // Petal float
    const petalPos = this.petalParticles.geometry.attributes.position
      .array as Float32Array;
    const petalData = this.petalParticles.userData.data as Float32Array;

    for (let i = 0; i < PETAL_COUNT; i++) {
      petalPos[i * 3] += Math.cos(time * petalData[i * 3 + 2] + i) * 0.002;
      petalPos[i * 3 + 1] +=
        Math.sin(time * petalData[i * 3 + 1] + petalData[i * 3]) * 0.004;

      if (petalPos[i * 3] > 9) petalPos[i * 3] = -9;
      if (petalPos[i * 3] < -9) petalPos[i * 3] = 9;
      if (petalPos[i * 3 + 1] > 5) petalPos[i * 3 + 1] = -5;
      if (petalPos[i * 3 + 1] < -5) petalPos[i * 3 + 1] = 5;
    }
    this.petalParticles.geometry.attributes.position.needsUpdate = true;

    // Mouse-driven rotation (smooth lerp)
    this.targetRotX += (this.mouseY * 0.025 - this.targetRotX) * 0.02;
    this.targetRotY += (this.mouseX * 0.025 - this.targetRotY) * 0.02;
    this.group.rotation.x = this.targetRotX;
    this.group.rotation.y = this.targetRotY;

    this.renderer.render(this.scene, this.camera);
  };

  private handleResize() {
    const container = this.container;
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
    this.silkParticles.geometry.dispose();
    (this.silkParticles.material as THREE.Material).dispose();
    this.petalParticles.geometry.dispose();
    (this.petalParticles.material as THREE.Material).dispose();

    const canvas = this.renderer.domElement;
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  }
}
