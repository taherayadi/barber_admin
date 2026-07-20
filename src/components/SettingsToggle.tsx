import React from 'react';
import { Sun, Moon, Languages } from 'lucide-react';
import { useSettings } from '../i18n';

export default function SettingsToggle({ className = '' }: { className?: string }) {
  const { theme, lang, toggleTheme, setLang } = useSettings();
  return (
    <div className={`flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-950/70 backdrop-blur border border-slate-300 dark:border-slate-800 rounded-full p-1 shadow-lg ${className}`}>
      <button
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        className="h-8 w-8 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
        title="Language"
        className="h-8 px-2.5 rounded-full flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-500 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
      >
        <Languages className="h-4 w-4" />
        {lang === 'en' ? 'EN' : 'FR'}
      </button>
    </div>
  );
}
