import React from 'react';
import { Song, Playlist, ScreenId } from '../types/music';
import {
  Play,
  Shuffle,
  Sparkles,
  Flame,
  Clock,
  Heart,
  Folder,
  Disc3,
  Sliders,
  FolderOpen,
  Music2,
  HardDrive,
  Download
} from 'lucide-react';

interface HomeScreenProps {
  songs: Song[];
  playlists: Playlist[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onSelectScreen: (screen: ScreenId) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenEqualizer: () => void;
  onScanMusic: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  songs,
  playlists,
  onPlaySong,
  onShuffleAll,
  onSelectScreen,
  onToggleFavorite,
  onOpenEqualizer,
  onScanMusic
}) => {
  // Recently added or played
  const recentlyPlayed = [...songs]
    .sort((a, b) => (b.lastPlayed || b.addedDate) - (a.lastPlayed || a.addedDate))
    .slice(0, 5);

  // Most played (favorites or highest playCount)
  const mostPlayed = [...songs]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5);

  // Favorites
  const favoriteSongs = songs.filter((s) => s.isFavorite);

  // Quick folders
  const uniqueFolders = Array.from(new Set(songs.map((s) => s.folder || 'Music'))).slice(0, 4);

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Hero Welcome & Quick Play Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-700 to-slate-900 p-6 text-white shadow-2xl border border-white/10">
        <div className="absolute right-0 top-0 -translate-y-8 translate-x-8 w-48 h-48 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Offline Master Hi-Fi</span>
            </span>

            <button
              onClick={onOpenEqualizer}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-xs font-semibold flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>AudioFX</span>
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight">
              Navid Music Player
            </h2>
            <p className="text-xs text-white/80 font-medium mt-0.5">
              {songs.length} audio tracks scanned • 100% Offline Playback
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => songs.length > 0 && onPlaySong(songs[0], songs)}
              className="py-2.5 px-5 rounded-2xl bg-white text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg hover:bg-white/90 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Quick Play</span>
            </button>

            <button
              onClick={() => onShuffleAll(songs)}
              className="py-2.5 px-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 border border-white/20 active:scale-95 transition-all"
            >
              <Shuffle className="w-4 h-4" />
              <span>Shuffle Mix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Category Badges */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => onSelectScreen('songs')}
          className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-white/20 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Music2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] mt-2">Songs</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{songs.length}</span>
        </button>

        <button
          onClick={() => onSelectScreen('folders')}
          className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-white/20 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] mt-2">Folders</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{uniqueFolders.length}</span>
        </button>

        <button
          onClick={() => onSelectScreen('favorites')}
          className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-white/20 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] mt-2">Favorites</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{favoriteSongs.length}</span>
        </button>

        <button
          onClick={() => onSelectScreen('playlists')}
          className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:border-white/20 active:scale-95 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Disc3 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-primary)] mt-2">Playlists</span>
          <span className="text-[10px] text-[var(--text-secondary)]">{playlists.length}</span>
        </button>
      </div>

      {/* Recently Played Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <span>Recently Played</span>
          </h3>
          <button
            onClick={() => onSelectScreen('songs')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            See All
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {recentlyPlayed.map((song) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, songs)}
              className="w-36 bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 shrink-0 cursor-pointer hover:border-white/20 active:scale-95 transition-all group"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 shadow-md">
                <img
                  src={song.coverArt}
                  alt={song.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute right-2 bottom-2 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                </div>
              </div>
              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                {song.title}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                {song.artist}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Most Played List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Most Played Hits</span>
          </h3>
        </div>

        <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
          {mostPlayed.map((song, idx) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, songs)}
              className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-bold text-[var(--text-secondary)] w-5 text-center">
                  #{idx + 1}
                </span>
                <img
                  src={song.coverArt}
                  alt={song.title}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {song.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-mono font-medium text-[var(--text-secondary)]">
                  {song.playCount} plays
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-rose-500 transition-colors"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Device Storage Scan Banner */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Scan Phone Storage
            </h4>
            <p className="text-xs text-[var(--text-secondary)]">
              Discover audio files stored in /Music, /Downloads, SD card
            </p>
          </div>
        </div>

        <button
          onClick={onScanMusic}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all shrink-0"
        >
          Scan Now
        </button>
      </div>
    </div>
  );
};
