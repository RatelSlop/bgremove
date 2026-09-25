import React, { useState, useRef, useCallback } from 'react';
import { Columns, SplitSquareVertical, Eye } from 'lucide-react';
import { BgType } from '../types';

interface ComparisonSliderProps {
  originalUrl: string;
  cutoutUrl: string;
  bgType: BgType;
  bgColor: string;
  bgGradient: string;
  bgImageUrl?: string;
  blurAmount: number;
}

type ViewMode = 'split' | 'cutout' | 'side-by-side';

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalUrl,
  cutoutUrl,
  bgType,
  bgColor,
  bgGradient,
  bgImageUrl,
  blurAmount,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchStart = () => setIsDragging(true);
  const handleTouchEnd = () => setIsDragging(false);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
  };

  // Generate background styling for the cutout preview
  const getCustomBgStyle = (): React.CSSProperties => {
    if (bgType === 'color') {
      return { backgroundColor: bgColor };
    }
    if (bgType === 'gradient') {
      const colors = bgGradient.split(',').map((c) => c.trim());
      return {
        background: `linear-gradient(135deg, ${colors[0] || '#3b82f6'}, ${colors[1] || '#8b5cf6'})`,
      };
    }
    return {};
  };

  return (
    <div className="flex flex-col items-center w-full space-y-3">
      {/* Mode Selector Controls */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium self-end">
        <button
          type="button"
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            viewMode === 'split'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>Schuifbalk</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('cutout')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            viewMode === 'cutout'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Alleen Uitsnede</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('side-by-side')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition ${
            viewMode === 'side-by-side'
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Naast elkaar</span>
        </button>
      </div>

      {/* Main Image Display Area */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* Original */}
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Origineel</span>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner flex items-center justify-center min-h-[300px] w-full">
              <img src={originalUrl} alt="Origineel" className="max-h-[460px] w-auto object-contain" />
            </div>
          </div>
          {/* Cutout */}
          <div className="flex flex-col items-center space-y-1.5">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Uitsnede</span>
            <div
              className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[300px] w-full ${
                bgType === 'transparent' ? 'bg-checkerboard' : ''
              }`}
              style={getCustomBgStyle()}
            >
              {bgType === 'blur' && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter scale-110"
                  style={{
                    backgroundImage: `url(${originalUrl})`,
                    filter: `blur(${blurAmount}px)`,
                  }}
                />
              )}
              {bgType === 'image' && bgImageUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bgImageUrl})` }}
                />
              )}
              <img src={cutoutUrl} alt="Uitsnede" className="relative z-10 max-h-[460px] w-auto object-contain" />
            </div>
          </div>
        </div>
      ) : viewMode === 'cutout' ? (
        <div
          className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[380px] w-full ${
            bgType === 'transparent' ? 'bg-checkerboard' : ''
          }`}
          style={getCustomBgStyle()}
        >
          {bgType === 'blur' && (
            <div
              className="absolute inset-0 bg-cover bg-center filter scale-110"
              style={{
                backgroundImage: `url(${originalUrl})`,
                filter: `blur(${blurAmount}px)`,
              }}
            />
          )}
          {bgType === 'image' && bgImageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${bgImageUrl})` }}
            />
          )}
          <img src={cutoutUrl} alt="Uitsnede" className="relative z-10 max-h-[500px] w-auto object-contain" />
        </div>
      ) : (
        /* Split Comparison Slider */
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          className="relative w-full min-h-[380px] max-h-[520px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 select-none cursor-ew-resize flex items-center justify-center shadow-inner"
        >
          {/* Base: Cutout with custom background */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              bgType === 'transparent' ? 'bg-checkerboard' : ''
            }`}
            style={getCustomBgStyle()}
          >
            {bgType === 'blur' && (
              <div
                className="absolute inset-0 bg-cover bg-center filter scale-110"
                style={{
                  backgroundImage: `url(${originalUrl})`,
                  filter: `blur(${blurAmount}px)`,
                }}
              />
            )}
            {bgType === 'image' && bgImageUrl && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImageUrl})` }}
              />
            )}
            <img
              src={cutoutUrl}
              alt="Uitsnede"
              className="relative z-10 max-h-[500px] w-auto object-contain pointer-events-none"
            />
          </div>

          {/* Overlay: Original Image clipped to sliderPosition */}
          <div
            className="absolute inset-0 overflow-hidden flex items-center justify-center"
            style={{
              clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-slate-900/10" />
            <img
              src={originalUrl}
              alt="Origineel"
              className="max-h-[500px] w-auto object-contain pointer-events-none"
            />
          </div>

          {/* Divider Line & Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-xl border-2 border-brand-500 flex items-center justify-center text-[10px] font-bold">
              ↔
            </div>
          </div>

          {/* Badges on bottom corners */}
          <div className="absolute bottom-3 left-3 z-30 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-white text-xs font-semibold pointer-events-none">
            Origineel
          </div>
          <div className="absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded-md bg-brand-600/80 backdrop-blur-sm text-white text-xs font-semibold pointer-events-none">
            Zonder Achtergrond
          </div>
        </div>
      )}
    </div>
  );
};
