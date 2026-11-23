import { useEffect, useRef } from "react";

/*
 * The Great Library of Alexandria, after O. Von Corven's 19th-century engraving
 * (public domain, via Wikimedia Commons), redrawn as an ordered dither in the
 * Alexandria flame. Ink becomes lit dots; everything else stays the panel colour.
 *
 * Nothing runs per frame: the canvas draws once per resize, plays a short
 * burn-in (bottom rows first, like a rising flame), then only redraws on
 * pointer moves while the hero is the current scene, for the torch that
 * reveals the engraving around the cursor. Reduced motion gets the final frame.
 */

const SOURCE = "/alexandria/great-library.webp";
/** CSS pixels per dither dot. */
const CELL = 3;
/** Torch radius in dots. */
const TORCH_RADIUS = 58;
const BURN_IN_MS = 1400;
/** The flame, packed as little-endian RGBA for a Uint32Array view of ImageData. */
const FLAME = (255 << 24) | (0x1f << 16) | (0x5a << 8) | 0xff;

/** 8x8 Bayer matrix, normalised to thresholds in (0, 1). */
const BAYER = Float32Array.from([
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
], (value) => (value + 0.5) / 64);

type Field = {
  cols: number;
  rows: number;
  /** Ink density per dot, 0 (paper) to 1 (solid line), already weighted by `quiet`. */
  ink: Float32Array;
  /** How much the centre is held back so the headline stays readable, 0 to 1 (1 = untouched). */
  quiet: Float32Array;
  image: ImageData;
  pixels: Uint32Array;
};

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/** Samples the engraving into one ink value per dot, cropped to cover the canvas. */
function buildField(source: HTMLImageElement, cols: number, rows: number, context: CanvasRenderingContext2D): Field {
  const sample = document.createElement("canvas");
  sample.width = cols;
  sample.height = rows;
  const sampleContext = sample.getContext("2d", { willReadFrequently: true });
  if (!sampleContext) throw new Error("2D canvas is unavailable");
  const scale = Math.max(cols / source.naturalWidth, rows / source.naturalHeight);
  const width = source.naturalWidth * scale;
  const height = source.naturalHeight * scale;
  sampleContext.drawImage(source, (cols - width) / 2, (rows - height) * 0.45, width, height);
  const data = sampleContext.getImageData(0, 0, cols, rows).data;

  const ink = new Float32Array(cols * rows);
  const quiet = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      // Elliptical distance from the centre, where the hero copy sits.
      const dx = (x / cols - 0.5) / 0.34;
      const dy = (y / rows - 0.5) / 0.36;
      quiet[i] = 0.12 + 0.88 * smoothstep(0.55, 1.25, Math.hypot(dx, dy));
      const darkness = 1 - data[i * 4] / 255;
      ink[i] = Math.pow(darkness, 1.35) * 0.92;
    }
  }
  const image = context.createImageData(cols, rows);
  return { cols, rows, ink, quiet, image, pixels: new Uint32Array(image.data.buffer) };
}

/**
 * Draws one frame. `progress` (0 to 1) is the burn-in; `torch` is the pointer
 * in dots, or null when there is none.
 */
function draw(context: CanvasRenderingContext2D, field: Field, progress: number, torch: { x: number; y: number } | null) {
  const { cols, rows, ink, quiet, pixels } = field;
  const radiusSquared = TORCH_RADIUS * TORCH_RADIUS;
  for (let y = 0; y < rows; y++) {
    // Rows burn in from the bottom up.
    const reveal = progress >= 1 ? 1 : smoothstep(0, 1, progress * 1.6 - (1 - y / rows) * 0.6);
    const dy = torch ? y - torch.y : 0;
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      let hold = quiet[i];
      let glow = 0;
      if (torch) {
        const dx = x - torch.x;
        const distance = (dx * dx + dy * dy) / radiusSquared;
        if (distance < 1) {
          const light = (1 - distance) * (1 - distance);
          hold += (1 - hold) * light;
          glow = light * 0.1;
        }
      }
      const value = (ink[i] * hold + glow) * reveal;
      pixels[i] = value > BAYER[(y & 7) * 8 + (x & 7)] ? FLAME : 0;
    }
  }
  context.putImageData(field.image, 0, 0);
}

/** The hero's dithered engraving. Decorative; fills its positioned parent. */
export function DitherHall({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const finePointer = window.matchMedia("(pointer: fine)");
    // HomeStory's stage: it marks which scene is current, and takes the pointer.
    const stage = canvas.closest<HTMLElement>("[data-scene]");
    const source = new Image();
    let field: Field | null = null;
    let progress = motion.matches ? 0 : 1;
    let torch: { x: number; y: number } | null = null;
    let frame = 0;
    let burnStart = 0;
    let disposed = false;

    const render = () => {
      frame = 0;
      if (field) draw(context, field, progress, torch);
    };
    const schedule = () => { frame ||= requestAnimationFrame(render); };

    const burn = (now: number) => {
      if (disposed || !field) return;
      burnStart ||= now;
      progress = Math.min(1, (now - burnStart) / BURN_IN_MS);
      draw(context, field, progress, torch);
      if (progress < 1) requestAnimationFrame(burn);
    };

    const resize = () => {
      if (!source.complete || !source.naturalWidth) return;
      const { width, height } = canvas.getBoundingClientRect();
      const cols = Math.max(1, Math.ceil(width / CELL));
      const rows = Math.max(1, Math.ceil(height / CELL));
      if (field && field.cols === cols && field.rows === rows) return;
      canvas.width = cols;
      canvas.height = rows;
      field = buildField(source, cols, rows, context);
      if (progress < 1 && !burnStart) requestAnimationFrame(burn);
      else render();
    };

    const move = (event: PointerEvent) => {
      if (!field || !motion.matches || !finePointer.matches || stage?.dataset.scene !== "0") return;
      const rect = canvas.getBoundingClientRect();
      torch = { x: ((event.clientX - rect.left) / rect.width) * field.cols, y: ((event.clientY - rect.top) / rect.height) * field.rows };
      schedule();
    };
    const leave = () => {
      if (!torch) return;
      torch = null;
      schedule();
    };

    const observer = new ResizeObserver(resize);
    source.decoding = "async";
    source.src = SOURCE;
    source.decode().then(() => {
      if (disposed) return;
      resize();
      observer.observe(canvas);
    }, () => {});
    stage?.addEventListener("pointermove", move);
    stage?.addEventListener("pointerleave", leave);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      stage?.removeEventListener("pointermove", move);
      stage?.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
