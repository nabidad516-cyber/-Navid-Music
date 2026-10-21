import React, { useState } from 'react';
import { ThemeId, ScreenId } from '../types/music';
import {
  Palette,
  HardDrive,
  ShieldCheck,
  Smartphone,
  Info,
  RotateCcw,
  Volume2,
  Check,
  ChevronRight,
  FolderOpen,
  Sparkles
} from 'lucide-react';

interface SettingsScreenProps {
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
  songsCount: number;
  totalSizeMb: number;
  onScanMusic: () => void;
  onResetLibrary: () => void;
  onOpenAndroidExport: () => void;
  onSelectScreen: (screen: ScreenId) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentTheme,
  onSelectTheme,
  songsCount,
  totalSizeMb,
  onScanMusic,
  onResetLibrary,
  onOpenAndroidExport,
  onSelectScreen
}) => {
  const [gapless, setGapless] = useState(true);
  const [crossfade, setCrossfade] = useState(2);
  const [audioFocus, setAudioFocus] = useState(true);

  const themes: { id: ThemeId; name: string; bg: string; accent: string; desc: string }[] = [
    { id: 'dark', name: 'Dark Slate', bg: '#0b0f19', accent: '#8b5cf6', desc: 'Sleek obsidian & navy' },
    { id: 'amoled', name: 'AMOLED Black', bg: '#000000', accent: '#a855f7', desc: 'Pure #000000 OLED battery saver' },
    { id: 'neon', name: 'Purple Neon', bg: '#090314', accent: '#d946ef', desc: 'Vibrant cyberpunk neon' },
    { id: 'blue', name: 'Sapphire Blue', bg: '#030d1d', accent: '#0284c7', desc: 'Deep electric oceanic' },
    { id: 'red', name: 'Crimson Red', bg: '#140507', accent: '#e11d48', desc: 'Intense ruby & scarlet glow' },
    { id: 'green', name: 'Emerald Green', bg: '#03120b', accent: '#10b981', desc: 'Matrix mint & forest' },
    { id: 'light', name: 'Clean Light', bg: '#f8fafc', accent: '#6366f1', desc: 'Crisp porcelain & graphite' }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-32 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          Themes & Settings
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Personalize colors, audio engine, device permissions, and APK export
        </p>
      </div>

      {/* Theme Picker Section */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Appearance & Themes
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {themes.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left active:scale-95 ${
                  isSelected
                    ? 'border-[var(--accent)] bg-[var(--accent-glow)] shadow-md'
                    : 'border-white/5 bg-[var(--bg-surface)] hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border border-white/20 shadow-sm"
                    style={{ background: t.bg }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ background: t.accent }}
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">
                      {t.name}
                    </h4>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      {t.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Android APK & Studio Export Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Android APK & Project Exporter
              </h3>
              <p className="text-xs text-emerald-200">
                Package: <code className="font-mono font-bold">com.navid.music</code>
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAndroidExport}
            className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-400/20 active:scale-95 transition-all"
          >
            Open Exporter
          </button>
        </div>
        <p className="text-[11px] text-emerald-100/80 leading-relaxed">
          Generates complete Android Studio project code with ExoPlayer Media3, AudioFX Equalizer, MediaStore queries, and 1-click downloadable ZIP archive.
        </p>
      </div>

      {/* Storage & Music Library */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Device Library & Storage
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 p-3 rounded-2xl">
            <span className="text-[11px] text-[var(--text-secondary)]">Indexed Audio Files</span>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{songsCount} Tracks</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl">
            <span className="text-[11px] text-[var(--text-secondary)]">Estimated Space</span>
            <p className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{totalSizeMb.toFixed(1)} MB</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={onScanMusic}
            className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent-glow)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Scan Music Storage</span>
          </button>
          <button
            onClick={() => {
              if (confirm('Reset music library to default sample high-fidelity songs?')) {
                onResetLibrary();
              }
            }}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] hover:text-white flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Tracks</span>
          </button>
        </div>
      </div>

      {/* Android Permissions Guide */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Android Media Permissions
          </h3>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Navid Music is configured to comply with Android 7 through 16 security guidelines:
        </p>
        <ul className="space-y-2 text-xs text-[var(--text-primary)]">
          <li className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl">
            <span className="font-bold text-cyan-400 shrink-0">Android 13–16:</span>
            <span>Uses <code className="font-mono text-cyan-300">READ_MEDIA_AUDIO</code> and <code className="font-mono text-cyan-300">POST_NOTIFICATIONS</code> for lock-screen controls.</span>
          </li>
          <li className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl">
            <span className="font-bold text-cyan-400 shrink-0">Android 7–12:</span>
            <span>Uses <code className="font-mono text-cyan-300">READ_EXTERNAL_STORAGE</code> with scoped storage compatibility.</span>
          </li>
        </ul>
      </div>

      {/* Playback Settings */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Volume2 className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Playback Engine
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--text-primary)]">Gapless Audio Playback</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Preload next track to eliminate pauses</p>
            </div>
            <input
              type="checkbox"
              checked={gapless}
              onChange={(e) => setGapless(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-[var(--text-primary)]">Audio Focus Management</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Pause on incoming phone calls & navigation alerts</p>
            </div>
            <input
              type="checkbox"
              checked={audioFocus}
              onChange={(e) => setAudioFocus(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)]"
            />
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)]">Crossfade Duration</span>
              <span className="font-mono text-[var(--accent)] font-bold">{crossfade}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={8}
              value={crossfade}
              onChange={(e) => setCrossfade(parseInt(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* About Box */}
      <div className="text-center space-y-1 text-xs text-[var(--text-secondary)] pt-4">
        <p className="font-bold text-[var(--text-primary)]">Navid Music • Version 2.4.0</p>
        <p>Package: com.navid.music • High Fidelity Audio Player</p>
        <p className="text-[11px] opacity-75">Designed for Android 7 through Android 16</p>
      </div>
    </div>
  );
};
