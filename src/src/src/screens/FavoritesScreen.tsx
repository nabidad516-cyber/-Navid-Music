import React from 'react';
import { Song } from '../types/music';
import { Heart, Play, Shuffle, Music2 } from 'lucide-react';

interface FavoritesScreenProps {
  songs: Song[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onToggleFavorite
}) => {
  const favoriteSongs = songs.filter((s) => s.isFavorite);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900 border border-rose-500/20 rounded-3xl p-6 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 shrink-0">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              Favorite Tracks
            </h2>
            <p className="text-xs text-rose-200 mt-0.5">
              {favoriteSongs.length} Starred Songs • Quick Offline Mix
            </p>
          </div>
        </div>
      </div>

      {favoriteSongs.length > 0 && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlayAll(favoriteSongs)}
            className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Favorites</span>
          </button>
          <button
            onClick={() => onShuffleAll(favoriteSongs)}
            className="flex-1 py-2.5 rounded-2xl bg-[var(--bg-card)] hover:bg-white/5 border border-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle</span>
          </button>
        </div>
      )}

      {/* Favorites List */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
        {favoriteSongs.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <Heart className="w-12 h-12 text-rose-500 mx-auto opacity-40" />
            <p className="text-sm font-bold text-[var(--text-primary)]">
              No favorites yet
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Tap the heart icon on any song to add it to your favorite collection.
            </p>
          </div>
        ) : (
          favoriteSongs.map((song, idx) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, favoriteSongs)}
              className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-6 text-center">
                  {idx + 1}
                </span>
                <img
                  src={song.coverArt}
                  alt={song.title}
                  className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-rose-400 transition-colors truncate">
                    {song.title}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {song.artist} • {song.album}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-[var(--text-secondary)]">
                  {formatDuration(song.duration)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(song.id);
                  }}
                  className="p-2 text-rose-500 hover:scale-110 active:scale-90 transition-all"
                  title="Remove from favorites"
                >
                  <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
