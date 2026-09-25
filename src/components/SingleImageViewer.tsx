import React, { useRef, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  Paintbrush,
  Layers,
  Sliders,
  Upload,
} from 'lucide-react';
import { ProcessItem, TranslationDictionary } from '../types';
import { ComparisonSlider } from './ComparisonSlider';

interface SingleImageViewerProps {
  item: ProcessItem;
  onUpdateBg: (
    id: string,
    updates: Partial<Pick<ProcessItem, 'bgType' | 'bgColor' | 'bgGradient' | 'bgImageUrl' | 'blurAmount'>>
  ) => void;
  onDownload: (type: 'png' | 'jpg') => void;
  onCopyClipboard: () => void;
  onOpenRetouch: () => void;
  t: TranslationDictionary;
}

const COLOR_PRESETS = [
  { name: 'Wit', value: '#ffffff' },
  { name: 'Zwart', value: '#0f172a' },
  { name: 'Schoolblauw', value: '#1e40af' },
  { name: 'Lichtblauw', value: '#e0f2fe' },
  { name: 'Smaragdgroen', value: '#065f46' },
  { name: 'Pastelgroen', value: '#dcfce7' },
  { name: 'Krijtrood', value: '#991b1b' },
  { name: 'Pastelpaars', value: '#f3e8ff' },
  { name: 'Warm Geel', value: '#fef3c7' },
  { name: 'Lichtgrijs', value: '#f1f5f9' },
];

const GRADIENT_PRESETS = [
  { name: 'Blauw-Paars', value: '#3b82f6, #8b5cf6' },
  { name: 'Zonsondergang', value: '#f97316, #ec4899' },
  { name: 'Smaragd Mist', value: '#10b981, #06b6d4' },
  { name: 'Midnight', value: '#0f172a, #334155' },
  { name: 'Pastel Droom', value: '#fbcfe8, #e0e7ff' },
  { name: 'Goudgloed', value: '#f59e0b, #ef4444' },
];

export const SingleImageViewer: React.FC<SingleImageViewerProps> = ({
  item,
  onUpdateBg,
  onDownload,
  onCopyClipboard,
  onOpenRetouch,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    onCopyClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      onUpdateBg(item.id, {
        bgType: 'image',
        bgImageUrl: url,
      });
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Details & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* File Meta */}
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="truncate max-w-xs sm:max-w-md">{item.name}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {item.originalWidth} × {item.originalHeight} px
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            {(item.size / 1024 / 1024).toFixed(2)} MB • Volledige originele resolutie
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          {/* Retouch button */}
          <button
            type="button"
            onClick={onOpenRetouch}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            <Paintbrush className="w-3.5 h-3.5 text-brand-500" />
            <span>{t.retouch}</span>
          </button>

          {/* Copy to Clipboard */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyClipboard}</span>
              </>
            )}
          </button>

          {/* Download PNG */}
          <button
            type="button"
            onClick={() => onDownload('png')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.downloadPng}</span>
          </button>

          {/* Download JPG if background is non-transparent */}
          {item.bgType !== 'transparent' && (
            <button
              type="button"
              onClick={() => onDownload('jpg')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-900 text-white transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JPG</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Preview with Comparison Slider */}
      {item.resultUrl ? (
        <ComparisonSlider
          originalUrl={item.originalUrl}
          cutoutUrl={item.resultUrl}
          bgType={item.bgType}
          bgColor={item.bgColor}
          bgGradient={item.bgGradient}
          bgImageUrl={item.bgImageUrl}
          blurAmount={item.blurAmount}
        />
      ) : (
        <div className="w-full h-80 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <div className="animate-pulse text-sm text-slate-400">Bezig met verwerken...</div>
        </div>
      )}

      {/* Background Customizer Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Background Type Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t.background}
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => onUpdateBg(item.id, { bgType: 'transparent' })}
              className={`px-3 py-1.5 rounded-lg transition ${
                item.bgType === 'transparent'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.transparent}
            </button>
            <button
              type="button"
              onClick={() => onUpdateBg(item.id, { bgType: 'color' })}
              className={`px-3 py-1.5 rounded-lg transition ${
                item.bgType === 'color'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.color}
            </button>
            <button
              type="button"
              onClick={() => onUpdateBg(item.id, { bgType: 'gradient' })}
              className={`px-3 py-1.5 rounded-lg transition ${
                item.bgType === 'gradient'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.gradient}
            </button>
            <button
              type="button"
              onClick={() => onUpdateBg(item.id, { bgType: 'blur' })}
              className={`px-3 py-1.5 rounded-lg transition ${
                item.bgType === 'blur'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.blur}
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateBg(item.id, { bgType: 'image' });
                if (!item.bgImageUrl) {
                  bgImageInputRef.current?.click();
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition ${
                item.bgType === 'image'
                  ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.customImage}
            </button>
          </div>
        </div>

        {/* Options for Selected Background Type */}
        {item.bgType === 'color' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs font-medium text-slate-500">Presets:</span>
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onUpdateBg(item.id, { bgColor: color.value })}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  item.bgColor === color.value
                    ? 'border-brand-600 scale-110 shadow-md ring-2 ring-brand-400/30'
                    : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-500 font-medium">Aangepast:</span>
              <input
                type="color"
                value={item.bgColor}
                onChange={(e) => onUpdateBg(item.id, { bgColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {item.bgColor}
              </span>
            </div>
          </div>
        )}

        {item.bgType === 'gradient' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="text-xs font-medium text-slate-500">Kies verloop:</span>
            {GRADIENT_PRESETS.map((grad) => {
              const colors = grad.value.split(',').map((c) => c.trim());
              return (
                <button
                  key={grad.name}
                  type="button"
                  onClick={() => onUpdateBg(item.id, { bgGradient: grad.value })}
                  className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                    item.bgGradient === grad.value
                      ? 'border-brand-600 scale-110 shadow-md ring-2 ring-brand-400/30'
                      : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
                  }}
                  title={grad.name}
                />
              );
            })}
          </div>
        )}

        {item.bgType === 'blur' && (
          <div className="flex items-center gap-4 pt-1">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              Vervaagsterkte (Portret Bokeh):
            </span>
            <input
              type="range"
              min="2"
              max="50"
              value={item.blurAmount}
              onChange={(e) => onUpdateBg(item.id, { blurAmount: Number(e.target.value) })}
              className="w-44 accent-brand-600 cursor-pointer"
            />
            <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400">
              {item.blurAmount} px
            </span>
          </div>
        )}

        {item.bgType === 'image' && (
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <input
                ref={bgImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomBgUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => bgImageInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
              >
                <Upload className="w-3.5 h-3.5 text-brand-500" />
                <span>Upload eigen achtergrondfoto</span>
              </button>
            </div>
            {item.bgImageUrl && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Eigen achtergrond actief
              </span>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
