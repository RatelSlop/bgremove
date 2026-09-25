import React from 'react';
import { ShieldCheck, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { TranslationDictionary } from '../types';

interface PrivacyBannerProps {
  t: TranslationDictionary;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ t }) => {
  return (
    <div className="w-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-brand-500/10 dark:from-emerald-500/15 dark:via-teal-500/15 dark:to-brand-500/15 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        
        <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              {t.gdprGuarantee}
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white">
              AVG-Proof
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.gdprDetail}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-emerald-500/15">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Geen data naar servers</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Snelle browser WebAssembly</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Geschikt voor schoolportretten</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
