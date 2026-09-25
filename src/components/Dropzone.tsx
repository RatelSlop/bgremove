import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Clipboard, Plus } from 'lucide-react';
import { TranslationDictionary } from '../types';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onSampleSelected: (sampleUrl: string, sampleName: string) => void;
  t: TranslationDictionary;
}

const SAMPLE_IMAGES = [
  {
    name: 'Leerling Portret',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Student met Boeken',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Rugzak / Schooltas',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hond / Huisdier',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    thumb: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=160&auto=format&fit=crop&q=80',
  },
];

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
  onSampleSelected,
  t,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      e.target.value = ''; // Reset input to allow re-selecting the same file
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 scale-[1.01] shadow-xl shadow-brand-500/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 bg-white/60 dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
          {/* Animated Upload Icon */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-100 to-indigo-100 dark:from-slate-800 dark:to-brand-950/60 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
            <UploadCloud className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-1" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md text-brand-600 dark:text-brand-300">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {t.dropzoneTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.dropzoneSubtitle}
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition hover:shadow-lg active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t.dropzoneButton}</span>
          </button>

          {/* Clipboard Hint */}
          <div className="flex items-center gap-1.5 pt-2 text-xs font-medium text-slate-400 dark:text-slate-500">
            <Clipboard className="w-3.5 h-3.5 text-brand-500" />
            <span>{t.dropzonePasteHint}</span>
          </div>
        </div>
      </div>

      {/* Try Sample Photos */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{t.trySample}</span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => onSampleSelected(sample.url, sample.name)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 bg-slate-50 hover:bg-brand-50/50 dark:bg-slate-800/80 dark:hover:bg-brand-950/30 transition group text-left"
            >
              <img
                src={sample.thumb}
                alt={sample.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-brand-400"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {sample.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
