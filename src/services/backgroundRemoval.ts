import { removeBackground, preload, type Config } from '@imgly/background-removal';
import { loadImage } from '../utils/canvasUtils';

let isPreloading = false;
let isPreloaded = false;

/**
 * Preload the AI model in the background so subsequent removals are instantaneous.
 */
export async function preloadModel(): Promise<void> {
  if (isPreloading || isPreloaded) return;
  isPreloading = true;
  try {
    await preload({
      model: 'isnet_fp16', // Balanced high quality & fast loading
    });
    isPreloaded = true;
  } catch (error) {
    console.warn('Preload model background attempt failed (will retry on first use):', error);
  } finally {
    isPreloading = false;
  }
}

export interface RemovalResult {
  blob: Blob;
  url: string;
  width: number;
  height: number;
}

/**
 * Removes the background from an image file, blob, or URL.
 */
export async function removeImageBackground(
  imageSource: File | Blob | string,
  onProgress?: (percent: number, statusText: string) => void
): Promise<RemovalResult> {
  const config: Config = {
    model: 'isnet_fp16', // Fast and accurate 16-bit float model
    proxyToWorker: true,
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        const percent = Math.min(100, Math.round((current / total) * 100));
        let message = 'AI model initialiseren...';
        if (key.includes('fetch')) {
          message = `AI model downloaden... (${percent}%)`;
        } else if (key.includes('compute') || key.includes('inference')) {
          message = `Achtergrond verwijderen... (${percent}%)`;
        }
        onProgress(percent, message);
      }
    },
  };

  const resultBlob = await removeBackground(imageSource, config);
  const resultUrl = URL.createObjectURL(resultBlob);
  const img = await loadImage(resultUrl);

  return {
    blob: resultBlob,
    url: resultUrl,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
  };
}
