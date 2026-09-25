import React from 'react';
import { ShieldCheck, Cloud } from 'lucide-react';
import { TranslationDictionary } from '../types';

interface FooterProps {
  t: TranslationDictionary;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-8 transition-colors mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        
        {/* Left: Branding & Domain */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            bgremove.schoolnaam.nl
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3.5 h-3.5 text-amber-500" />
            <span>Gehost op GitHub Pages</span>
          </span>
        </div>

        {/* Center: Privacy Notice */}
        <div className="flex items-center gap-1.5 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{t.privacyBadge} — 100% Client-side AI (WebAssembly)</span>
        </div>

        {/* Right: School Education info */}
        <div className="flex items-center gap-1">
          <span>Gemaakt voor onderwijs & scholen</span>
        </div>

      </div>
    </footer>
  );
};
