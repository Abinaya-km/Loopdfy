import React, { useState, useEffect } from 'react';
import { PageView, PdfFileItem, BgThemeId } from './types';
import { Navbar } from './components/Navbar';
import { LoopdfyHome } from './components/LoopdfyHome';
import { PullHardGame } from './components/PullHardGame';
import { sounds } from './utils/audio';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [bgTheme, setBgTheme] = useState<BgThemeId>(() => {
    const saved = localStorage.getItem('loopdfy_bg_theme');
    if (saved === 'mocha' || saved === 'latte') {
      return saved as BgThemeId;
    }
    return 'latte';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', bgTheme);
    try {
      localStorage.setItem('loopdfy_bg_theme', bgTheme);
    } catch {
      // ignore storage error
    }
  }, [bgTheme]);

  const handleSelectTheme = (theme: BgThemeId) => {
    sounds.playClick();
    setBgTheme(theme);
  };

  // Default active PDF file
  const [activePdf, setActivePdf] = useState<PdfFileItem>({
    id: 'default-1',
    name: 'invoice_march_2026_redirects_to_beach.pdf',
    size: '1.4 MB',
    pageCount: 3,
    detectedRedirectUrl: 'https://shady-surveys-win-prizes.click/redirect?ad=infinite',
    sneakyRedirectUrl: 'https://shady-surveys-win-prizes.click/redirect?ad=sneaky_reloop',
    status: 'relocked',
    isSample: true,
  });

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  const handleStartLoop = () => {
    setCurrentPage('pull-hard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    sounds.playClick();
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[var(--red)] selection:text-white">
      <div>
        {/* Top Sketch Navigation Bar */}
        <Navbar
          currentPage={currentPage}
          onNavigate={(page) => {
            sounds.playClick();
            setCurrentPage(page);
          }}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          activePdfName={activePdf.name}
          activeTheme={bgTheme}
          onSelectTheme={handleSelectTheme}
        />

        {/* Dynamic Page View */}
        <main className="w-full">
          {currentPage === 'home' ? (
            <LoopdfyHome
              activePdf={activePdf}
              setActivePdf={setActivePdf}
              onStartLoop={handleStartLoop}
            />
          ) : (
            <PullHardGame
              activePdf={activePdf}
              onBackToHome={handleBackToHome}
            />
          )}
        </main>
      </div>

      {/* Subtle Notebook Footer */}
      <footer className="w-full max-w-4xl mx-auto py-6 px-4 text-center font-mono text-[11px] text-[var(--ink-soft)] border-t border-[var(--border-ink)]/20 border-dashed">
        <p>
          LooPDfy • "fix ☺ un:fix" • based on real notebook research • because a fix that stays fixed isn't funny
        </p>
      </footer>
    </div>
  );
}
