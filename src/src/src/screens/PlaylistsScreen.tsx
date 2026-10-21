import React, { useState } from 'react';
import { Song, Playlist } from '../types/music';
import {
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Trash2,
  Edit2,
  ArrowLeft,
  Music2,
  MoreVertical,
  X
} from 'lucide-react';

interface PlaylistsScreenProps {
  playlists: Playlist[];
  songs: Song[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onCreatePlaylist: (name: string, description?: string) => void;
  onRenamePlaylist: (playlistId: string, newName: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveFromPlaylist: (playlistId: string, songId: string) => void;
}

export const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({
  playlists,
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const [renameModalId, setRenameModalId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const currentPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const playlistSongs = currentPlaylist
    ? currentPlaylist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreateModal(false);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameModalId && renameValue.trim()) {
      onRenamePlaylist(renameModalId, renameValue.trim());
      setRenameModalId(null);
      setRenameValue('');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {selectedPlaylistId && currentPlaylist ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedPlaylistId(null)}
            className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Playlists</span>
          </button>

          {/* Playlist Details Banner */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg">
                  <ListMusic className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">
                    {currentPlaylist.name}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {currentPlaylist.description || `${playlistSongs.length} Tracks`}
                  </p>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)]/70 mt-1">
                    {playlistSongs.length} songs
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setRenameModalId(currentPlaylist.id);
                    setRenameValue(currentPlaylist.name);
                  }}
                  className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 active:scale-90 transition-all"
                  title="Rename Playlist"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete playlist "${currentPlaylist.name}"?`)) {
                      onDeletePlaylist(currentPlaylist.id);
                      setSelectedPlaylistId(null);
                    }
                  }}
                  className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 active:scale-90 transition-all"
                  title="Delete Playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {playlistSongs.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onPlayAll(playlistSongs)}
                  className="flex-1 py-2 rounded-xl bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[var(--accent-glow)] active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => onShuffleAll(playlistSongs)}
                  className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>Shuffle</span>
                </button>
              </div>
            )}
          </div>

          {/* Playlist Tracks */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
            {playlistSongs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                This playlist is currently empty. Add songs from the "All Songs" tab.
              </div>
            ) : (
              playlistSongs.map((song, idx) => (
                <div
                  key={`${song.id}-${idx}`}
                  onClick={() => onPlaySong(song, playlistSongs)}
                  className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-6 text-center">
                      {idx + 1}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromPlaylist(currentPlaylist.id, song.id);
                      }}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-rose-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Remove from playlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Playlists List */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                Playlists ({playlists.length})
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Custom mix collections and moods
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-md shadow-[var(--accent-glow)] flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Playlist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <ListMusic className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {pl.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {pl.songIds.length} tracks
                    </p>
                  </div>
                </div>

                <div className="p-2 rounded-full bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-white transition-all shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3"
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Create New Playlist
            </h3>
            <input
              type="text"
              placeholder="Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              autoFocus
              className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="text"
              placeholder="Optional Description"
              value={newPlaylistDesc}
              onChange={(e) => setNewPlaylistDesc(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newPlaylistName.trim()}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Playlist Modal */}
      {renameModalId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl space-y-3"
          >
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Rename Playlist
            </h3>
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
              className="w-full bg-[var(--bg-surface)] border border-white/10 rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRenameModalId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameValue.trim()}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
