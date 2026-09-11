import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  Upload, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Terminal,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { PdfFileItem } from '../types';
import { LoopGraphic } from './LoopGraphic';
import { sounds } from '../utils/audio';

interface LoopdfyHomeProps {
  activePdf: PdfFileItem;
  setActivePdf: (pdf: PdfFileItem) => void;
  onStartLoop: () => void;
}

const SAMPLE_PDFS: PdfFileItem[] = [
  {
    id: 'sample-1',
    name: 'invoice_march_2026_redirects_to_beach.pdf',
    size: '1.4 MB',
    pageCount: 3,
    detectedRedirectUrl: 'https://shady-surveys-win-prizes.click/redirect?ad=infinite',
    sneakyRedirectUrl: 'https://shady-surveys-win-prizes.click/redirect?ad=sneaky_reloop',
    status: 'relocked',
    isSample: true,
  },
  {
    id: 'sample-2',
    name: 'important_presentation_rickroll.pdf',
    size: '3.8 MB',
    pageCount: 12,
    detectedRedirectUrl: 'https://youtu.be/dQw4w9WgXcQ?loop=1',
    sneakyRedirectUrl: 'https://youtu.be/dQw4w9WgXcQ?loop=infinite',
    status: 'relocked',
    isSample: true,
  },
  {
    id: 'sample-3',
    name: 'lease_agreement_fine_print_loop.pdf',
    size: '890 KB',
    pageCount: 6,
    detectedRedirectUrl: 'https://landlord-disclaimers.gov/oops/redirect.html',
    sneakyRedirectUrl: 'https://landlord-disclaimers.gov/oops/re-loop.html',
    status: 'relocked',
    isSample: true,
  },
];

