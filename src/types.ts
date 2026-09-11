export interface PdfFileItem {
  id: string;
  name: string;
  size: string;
  pageCount: number;
  detectedRedirectUrl: string;
  sneakyRedirectUrl: string;
  status: 'clean' | 'stripped' | 'relocked';
  isSample?: boolean;
}

export type PageView = 'home' | 'pull-hard';

export type BgThemeId = 'latte' | 'mocha';

export interface BgThemeOption {
  id: BgThemeId;
  name: string;
  type: 'light' | 'dark';
  color: string;
  icon: string;
}

export const BG_THEMES: BgThemeOption[] = [
  { id: 'latte', name: 'Latte (Light)', type: 'light', color: '#EFF1F5', icon: '☕' },
  { id: 'mocha', name: 'Mocha (Dark)', type: 'dark', color: '#1E1E2E', icon: '🍫' },
];

export interface PullStats {
  pulls: number;
  maxPulls: number;
  tensionNewtons: number;
  loopRpm: number;
  loopStubbornness: number; // percentage
  statusMessage: string;
}
