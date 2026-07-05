export type DeviceTier = "low" | "mid" | "high";

export function getDeviceTier(): DeviceTier {
  try {
    const mem = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const gpu = getGPUPerformance();

    if (mem !== undefined && cores !== undefined) {
      if (mem <= 2 || cores <= 2) return "low";
      if (mem <= 4 || cores <= 4) return "mid";
    }

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return navigator.maxTouchPoints > 0 ? (cores <= 4 ? "low" : "mid") : "mid";
    }

    if (gpu === "low") return "mid";
    return "high";
  } catch {
    return "high";
  }
}

function getGPUPerformance(): "low" | "high" {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "low";
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "high";
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    if (!renderer) return "high";
    const gpuStr = String(renderer).toLowerCase();
    if (
      gpuStr.includes("intel") || gpuStr.includes("mali") ||
      gpuStr.includes("adreno") || gpuStr.includes("powervr")
    ) {
      return /adreno 5|mali-4|mali-3/.test(gpuStr) ? "low" : "mid";
    }
    if (gpuStr.includes("nvidia") || gpuStr.includes("amd") || gpuStr.includes("radeon")) {
      return "high";
    }
    return "mid";
  } catch {
    return "high";
  }
}

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export function isTouchDevice(): boolean {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function getAnimationConfig() {
  const reduced = prefersReducedMotion();
  const tier = getDeviceTier();
  const touch = isTouchDevice();

  return {
    reducedMotion: reduced,
    deviceTier: tier as DeviceTier,
    isTouch: touch,
    disableParallax: reduced || tier === "low",
    disableCustomCursor: touch || reduced,
    disableHeavyEffects: reduced || tier === "low",
    disableParticles: tier === "low" || reduced,
    simplifyTransforms: tier === "low",
    durationScale: reduced ? 0.01 : tier === "mid" ? 0.8 : 1,
    staggerScale: reduced ? 0.01 : tier === "mid" ? 0.7 : 1,
    enable3D: tier !== "low" && !reduced,
  };
}
