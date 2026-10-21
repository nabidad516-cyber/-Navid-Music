import React, { useState, useMemo } from 'react';
import { Song, Playlist } from '../types/music';
import {
  Play,
  Shuffle,
  Search,
  ArrowUpDown,
  Heart,
  MoreVertical,
  Plus,
  FileAudio,
  Sparkles,
  Folder,
  Check
} from 'lucide-react';

interface SongsScreenProps {
  songs: Song[];
  playlists: Playlist[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onToggleFavorite: (songId: string) => void;
  onAddToPlaylist: (playlistId: string, songId: string) => void;
  onScanMusic: () => void;
}

export const SongsScreen: React.FC<SongsScreenProps> = ({
  songs,
  playlists,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onToggleFavorite,
  onAddToPlaylist,
  onScanMusic
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration' | 'date'>('title');
  const [activeMenuSongId, setActiveMenuSongId] = useState<string | null>(null);
  const [showPlaylistSelect, setShowPlaylistSelect] = useState<string | null>(null);

  const filteredAndSortedSongs = useMemo(() => {
    let result = [...songs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return b.duration - a.duration;
      if (sortBy === 'date') return (b.addedDate || 0) - (a.addedDate || 0);
      return 0;
    });

    return result;
  }, [songs, searchQuery, sortBy]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
            All Songs ({songs.length})
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Local device audio and high fidelity music library
          </p>
        </div>

        <button
          onClick={onScanMusic}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent-glow)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <FileAudio className="w-4 h-4" />
          <span>Import Files</span>
        </button>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Search by title, artist, or album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-white/10 rounded-2xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'title' | 'artist' | 'duration' | 'date')}
            className="bg-[var(--bg-card)] border border-white/10 rounded-2xl px-3 py-2 text-xs font-semibold text-[var(--text-primary)] appearance-none pr-8 cursor-pointer focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="title">Sort: Title</option>
            <option value="artist">Sort: Artist</option>
            <option value="duration">Sort: Duration</option>
            <option value="date">Sort: Date Added</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
        </div>
      </div>

      {/* Quick Actions: Play All / Shuffle All */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPlayAll(filteredAndSortedSongs)}
          className="flex-1 py-2.5 rounded-2xl bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] active:scale-95 transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Play All ({filteredAndSortedSongs.length})</span>
        </button>

        <button
          onClick={() => onShuffleAll(filteredAndSortedSongs)}
          className="flex-1 py-2.5 rounded-2xl bg-[var(--bg-card)] hover:bg-white/5 border border-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <Shuffle className="w-4 h-4" />
          <span>Shuffle All</span>
        </button>
      </div>

      {/* Track List */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
        {filteredAndSortedSongs.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <FileAudio className="w-10 h-10 text-[var(--text-secondary)] mx-auto opacity-40" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              No matching tracks found
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Try adjusting your search or import audio files from your device.
            </p>
          </div>
        ) : (
          filteredAndSortedSongs.map((song, index) => (
            <div
              key={song.id}
              onClick={() => onPlaySong(song, filteredAndSortedSongs)}
              className="flex items-center justify-between p-3 sm:p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group relative"
            >
              {/* Left: Thumbnail & Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-5 text-center shrink-0">
                  {index + 1}
                </span>

                <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={song.coverArt}
                    alt={song.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {song.title}
                    </h4>
                    {song.format === 'flac' && (
                      <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        FLAC
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {song.artist} • {song.album}
                  </p>
                </div>
              </div>

              {/* Right: Duration, Favorite, Actions */}
              <div
                className="flex items-center gap-1 sm:gap-2 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs font-mono text-[var(--text-secondary)] hidden xs:inline">
                  {formatDuration(song.duration)}
                </span>

                <button
                  onClick={() => onToggleFavorite(song.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-rose-500 active:scale-90 transition-all"
                  title="Favorite"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      song.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                </button>

                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveMenuSongId(activeMenuSongId === song.id ? null : song.id)
                    }
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-white/5 active:scale-90 transition-all"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Context menu popup */}
                  {activeMenuSongId === song.id && (
                    <div className="absolute right-0 top-10 z-40 bg-[var(--bg-surface)] border border-white/10 rounded-2xl p-2 w-48 shadow-2xl space-y-1 animate-in fade-in duration-150">
                      <button
                        onClick={() => {
                          setShowPlaylistSelect(song.id);
                          setActiveMenuSongId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-primary)] hover:bg-white/5 flex items-center gap-2"
                      >
                        <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Add to Playlist...</span>
                      </button>
                      <button
                        onClick={() => {
                          onPlaySong(song, filteredAndSortedSongs);
                          setActiveMenuSongId(null);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium text-[var(--text-primary)] hover:bg-white/5 flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Play Now</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Playlist Selector Modal */}
      {showPlaylistSelect && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Add to Playlist
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select target playlist
            </p>

            <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto">
              {playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    onAddToPlaylist(pl.id, showPlaylistSelect);
                    setShowPlaylistSelect(null);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-[var(--accent)] hover:text-white text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <span>{pl.name}</span>
                  <span className="text-[10px] font-mono opacity-60">
                    {pl.songIds.length} tracks
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowPlaylistSelect(null)}
              className="mt-4 w-full py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
