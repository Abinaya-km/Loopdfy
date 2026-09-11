import React from 'react';
import { Volume2, VolumeX, RotateCcw, FileText } from 'lucide-react';
import { PageView, BgThemeId } from '../types';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activePdfName?: string;
  activeTheme: BgThemeId;
  onSelectTheme: (theme: BgThemeId) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  soundEnabled,
  onToggleSound,
  activePdfName,
  activeTheme,
  onSelectTheme,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto pt-4 pb-3 px-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[var(--border-ink)]/20 border-dashed mb-4">
      {/* Brand Title */}
      <div 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 cursor-pointer select-none group"
      >
        <div className="w-8 h-8 rounded-full border-2 border-[var(--border-ink)] bg-[var(--red)] text-white flex items-center justify-center font-bold font-mono text-sm shadow-[2px_2px_0px_var(--shadow-ink)] group-hover:rotate-12 transition-transform">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-caveat text-3xl font-bold tracking-tight text-[var(--ink)] leading-none">
              LooPDfy
            </span>
            <span className="text-xs px-1.5 py-0.5 border border-[var(--border-ink)] bg-[var(--card-bg)] font-mono text-[var(--ink-soft)] rounded shadow-[1.5px_1.5px_0px_var(--shadow-ink)]">
              "fix ☺ un:fix" 🤨
            </span>
          </div>
        </div>
      </div>

      {/* Center Nav tabs */}
      <nav className="flex items-center gap-2">
        <button
          onClick={() => onNavigate('home')}
          className={`px-3 py-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
            currentPage === 'home'
              ? 'bg-[var(--ink)] text-[var(--paper)] shadow-[2px_2px_0px_var(--shadow-ink)]'
              : 'bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] hover:bg-[var(--card-alt)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)]'
          }`}
        >
          1. The Loopdfy
        </button>

        <button
          onClick={() => onNavigate('pull-hard')}
          className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            currentPage === 'pull-hard'
              ? 'bg-[var(--red)] text-white shadow-[2px_2px_0px_var(--shadow-ink)]'
              : 'bg-[var(--card-bg)] text-[var(--ink)] border border-[var(--border-ink)] hover:bg-[var(--card-alt)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)]'
          }`}
        >
          <span>2. Tug-of-Loop</span>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        </button>
      </nav>

      {/* Right utilities */}
      <div className="flex items-center gap-2">
        {/* Dedicated Latte (Light) & Mocha (Dark) theme switcher */}
        <div 
          className="flex items-center p-0.5 border border-[var(--border-ink)] bg-[var(--card-bg)] rounded shadow-[1.5px_1.5px_0px_var(--shadow-ink)]"
          title="Toggle Latte (Light) / Mocha (Dark)"
        >
          <button
            onClick={() => onSelectTheme('latte')}
            title="Light Theme: Latte ☕"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-sm transition-all cursor-pointer ${
              activeTheme === 'latte'
                ? 'bg-[var(--red)] text-white shadow-[1px_1px_0px_var(--shadow-ink)]'
                : 'text-[var(--ink)] hover:bg-[var(--card-alt)]'
            }`}
          >
            <span>☕</span>
            <span className="hidden sm:inline">Latte</span>
          </button>

          <button
            onClick={() => onSelectTheme('mocha')}
            title="Dark Theme: Mocha 🍫"
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold rounded-sm transition-all cursor-pointer ${
              activeTheme === 'mocha'
                ? 'bg-[var(--red)] text-white shadow-[1px_1px_0px_var(--shadow-ink)]'
                : 'text-[var(--ink)] hover:bg-[var(--card-alt)]'
            }`}
          >
            <span>🍫</span>
            <span className="hidden sm:inline">Mocha</span>
          </button>
        </div>

        {activePdfName && (
          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-[var(--ink-soft)] bg-[var(--card-bg)] px-2.5 py-1 border border-[var(--border-ink)] rounded shadow-[1.5px_1.5px_0px_var(--shadow-ink)]">
            <FileText className="w-3.5 h-3.5 text-[var(--red)]" />
            <span className="max-w-[120px] truncate">{activePdfName}</span>
          </div>
        )}

        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute audio' : 'Enable audio'}
          className="p-1.5 border border-[var(--border-ink)] bg-[var(--card-bg)] hover:bg-[var(--card-alt)] text-[var(--ink)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[var(--red)]" />}
        </button>
      </div>
    </header>
  );
};
