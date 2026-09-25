import React from 'react';
import {
  Download,
  Trash2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileArchive,
  Plus,
} from 'lucide-react';
import { ProcessItem, TranslationDictionary } from '../types';

interface BatchGalleryProps {
  items: ProcessItem[];
  selectedId: string | null;
  onSelectItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onDownloadItem: (item: ProcessItem) => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onAddMore: () => void;
  isDownloadingZip: boolean;
  t: TranslationDictionary;
}

export const BatchGallery: React.FC<BatchGalleryProps> = ({
  items,
  selectedId,
  onSelectItem,
  onDeleteItem,
  onDownloadItem,
  onDownloadAllZip,
  onClearAll,
  onAddMore,
  isDownloadingZip,
  t,
}) => {
  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="w-full space-y-4">
      {/* Batch Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-sm">
            {items.length}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t.batchProcessing}
            </h3>
            <p className="text-xs text-slate-500">
              {completedCount} van de {items.length} foto's voltooid
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onAddMore}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addMore}</span>
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearAll}</span>
          </button>

          <button
            type="button"
            onClick={onDownloadAllZip}
            disabled={completedCount === 0 || isDownloadingZip}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20 transition disabled:opacity-40 disabled:pointer-events-none"
          >
            {isDownloadingZip ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileArchive className="w-3.5 h-3.5" />
            )}
            <span>{t.downloadAllZip}</span>
          </button>
        </div>

      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.map((item) => {
          const isSelected = item.id === selectedId;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className={`group relative flex flex-col rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-brand-500 ring-2 ring-brand-500/30 bg-brand-50/20 dark:bg-brand-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-700 bg-white dark:bg-slate-900 shadow-sm'
              }`}
            >
              {/* Thumbnail Display */}
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                {item.status === 'done' && item.resultUrl ? (
                  <div className="w-full h-full bg-checkerboard flex items-center justify-center p-2">
                    <img
                      src={item.resultUrl}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <img
                    src={item.originalUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Status Overlay */}
                {item.status !== 'done' && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center text-white">
                    {item.status === 'processing' || item.status === 'loading-model' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-brand-400 mb-1.5" />
                        <span className="text-[10px] font-semibold line-clamp-1">
                          {item.progress}%
                        </span>
                        <div className="w-4/5 h-1 bg-white/20 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-brand-400 transition-all duration-200"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </>
                    ) : item.status === 'error' ? (
                      <>
                        <AlertCircle className="w-5 h-5 text-rose-400 mb-1" />
                        <span className="text-[10px] text-rose-200 font-medium">
                          Mislukt
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium">
                        In de wachtrij...
                      </span>
                    )}
                  </div>
                )}

                {/* Top action badge: Delete */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/50 text-white/80 hover:text-white hover:bg-rose-600 transition opacity-0 group-hover:opacity-100 z-10"
                  title="Verwijder foto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                {/* Completed badge */}
                {item.status === 'done' && (
                  <div className="absolute top-1.5 left-1.5 p-0.5 rounded-full bg-emerald-500 text-white shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-2 space-y-1">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate" title={item.name}>
                  {item.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{(item.size / 1024 / 1024).toFixed(1)} MB</span>
                  {item.status === 'done' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadItem(item);
                      }}
                      className="p-1 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
