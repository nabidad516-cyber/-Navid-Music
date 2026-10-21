import React, { useState } from 'react';
import { Song, RepeatMode } from '../types/music';
import { AudioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import {
  ChevronDown,
  Heart,
  Shuffle,
  Repeat,
  Repeat1,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Sliders,
  Timer,
  ListMusic,
  FileText,
  Disc,
  Folder,
  Sparkles
} from 'lucide-react';

interface NowPlayingModalProps {
  isOpen: boolean;
  song: Song | null;
  isPlaying: boolean;
  engine: AudioEngine;
  currentTime: number;
  duration: number;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  queue: Song[];
  onClose: () => void;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: (songId: string) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onOpenEqualizer: () => void;
  onSelectQueueSong: (song: Song) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  isOpen,
  song,
  isPlaying,
  engine,
  currentTime,
  duration,
  repeatMode,
  isShuffle,
  queue,
  onClose,
  onTogglePlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleFavorite,
  onToggleShuffle,
  onCycleRepeat,
  onOpenEqualizer,
  onSelectQueueSong,
  playbackRate,
  onChangePlaybackRate
}) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'lyrics' | 'queue'>('cover');
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  if (!isOpen || !song) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const startSleepTimer = (minutes: number) => {
    setSleepTimerRemaining(minutes);
    setShowSleepTimerModal(false);
    setTimeout(() => {
      engine.pause();
      setSleepTimerRemaining(null);
    }, minutes * 60 * 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300">
      {/* Background ambient glow matching current theme */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'var(--accent)' }}
        />
      </div>

      <div className="relative flex flex-col min-h-full max-w-md mx-auto w-full px-5 py-4 z-10 justify-between">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Collapse player"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-secondary)]">
              Now Playing
            </span>
            <p className="text-xs font-medium text-[var(--text-primary)] max-w-[200px] truncate">
              {song.album}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSleepTimerModal(true)}
              className={`p-2.5 rounded-full transition-all ${
                sleepTimerRemaining ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 hover:bg-white/10 text-[var(--text-secondary)]'
              }`}
              title="Sleep Timer"
            >
              <Timer className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenEqualizer}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--accent)] active:scale-95 transition-all"
              title="Open Audio Equalizer"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector: Cover / Lyrics / Queue */}
        <div className="flex items-center justify-center gap-1 my-3 bg-white/5 p-1 rounded-xl self-center border border-white/5">
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'cover'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Artwork</span>
          </button>
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'lyrics'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lyrics</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'queue'
                ? 'bg-[var(--accent)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Queue ({queue.length})</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="my-auto py-2 flex flex-col items-center justify-center">
          {activeTab === 'cover' && (
            <div className="flex flex-col items-center w-full">
              {/* Album Art with Vinyl / Shadow */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={song.coverArt}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Audio Quality Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold tracking-wider text-white">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{song.bitrate || '320 KBPS'}</span>
                  <span className="opacity-40">•</span>
                  <span>{song.sampleRate || '44.1 KHZ'}</span>
                </div>
              </div>

              {/* Dynamic Real-time Frequency Visualizer */}
              <div className="w-full max-w-xs h-12 mt-5">
                <AudioVisualizer
                  engine={engine}
                  isPlaying={isPlaying}
                  barCount={32}
                  height={48}
                  styleMode="mirror"
                />
              </div>
            </div>
          )}

          {activeTab === 'lyrics' && (
            <div className="w-full h-72 overflow-y-auto px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col justify-center">
              {song.lyrics ? (
                <div className="space-y-3 font-medium leading-relaxed text-sm text-[var(--text-primary)]">
                  {song.lyrics.split('\n').map((line, idx) => (
                    <p key={idx} className="hover:text-[var(--accent)] transition-colors cursor-default">
                      {line}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center text-[var(--text-secondary)]">
                  <FileText className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No synchronized lyrics found for this track.</p>
                  <p className="text-xs text-[var(--text-secondary)]/70 mt-1">
                    Navid Music supports embedded ID3 USLT lyrics and .lrc files.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="w-full h-72 overflow-y-auto rounded-2xl bg-white/5 border border-white/5 p-2 divide-y divide-white/5">
              <div className="px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center justify-between">
                <span>Up Next</span>
                <span>{queue.length} Tracks</span>
              </div>
              {queue.map((qSong, idx) => (
                <div
                  key={`${qSong.id}-${idx}`}
                  onClick={() => onSelectQueueSong(qSong)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    qSong.id === song.id
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)] font-semibold'
                      : 'hover:bg-white/5 text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={qSong.coverArt}
                      alt={qSong.title}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{qSong.title}</p>
                      <p className="text-[11px] text-[var(--text-secondary)] truncate">
                        {qSong.artist}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                    {formatTime(qSong.duration)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Track Metadata & Favorite */}
        <div className="flex items-center justify-between mt-2">
          <div className="min-w-0 flex-1 pr-3">
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] truncate">
              {song.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium truncate mt-0.5">
              {song.artist}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]/70 mt-1">
              <Folder className="w-3 h-3" />
              <span className="truncate">{song.folder}</span>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(song.id)}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-90 transition-all text-[var(--text-secondary)] hover:text-rose-500"
            aria-label="Favorite toggle"
          >
            <Heart
              className={`w-6 h-6 ${
                song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>
        </div>

        {/* Progress Scrubber Bar */}
        <div className="mt-4">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer"
            aria-label="Seek time"
          />
          <div className="flex items-center justify-between text-xs font-mono font-medium text-[var(--text-secondary)] mt-1.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between mt-3 mb-2 px-1">
          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${
              isShuffle
                ? 'text-[var(--accent)] bg-[var(--accent-glow)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Rewind 10s */}
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-90 transition-all"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={onPrevious}
            className="p-3 rounded-full text-[var(--text-primary)] hover:bg-white/5 active:scale-90 transition-all"
            title="Previous Song"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          {/* Play / Pause Giant Button */}
          <button
            onClick={onTogglePlayPause}
            className="w-16 h-16 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-xl shadow-[var(--accent-glow)] hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white translate-x-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            className="p-3 rounded-full text-[var(--text-primary)] hover:bg-white/5 active:scale-90 transition-all"
            title="Next Song"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>

          {/* Fast Forward 10s */}
          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-90 transition-all"
            title="Forward 10 seconds"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={onCycleRepeat}
            className={`p-2.5 rounded-full transition-all active:scale-90 ${
              repeatMode !== 'off'
                ? 'text-[var(--accent)] bg-[var(--accent-glow)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Bottom Utility Bar: Speed & Sleep Timer status */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-[11px]">Speed:</span>
            {[0.8, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onChangePlaybackRate(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  playbackRate === rate
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-white/5 hover:bg-white/10 text-[var(--text-secondary)]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {sleepTimerRemaining && (
              <span className="text-[11px] font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                Timer: {sleepTimerRemaining}m
              </span>
            )}
            <button
              onClick={onOpenEqualizer}
              className="text-[11px] font-semibold text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              <span>Equalizer FX</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sleep Timer Picker Modal */}
      {showSleepTimerModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Timer className="w-5 h-5 text-violet-400" />
              <span>Set Sleep Timer</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Music will gently pause when the timer expires.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-4">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => startSleepTimer(mins)}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-[var(--accent)] hover:text-white font-semibold text-sm transition-all"
                >
                  {mins} Minutes
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  setSleepTimerRemaining(null);
                  setShowSleepTimerModal(false);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
              >
                Cancel Timer
              </button>
              <button
                onClick={() => setShowSleepTimerModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
