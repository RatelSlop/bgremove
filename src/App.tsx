import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Dropzone } from './components/Dropzone';
import { BatchGallery } from './components/BatchGallery';
import { SingleImageViewer } from './components/SingleImageViewer';
import { RetouchModal } from './components/RetouchModal';
import { Footer } from './components/Footer';
import { ProcessItem, Language } from './types';
import { translations } from './utils/translations';
import { removeImageBackground, preloadModel } from './services/backgroundRemoval';
import {
  loadImage,
  renderCompositedCanvas,
  canvasToBlob,
  downloadFile,
  copyBlobToClipboard,
} from './utils/canvasUtils';

export function App() {
  const [lang, setLang] = useState<Language>('nl');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const [items, setItems] = useState<ProcessItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRetouchOpen, setIsRetouchOpen] = useState<boolean>(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  const processingQueueRef = useRef<boolean>(false);

  const t = translations[lang];

  // Preload model on startup
  useEffect(() => {
    preloadModel();
  }, []);

  // Sync dark mode class on documentElement
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Global Clipboard Paste Handler (Ctrl+V anywhere)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const files: File[] = [];
      for (const item of Array.from(e.clipboardData.items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        addFilesToQueue(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Add files to the processing queue
  const addFilesToQueue = async (files: File[]) => {
    const newItems: ProcessItem[] = [];

    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const url = URL.createObjectURL(file);

      // Measure dimensions
      let width = 0;
      let height = 0;
      try {
        const img = await loadImage(url);
        width = img.naturalWidth || img.width;
        height = img.naturalHeight || img.height;
      } catch (e) {
        console.warn('Could not read image dimensions:', e);
      }

      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        originalUrl: url,
        originalWidth: width,
        originalHeight: height,
        status: 'idle',
        progress: 0,
        bgType: 'transparent',
        bgColor: '#ffffff',
        bgGradient: '#3b82f6, #8b5cf6',
        blurAmount: 18,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    if (!selectedId && newItems.length > 0) {
      setSelectedId(newItems[0].id);
    }
  };

  // Handle sample photo selection
  const handleSampleSelected = async (sampleUrl: string, sampleName: string) => {
    try {
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], `${sampleName.toLowerCase().replace(/\s+/g, '-')}.jpg`, {
        type: 'image/jpeg',
      });
      addFilesToQueue([file]);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  // Queue Worker: Process idle items sequentially
  useEffect(() => {
    const processNext = async () => {
      if (processingQueueRef.current) return;

      const idleItem = items.find((i) => i.status === 'idle');
      if (!idleItem) return;

      processingQueueRef.current = true;

      // Update status to processing
      setItems((prev) =>
        prev.map((item) =>
          item.id === idleItem.id
            ? { ...item, status: 'processing', progress: 5 }
            : item
        )
      );

      try {
        const result = await removeImageBackground(
          idleItem.file,
          (percent, statusText) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === idleItem.id
                  ? { ...item, progress: percent, statusMessage: statusText }
                  : item
              )
            );
          }
        );

        setItems((prev) =>
          prev.map((item) =>
            item.id === idleItem.id
              ? {
                  ...item,
                  status: 'done',
                  progress: 100,
                  resultBlob: result.blob,
                  resultUrl: result.url,
                  originalWidth: result.width || item.originalWidth,
                  originalHeight: result.height || item.originalHeight,
                }
              : item
          )
        );

        // Check if all items are done and fire celebratory confetti
        const remaining = items.filter(
          (i) => i.id !== idleItem.id && (i.status === 'idle' || i.status === 'processing')
        );
        if (remaining.length === 0) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        console.error('Background removal error:', err);
        setItems((prev) =>
          prev.map((item) =>
            item.id === idleItem.id
              ? {
                  ...item,
                  status: 'error',
                  error: err?.message || 'Fout bij achtergrond verwijderen',
                }
              : item
          )
        );
      } finally {
        processingQueueRef.current = false;
      }
    };

    processNext();
  }, [items]);

  // Update item background settings
  const handleUpdateBg = (
    id: string,
    updates: Partial<Pick<ProcessItem, 'bgType' | 'bgColor' | 'bgGradient' | 'bgImageUrl' | 'blurAmount'>>
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  // Download active item with current background composited
  const handleDownload = async (type: 'png' | 'jpg') => {
    const activeItem = items.find((i) => i.id === selectedId);
    if (!activeItem || !activeItem.resultUrl) return;

    try {
      const canvas = await renderCompositedCanvas({
        originalUrl: activeItem.originalUrl,
        cutoutUrl: activeItem.resultUrl,
        width: activeItem.originalWidth,
        height: activeItem.originalHeight,
        bgType: activeItem.bgType,
        bgColor: activeItem.bgColor,
        bgGradient: activeItem.bgGradient,
        bgImageUrl: activeItem.bgImageUrl,
        blurAmount: activeItem.blurAmount,
      });

      const mimeType = type === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await canvasToBlob(canvas, mimeType, 0.95);
      const cleanName = activeItem.name.replace(/\.[^/.]+$/, '');
      downloadFile(blob, `${cleanName}-nobg.${type}`);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  // Download single item PNG directly
  const handleDownloadItem = async (item: ProcessItem) => {
    if (!item.resultUrl) return;
    try {
      const canvas = await renderCompositedCanvas({
        originalUrl: item.originalUrl,
        cutoutUrl: item.resultUrl,
        width: item.originalWidth,
        height: item.originalHeight,
        bgType: item.bgType,
        bgColor: item.bgColor,
        bgGradient: item.bgGradient,
        bgImageUrl: item.bgImageUrl,
        blurAmount: item.blurAmount,
      });
      const blob = await canvasToBlob(canvas, 'image/png', 1.0);
      const cleanName = item.name.replace(/\.[^/.]+$/, '');
      downloadFile(blob, `${cleanName}-nobg.png`);
    } catch (e) {
      console.error('Error downloading item:', e);
    }
  };

  // Copy PNG to clipboard
  const handleCopyClipboard = async () => {
    const activeItem = items.find((i) => i.id === selectedId);
    if (!activeItem || !activeItem.resultUrl) return;

    try {
      const canvas = await renderCompositedCanvas({
        originalUrl: activeItem.originalUrl,
        cutoutUrl: activeItem.resultUrl,
        width: activeItem.originalWidth,
        height: activeItem.originalHeight,
        bgType: activeItem.bgType,
        bgColor: activeItem.bgColor,
        bgGradient: activeItem.bgGradient,
        bgImageUrl: activeItem.bgImageUrl,
        blurAmount: activeItem.blurAmount,
      });
      const blob = await canvasToBlob(canvas, 'image/png', 1.0);
      await copyBlobToClipboard(blob);
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  // Download all completed items as a ZIP
  const handleDownloadAllZip = async () => {
    const completedItems = items.filter((i) => i.status === 'done' && i.resultUrl);
    if (completedItems.length === 0) return;

    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();

      for (let idx = 0; idx < completedItems.length; idx++) {
        const item = completedItems[idx];
        const canvas = await renderCompositedCanvas({
          originalUrl: item.originalUrl,
          cutoutUrl: item.resultUrl!,
          width: item.originalWidth,
          height: item.originalHeight,
          bgType: item.bgType,
          bgColor: item.bgColor,
          bgGradient: item.bgGradient,
          bgImageUrl: item.bgImageUrl,
          blurAmount: item.blurAmount,
        });

        const blob = await canvasToBlob(canvas, 'image/png', 1.0);
        const cleanName = item.name.replace(/\.[^/.]+$/, '');
        const filename = `${cleanName}-nobg.png`;
        zip.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipBlob, 'bgremove-schoolnaam-fotos.zip');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('ZIP generation failed:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Retouch save handler
  const handleSaveRetouch = (newBlob: Blob, newUrl: string) => {
    if (!selectedId) return;
    setItems((prev) =>
      prev.map((item) =>
        item.id === selectedId
          ? { ...item, resultBlob: newBlob, resultUrl: newUrl }
          : item
      )
    );
  };

  const activeItem = items.find((i) => i.id === selectedId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Header
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'nl' ? 'en' : 'nl'))}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((d) => !d)}
        t={t}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Privacy Banner for Schools & Education */}
        <PrivacyBanner t={t} />

        {/* Dropzone Upload Section */}
        {items.length === 0 ? (
          <div className="py-4">
            <Dropzone
              onFilesSelected={addFilesToQueue}
              onSampleSelected={handleSampleSelected}
              t={t}
            />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Batch Gallery list if items > 0 */}
            <BatchGallery
              items={items}
              selectedId={selectedId}
              onSelectItem={(id) => setSelectedId(id)}
              onDeleteItem={(id) => {
                setItems((prev) => {
                  const filtered = prev.filter((i) => i.id !== id);
                  if (selectedId === id) {
                    setSelectedId(filtered[0]?.id || null);
                  }
                  return filtered;
                });
              }}
              onDownloadItem={handleDownloadItem}
              onDownloadAllZip={handleDownloadAllZip}
              onClearAll={() => {
                setItems([]);
                setSelectedId(null);
              }}
              onAddMore={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e: any) => {
                  if (e.target.files) {
                    addFilesToQueue(Array.from(e.target.files));
                  }
                };
                input.click();
              }}
              isDownloadingZip={isDownloadingZip}
              t={t}
            />

            {/* Active Item View & Background Editor */}
            {activeItem && (
              <SingleImageViewer
                item={activeItem}
                onUpdateBg={handleUpdateBg}
                onDownload={handleDownload}
                onCopyClipboard={handleCopyClipboard}
                onOpenRetouch={() => setIsRetouchOpen(true)}
                t={t}
              />
            )}
          </div>
        )}

      </main>

      {/* Retouch Modal */}
      {activeItem && activeItem.resultUrl && (
        <RetouchModal
          isOpen={isRetouchOpen}
          onClose={() => setIsRetouchOpen(false)}
          originalUrl={activeItem.originalUrl}
          cutoutUrl={activeItem.resultUrl}
          onSaveRetouch={handleSaveRetouch}
          t={t}
        />
      )}

      <Footer t={t} />
    </div>
  );
}
