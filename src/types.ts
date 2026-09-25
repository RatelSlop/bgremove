export type BgType = 'transparent' | 'color' | 'gradient' | 'blur' | 'image';

export interface ProcessItem {
  id: string;
  file: File;
  name: string;
  size: number;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  status: 'idle' | 'loading-model' | 'processing' | 'done' | 'error';
  progress: number;
  statusMessage?: string;
  resultBlob?: Blob;
  resultUrl?: string;
  error?: string;
  
  // Customization
  bgType: BgType;
  bgColor: string;
  bgGradient: string;
  bgImageUrl?: string;
  blurAmount: number; // in px
}

export type Language = 'nl' | 'en';

export interface TranslationDictionary {
  title: string;
  subtitle: string;
  privacyBadge: string;
  privacyTooltip: string;
  dropzoneTitle: string;
  dropzoneSubtitle: string;
  dropzoneButton: string;
  dropzonePasteHint: string;
  trySample: string;
  batchProcessing: string;
  downloadAllZip: string;
  clearAll: string;
  addMore: string;
  processing: string;
  completed: string;
  original: string;
  removed: string;
  compare: string;
  background: string;
  transparent: string;
  color: string;
  gradient: string;
  blur: string;
  customImage: string;
  download: string;
  downloadPng: string;
  downloadJpg: string;
  copyClipboard: string;
  copied: string;
  retouch: string;
  retouchTitle: string;
  retouchHint: string;
  erase: string;
  restore: string;
  brushSize: string;
  saveChanges: string;
  cancel: string;
  reset: string;
  undo: string;
  gdprGuarantee: string;
  gdprDetail: string;
  poweredBy: string;
}
