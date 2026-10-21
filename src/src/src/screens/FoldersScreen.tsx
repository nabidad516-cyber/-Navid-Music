import React, { useState, useMemo } from 'react';
import { Song } from '../types/music';
import {
  Folder,
  FolderOpen,
  Music2,
  Play,
  Shuffle,
  ChevronRight,
  ArrowLeft,
  Clock,
  HardDrive,
  FolderPlus
} from 'lucide-react';

interface FoldersScreenProps {
  songs: Song[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
  onScanFolder: () => void;
}

export const FoldersScreen: React.FC<FoldersScreenProps> = ({
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll,
  onScanFolder
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Group songs by folder
  const folderGroups = useMemo(() => {
    const map = new Map<string, Song[]>();
    songs.forEach((s) => {
      const folderPath = s.folder || 'Internal Storage/Music';
      if (!map.has(folderPath)) {
        map.set(folderPath, []);
      }
      map.get(folderPath)!.push(s);
    });
    return Array.from(map.entries()).map(([path, list]) => {
      const parts = path.split('/');
      const name = parts[parts.length - 1] || path;
      const totalDuration = list.reduce((acc, s) => acc + s.duration, 0);
      const totalSize = list.reduce((acc, s) => acc + (s.fileSize || 0), 0);
      return {
        path,
        name,
        count: list.length,
        songs: list,
        totalDuration,
        totalSize
      };
    });
  }, [songs]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) {
      return `${hours}h ${mins % 60}m`;
    }
    return `${mins}m`;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const currentFolderData = selectedFolder
    ? folderGroups.find((f) => f.path === selectedFolder)
    : null;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-32 animate-in fade-in duration-200">
      {/* If inside an open folder view */}
      {selectedFolder && currentFolderData ? (
        <div className="space-y-4">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedFolder(null)}
              className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Folders</span>
            </button>

            <span className="text-xs font-mono text-[var(--text-secondary)]">
              {currentFolderData.count} Songs
            </span>
          </div>

          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <FolderOpen className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-[var(--text-primary)] truncate">
                  {currentFolderData.name}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] truncate font-mono mt-0.5">
                  {currentFolderData.path}
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(currentFolderData.totalDuration)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5" />
                    {formatSize(currentFolderData.totalSize)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Play All / Shuffle All */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => onPlayAll(currentFolderData.songs)}
                className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[var(--accent-glow)] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play All</span>
              </button>
              <button
                onClick={() => onShuffleAll(currentFolderData.songs)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
              >
                <Shuffle className="w-4 h-4" />
                <span>Shuffle</span>
              </button>
            </div>
          </div>

          {/* Song list in this folder */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
            {currentFolderData.songs.map((song, idx) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, currentFolderData.songs)}
                className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-6 text-center">
                    {(idx + 1).toString().padStart(2, '0')}
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

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySong(song, currentFolderData.songs);
                    }}
                    className="p-2 rounded-full bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-white transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Folder Explorer Root */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                Music Folders
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Browse device directories and audio files
              </p>
            </div>

            <button
              onClick={onScanFolder}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--accent)] border border-white/10 flex items-center gap-2 active:scale-95 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Import Folder</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {folderGroups.map((group) => (
              <div
                key={group.path}
                onClick={() => setSelectedFolder(group.path)}
                className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 shadow-lg hover:border-white/20 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Folder className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {group.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                      {group.path}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]/80 mt-1">
                      {group.count} {group.count === 1 ? 'song' : 'songs'} • {formatDuration(group.totalDuration)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayAll(group.songs);
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-[var(--accent)] hover:text-white transition-all"
                    title="Play folder"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-[var(--text-secondary)] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