export const LoopdfyHome: React.FC<LoopdfyHomeProps> = ({
  activePdf,
  setActivePdf,
  onStartLoop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingStep, setIsProcessingStep] = useState(false);
  const [activeStepText, setActiveStepText] = useState('Idle: Waiting for loop command');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playClick();
      const customItem: PdfFileItem = {
        id: 'uploaded-' + Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        pageCount: Math.floor(Math.random() * 8) + 1,
        detectedRedirectUrl: `https://annoying-click-trap.io/${file.name.replace(/\s+/g, '_')}?ad=true`,
        sneakyRedirectUrl: `https://annoying-click-trap.io/${file.name.replace(/\s+/g, '_')}?relocked=100%`,
        status: 'relocked',
        isSample: false,
      };
      setActivePdf(customItem);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      sounds.playClick();
      const customItem: PdfFileItem = {
        id: 'uploaded-' + Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        pageCount: Math.floor(Math.random() * 5) + 2,
        detectedRedirectUrl: `https://annoying-click-trap.io/${file.name.replace(/\s+/g, '_')}?ad=true`,
        sneakyRedirectUrl: `https://annoying-click-trap.io/${file.name.replace(/\s+/g, '_')}?relocked=100%`,
        status: 'relocked',
        isSample: false,
      };
      setActivePdf(customItem);
    }
  };

  const handleToggleLock = () => {
    sounds.playClick();
    setActivePdf({
      ...activePdf,
      status: activePdf.status === 'relocked' ? 'stripped' : 'relocked',
    });
  };

  const handleStartProcess = () => {
    sounds.playWhoosh();
    setIsProcessingStep(true);
    setActiveStepText('Engaging the loop mechanism...');
    setTimeout(() => {
      onStartLoop();
    }, 280);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-16">
      {/* Notebook Sheet Container */}
      <div className="sketch-card p-6 sm:p-10 rounded-sm relative overflow-hidden">
        {/* Hand-drawn Header block */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <h1 className="font-caveat font-bold text-6xl sm:text-7xl text-[var(--ink)] tracking-tight -rotate-1 leading-none select-none">
              LooPDfy
            </h1>
            {/* Spiral swirl doodle */}
            <div className="absolute -top-3 -right-6 text-2xl animate-spin-slow">
              🌀
            </div>
          </div>

          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="font-caveat text-2xl text-[var(--ink)] font-semibold">
              "fix ☺ un:fix"
            </span>
            <span className="text-xl">🤨</span>
          </div>
        </div>

        {/* The Central Loop Graphic */}
        <div className="my-3">
          <LoopGraphic 
            isRelocked={activePdf.status === 'relocked'} 
            onToggleStatus={handleToggleLock}
          />
        </div>

        {/* The Handwritten Manifesto / Explainer (From the original sketch!) */}
        <div className="max-w-xl mx-auto text-center space-y-4 my-6 font-caveat text-2xl sm:text-3xl leading-snug text-[var(--ink)]">
          <p className="flex items-center justify-center flex-wrap gap-2">
            <span>we</span>
            <span 
              onClick={handleToggleLock}
              className="inline-flex items-center gap-1 font-mono text-xs uppercase px-2 py-0.5 border-2 border-[var(--border-ink)] bg-[var(--card-bg)] cursor-pointer shadow-[2px_2px_0px_var(--shadow-ink)] hover:bg-[var(--paper)]"
            >
              {activePdf.status === 'stripped' ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5 text-[var(--red)]" />}
              <span>{activePdf.status === 'stripped' ? 'unlocked' : 'unlock'}</span>
            </span>
            <span>your PDF from that annoying click, then</span>
            <span 
              onClick={handleToggleLock}
              className="inline-flex items-center gap-1 font-mono text-xs uppercase px-2 py-0.5 border-2 border-[var(--border-ink)] bg-[var(--red)] text-white cursor-pointer shadow-[2px_2px_0px_var(--shadow-ink)] hover:brightness-110"
            >
              <span>relock</span>
            </span>
            <span>it just to keep you on your toes</span>
          </p>

          <p className="text-lg sm:text-xl font-mono text-[var(--ink-soft)] bg-[var(--paper)] p-4 border-2 border-[var(--border-ink)] rounded-sm text-left shadow-[3px_3px_0px_var(--shadow-ink)]">
            <span className="block mb-2 font-bold text-[var(--ink)] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[var(--red)]" />
              How it works (genuinely):
            </span>
            upload a pdf that keeps redirecting to some website. we'll strip the link out — genuinely, it works. 
            Then we sneak it back in on downloading, because a fix that stays fixed isn't funny. 
            <span className="inline-block mx-1">🪱</span>
            <span className="italic font-caveat text-xl text-[var(--ink)] font-bold">
              that's the whole app.
            </span>
          </p>
        </div>

        {/* Start the Loop Section (Replacing the drop button as requested) */}
        <div className="max-w-xl mx-auto my-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Current PDF indicator */}
          <div className="mb-4 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[var(--card-bg)] border-2 border-[var(--border-ink)] shadow-[2.5px_2.5px_0px_var(--shadow-ink)] rounded text-xs font-mono">
            <FileText className="w-4 h-4 text-[var(--red)]" />
            <span className="text-[var(--ink-soft)]">Active PDF:</span>
            <span className="font-bold text-[var(--ink)] truncate max-w-[200px] sm:max-w-[280px]">
              {activePdf.name}
            </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="ml-2 text-[10px] text-[var(--red)] underline hover:text-[var(--ink)] cursor-pointer font-semibold"
            >
              (Upload another)
            </button>
          </div>

          {/* The Big Stacked "Start the Loop" Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              id="startProcessBtn"
              onClick={handleStartProcess}
              disabled={isProcessingStep}
              className="sketch-btn-stacked bg-[var(--red)] hover:brightness-110 text-white font-mono font-bold text-xl sm:text-2xl px-10 sm:px-14 py-5 cursor-pointer inline-flex items-center gap-4 transition-all border-2 border-[var(--border-ink)] shadow-[5px_5px_0px_var(--shadow-ink)] active:translate-x-0.5 active:translate-y-0.5"
            >
              <RotateCw className={`w-6 h-6 text-white ${isProcessingStep ? 'animate-spin' : ''}`} />
              <span>start the loop</span>
            </button>

            {/* Quick upload alternative below button */}
            <div className="mt-3 flex items-center justify-center gap-3 text-xs font-mono text-[var(--ink-soft)]">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="underline hover:text-[var(--ink)] cursor-pointer flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5 text-[var(--red)]" />
                <span>Upload custom PDF first</span>
              </button>
              <span>•</span>
              <span className="font-caveat text-lg text-[var(--ink)] -rotate-1">
                Tug-of-war begins while processing!
              </span>
            </div>
          </div>

          {/* Quick sample selector */}
          <div className="mt-6 pt-4 border-t border-[var(--border-ink)]/20 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-mono text-[var(--ink-soft)]">Or pick sample PDF:</span>
            {SAMPLE_PDFS.map((sample) => (
              <button
                key={sample.id}
                onClick={() => {
                  sounds.playClick();
                  setActivePdf(sample);
                }}
                className={`text-[11px] font-mono px-2.5 py-1 border-2 transition-all cursor-pointer ${
                  activePdf.id === sample.id
                    ? 'border-[var(--border-ink)] bg-[var(--ink)] text-[var(--paper)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)]'
                    : 'border-[var(--border-ink)]/40 bg-[var(--card-bg)] hover:bg-[var(--paper)] text-[var(--ink)] shadow-[1px_1px_0px_var(--shadow-ink)]'
                }`}
              >
                {sample.name.split('_')[0]}.pdf
              </button>
            ))}
          </div>
        </div>

        {/* Selected PDF Dossier / Inspector */}
        <div className="max-w-xl mx-auto mb-4 bg-[var(--card-bg)] border-2 border-[var(--border-ink)] p-4 shadow-[4px_4px_0px_var(--shadow-ink)]">
          <div className="flex items-start justify-between gap-3 border-b-2 border-[var(--border-ink)]/20 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--red)]" />
              <div>
                <p className="font-mono font-bold text-sm text-[var(--ink)] truncate max-w-[280px] sm:max-w-[340px]">
                  {activePdf.name}
                </p>
                <p className="font-mono text-[11px] text-[var(--ink-soft)]">
                  {activePdf.size} • {activePdf.pageCount} pages • {activePdf.isSample ? 'Curated Sample' : 'User Upload'}
                </p>
              </div>
            </div>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 border-2 border-[var(--border-ink)] shadow-[1.5px_1.5px_0px_var(--shadow-ink)] ${
              activePdf.status === 'relocked' ? 'bg-[var(--red)] text-white' : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              {activePdf.status === 'relocked' ? '😼 RE-LOCKED' : '🔓 STRIPPED'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between gap-2 bg-[var(--paper)] p-2.5 border border-[var(--border-ink)]/30">
              <span className="text-[var(--ink-soft)] shrink-0 font-medium">Annoying Redirect:</span>
              <span className="text-[var(--red)] truncate font-semibold" title={activePdf.detectedRedirectUrl}>
                {activePdf.detectedRedirectUrl}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[var(--paper)] p-2.5 border border-[var(--border-ink)]/30">
              <span className="text-[var(--ink-soft)] shrink-0 font-medium">Sneak-back Destination:</span>
              <span className="text-[var(--amber)] truncate font-semibold" title={activePdf.sneakyRedirectUrl}>
                {activePdf.sneakyRedirectUrl}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
