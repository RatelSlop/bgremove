import { BgType } from '../types';

/**
 * Creates an Image element from a URL or Blob and waits for it to load
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Composites the cutout image onto the selected background (transparent, color, gradient, blur, or custom image)
 * and returns the canvas element with the full resolution.
 */
export async function renderCompositedCanvas(params: {
  originalUrl: string;
  cutoutUrl: string;
  width: number;
  height: number;
  bgType: BgType;
  bgColor: string;
  bgGradient: string;
  bgImageUrl?: string;
  blurAmount: number;
}): Promise<HTMLCanvasElement> {
  const {
    originalUrl,
    cutoutUrl,
    width,
    height,
    bgType,
    bgColor,
    bgGradient,
    bgImageUrl,
    blurAmount,
  } = params;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // 1. Draw Background
  if (bgType === 'color') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'gradient') {
    // Parse simple gradient: e.g. "linear-gradient(135deg, #3b82f6, #8b5cf6)" or 2 colors
    const colors = bgGradient.split(',').map((c) => c.trim());
    const grad = ctx.createLinearGradient(0, 0, width, height);
    if (colors.length >= 2) {
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
    } else {
      grad.addColorStop(0, '#3b82f6');
      grad.addColorStop(1, '#8b5cf6');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'blur') {
    // Draw original image with blur filter
    try {
      const origImg = await loadImage(originalUrl);
      ctx.save();
      ctx.filter = `blur(${blurAmount}px)`;
      // Draw slightly larger to avoid edge bleeding from blur
      const bleed = Math.max(blurAmount * 2, 10);
      ctx.drawImage(origImg, -bleed, -bleed, width + bleed * 2, height + bleed * 2);
      ctx.restore();
    } catch (e) {
      console.error('Error drawing blur background:', e);
    }
  } else if (bgType === 'image' && bgImageUrl) {
    // Draw custom background image (cover fit)
    try {
      const bgImg = await loadImage(bgImageUrl);
      const hRatio = width / bgImg.width;
      const vRatio = height / bgImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (width - bgImg.width * ratio) / 2;
      const centerShiftY = (height - bgImg.height * ratio) / 2;
      ctx.drawImage(
        bgImg,
        0,
        0,
        bgImg.width,
        bgImg.height,
        centerShiftX,
        centerShiftY,
        bgImg.width * ratio,
        bgImg.height * ratio
      );
    } catch (e) {
      console.error('Error drawing custom background image:', e);
    }
  }

  // 2. Draw the foreground Cutout
  const cutoutImg = await loadImage(cutoutUrl);
  ctx.drawImage(cutoutImg, 0, 0, width, height);

  return canvas;
}

/**
 * Converts a Canvas to a downloadable Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      type,
      quality
    );
  });
}

/**
 * Triggers a download of a Blob or URL with a specific filename
 */
export function downloadFile(source: Blob | string, filename: string) {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof source !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

/**
 * Copies a PNG Blob to the system clipboard
 */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) {
      return false;
    }
    // Clipboard API requires image/png
    let pngBlob = blob;
    if (blob.type !== 'image/png') {
      const img = await loadImage(URL.createObjectURL(blob));
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      pngBlob = await canvasToBlob(canvas, 'image/png');
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': pngBlob,
      }),
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
