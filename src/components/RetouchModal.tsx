import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Paintbrush, Undo2, RotateCcw, Check, X, ZoomIn, ZoomOut } from 'lucide-react';
import { TranslationDictionary } from '../types';
import { loadImage, canvasToBlob } from '../utils/canvasUtils';

interface RetouchModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalUrl: string;
  cutoutUrl: string;
  onSaveRetouch: (newBlob: Blob, newUrl: string) => void;
  t: TranslationDictionary;
}

type ToolMode = 'erase' | 'restore';

export const RetouchModal: React.FC<RetouchModalProps> = ({
  isOpen,
  onClose,
  originalUrl,
  cutoutUrl,
  onSaveRetouch,
  t,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [toolMode, setToolMode] = useState<ToolMode>('erase');
  const [brushSize, setBrushSize] = useState<number>(30);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Initialize canvas with cutout image
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    async function init() {
      const [cutoutImg, origImg] = await Promise.all([
        loadImage(cutoutUrl),
        loadImage(originalUrl),
      ]);

      if (!isMounted) return;

      originalImageRef.current = origImg;

      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = cutoutImg.naturalWidth || cutoutImg.width;
      canvas.height = cutoutImg.naturalHeight || cutoutImg.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cutoutImg, 0, 0);

      // Save initial snapshot
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialData]);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [isOpen, cutoutUrl, originalUrl]);

  // Save state to undo history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]); // keep last 15 states
  }, []);

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    setHistory(newHistory);

    const canvas = canvasRef.current;
    if (!canvas || !previous) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(previous, 0, 0);
  };

  const handleReset = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cutoutImg = await loadImage(cutoutUrl);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cutoutImg, 0, 0);
    pushHistory();
  };

  // Convert mouse/touch coords to canvas pixel coords
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const drawAtPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = brushSize / 2;

    if (toolMode === 'erase') {
      // Erase mode: destination-out makes pixels transparent
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (toolMode === 'restore' && originalImageRef.current) {
      // Restore mode: draw corresponding circular portion from original photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    drawAtPoint(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    drawAtPoint(x, y);
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      pushHistory();
    }
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await canvasToBlob(canvas, 'image/png');
    const url = URL.createObjectURL(blob);
    onSaveRetouch(blob, url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t.retouchTitle}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {t.retouchHint}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          {/* Tool Modes */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
            <button
              type="button"
              onClick={() => setToolMode('erase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                toolMode === 'erase'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{t.erase}</span>
            </button>
            <button
              type="button"
              onClick={() => setToolMode('restore')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                toolMode === 'restore'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>{t.restore}</span>
            </button>
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t.brushSize}:
            </span>
            <input
              type="range"
              min="5"
              max="120"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24 sm:w-32 accent-brand-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 w-8">
              {brushSize}px
            </span>
          </div>

          {/* Zoom & History Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Uitzoomen"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-500 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Inzoomen"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs"
              title={t.undo}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.undo}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs"
              title={t.reset}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.reset}</span>
            </button>
          </div>
        </div>

        {/* Canvas Workspace */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-6 flex items-center justify-center">
          <div
            className="relative bg-checkerboard shadow-2xl rounded-lg overflow-hidden border border-slate-300 dark:border-slate-800"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-crosshair block max-h-[65vh] max-w-full"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{t.saveChanges}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
