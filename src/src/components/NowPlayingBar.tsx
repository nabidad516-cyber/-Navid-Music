import React from 'react';
import { Song } from '../types/music';
import { AudioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import { Play, Pause, SkipForward, Heart } from 'lucide-react';

interface NowPlayingBarProps {
  song: Song | null;
  isPlaying: boolean;
  engine: AudioEngine;
  currentTime: number;
  duration: number;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onToggleFavorite: (songId: string) => void;
  onOpenFullPlayer: () => void;
}

export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
  song,
  isPlaying,
  engine,
  currentTime,
  duration,
  onTogglePlayPause,
  onNext,
  onToggleFavorite,
  onOpenFullPlayer
}) => {
  if (!song) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 px-3 pb-1 max-w-md mx-auto pointer-events-auto">
      <div
        onClick={onOpenFullPlayer}
        className="relative overflow-hidden bg-[var(--bg-card)]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl cursor-pointer hover:border-white/20 transition-all group"
      >
        {/* Progress line along top edge */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-[var(--accent)] transition-all duration-200"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Cover & Song Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md">
              <img
                src={song.coverArt}
                alt={song.title}
                className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                  {song.title}
                </h4>
                {song.format && (
                  <span className="text-[9px] uppercase font-mono px-1 py-0.5 rounded bg-white/10 text-white/70 shrink-0 font-semibold">
                    {song.format}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {song.artist}
              </p>
            </div>
          </div>

          {/* Mini Visualizer */}
          <div className="hidden sm:block w-14 h-8 shrink-0">
            <AudioVisualizer
              engine={engine}
              isPlaying={isPlaying}
              barCount={10}
              height={32}
              styleMode="bars"
            />
          </div>

          {/* Control Buttons */}
          <div
            className="flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleFavorite(song.id)}
              className="p-2 text-[var(--text-secondary)] hover:text-rose-500 active:scale-90 transition-all"
              title={song.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`w-4 h-4 ${
                  song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>

            <button
              onClick={onTogglePlayPause}
              className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-lg shadow-[var(--accent-glow)] active:scale-95 transition-all hover:brightness-110"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-90 transition-all"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
