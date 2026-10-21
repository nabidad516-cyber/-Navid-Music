import React from 'react';
import { ScreenId, ThemeId } from '../types/music';
import {
  Home,
  Music2,
  FolderOpen,
  ListMusic,
  Sliders,
  Settings,
  Heart,
  Disc3,
  Users,
  Smartphone,
  Search,
  Palette
} from 'lucide-react';

interface NavigationProps {
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenSearch: () => void;
  theme: ThemeId;
  onCycleTheme: () => void;
  unreadCount?: number;
}

export const TopAppBar: React.FC<{
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  onOpenSearch: () => void;
  theme: ThemeId;
  onCycleTheme: () => void;
}> = ({ currentScreen, onSelectScreen, onOpenSearch, theme, onCycleTheme }) => {
  const getScreenTitle = (screen: ScreenId): string => {
    switch (screen) {
      case 'home': return 'Navid Music';
      case 'songs': return 'All Songs';
      case 'folders': return 'Folder Explorer';
      case 'albums': return 'Albums';
      case 'artists': return 'Artists';
      case 'playlists': return 'Playlists';
      case 'favorites': return 'Favorites';
      case 'equalizer': return 'Audio Equalizer';
      case 'settings': return 'Settings';
      case 'android-export': return 'Android APK & Studio';
      default: return 'Navid Music';
    }
  };

  return (
    <header className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-[var(--bg-base)]/85 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectScreen('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/80 rounded-[10px] flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-violet-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
              <span>{getScreenTitle(currentScreen)}</span>
              {currentScreen === 'home' && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                  v2.4
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium">
              Offline Hi-Fi Player
            </p>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSearch}
          aria-label="Search songs"
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 active:scale-95 transition-all"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectScreen('equalizer')}
          aria-label="Open Equalizer"
          className={`p-2 rounded-xl transition-all ${
            currentScreen === 'equalizer'
              ? 'text-[var(--accent)] bg-[var(--accent-glow)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
          }`}
          title="Audio Equalizer & Bass Boost"
        >
          <Sliders className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSelectScreen('android-export')}
          aria-label="Export Android APK"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            currentScreen === 'android-export'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
              : 'bg-white/5 hover:bg-white/10 text-emerald-400 border-white/10'
          }`}
          title="Download Android Studio Project & Build APK"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">APK Project</span>
        </button>

        <button
          onClick={onCycleTheme}
          aria-label="Switch Theme"
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 active:scale-95 transition-all capitalize"
          title={`Theme: ${theme}`}
        >
          <Palette className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export const BottomNavBar: React.FC<{
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}> = ({ currentScreen, onSelectScreen }) => {
  const tabs = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'songs' as ScreenId, label: 'Songs', icon: Music2 },
    { id: 'folders' as ScreenId, label: 'Folders', icon: FolderOpen },
    { id: 'playlists' as ScreenId, label: 'Playlists', icon: ListMusic },
    { id: 'settings' as ScreenId, label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--player-bar-bg)] backdrop-blur-xl border-t border-white/10 px-2 py-1.5 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectScreen(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-[var(--accent-glow)] scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-0.5 shadow-sm shadow-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const ScreenSubHeader: React.FC<{
  currentScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
}> = ({ currentScreen, onSelectScreen }) => {
  const categories = [
    { id: 'home' as ScreenId, label: 'Home' },
    { id: 'songs' as ScreenId, label: 'All Songs' },
    { id: 'folders' as ScreenId, label: 'Folders' },
    { id: 'albums' as ScreenId, label: 'Albums' },
    { id: 'artists' as ScreenId, label: 'Artists' },
    { id: 'playlists' as ScreenId, label: 'Playlists' },
    { id: 'favorites' as ScreenId, label: 'Favorites' }
  ];

  return (
    <div className="overflow-x-auto no-scrollbar px-4 py-2 flex items-center gap-2 border-b border-white/5">
      {categories.map((cat) => {
        const isActive = currentScreen === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectScreen(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
                : 'bg-white/5 text-[var(--text-secondary)] hover:bg-white/10 hover:text-[var(--text-primary)]'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
