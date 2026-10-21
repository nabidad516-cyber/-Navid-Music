import React, { useState, useMemo } from 'react';
import { Song } from '../types/music';
import { Disc3, Play, Shuffle, ArrowLeft, Clock, Disc } from 'lucide-react';

interface AlbumsScreenProps {
  songs: Song[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
}

export const AlbumsScreen: React.FC<AlbumsScreenProps> = ({
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll
}) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  const albums = useMemo(() => {
    const map = new Map<string, { artist: string; coverArt: string; songs: Song[] }>();
    songs.forEach((s) => {
      const albumName = s.album || 'Unknown Album';
      if (!map.has(albumName)) {
        map.set(albumName, {
          artist: s.artist,
          coverArt: s.coverArt,
          songs: []
        });
      }
      map.get(albumName)!.songs.push(s);
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      artist: data.artist,
      coverArt: data.coverArt,
      songs: data.songs,
      totalDuration: data.songs.reduce((acc, s) => acc + s.duration, 0)
    }));
  }, [songs]);

  const currentAlbumData = selectedAlbum
    ? albums.find((a) => a.name === selectedAlbum)
    : null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {selectedAlbum && currentAlbumData ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Albums</span>
          </button>

          {/* Album Hero Details */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-5">
            <img
              src={currentAlbumData.coverArt}
              alt={currentAlbumData.name}
              className="w-36 h-36 rounded-2xl object-cover shadow-2xl shrink-0"
            />
            <div className="min-w-0 flex-1 text-center sm:text-left space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] bg-[var(--accent-glow)] px-2.5 py-1 rounded-full border border-white/10">
                Album
              </span>
              <h2 className="text-xl font-black text-[var(--text-primary)]">
                {currentAlbumData.name}
              </h2>
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                {currentAlbumData.artist}
              </p>
              <p className="text-xs text-[var(--text-secondary)]/80">
                {currentAlbumData.songs.length} Tracks • {Math.round(currentAlbumData.totalDuration / 60)} Minutes
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2.5 pt-2">
                <button
                  onClick={() => onPlayAll(currentAlbumData.songs)}
                  className="py-2 px-4 rounded-xl bg-[var(--accent)] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[var(--accent-glow)] active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Album</span>
                </button>
                <button
                  onClick={() => onShuffleAll(currentAlbumData.songs)}
                  className="py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center gap-2 border border-white/10 active:scale-95 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Album Tracklist */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
            {currentAlbumData.songs.map((song, idx) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, currentAlbumData.songs)}
                className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-6 text-center">
                    {idx + 1}
                  </span>
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
                    {formatDuration(song.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlaySong(song, currentAlbumData.songs);
                    }}
                    className="p-1.5 rounded-full bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-white transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Albums Grid */
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              Albums ({albums.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Discography and curated album releases
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {albums.map((album) => (
              <div
                key={album.name}
                onClick={() => setSelectedAlbum(album.name)}
                className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-3 cursor-pointer hover:border-white/20 active:scale-95 transition-all group flex flex-col"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md">
                  <img
                    src={album.coverArt}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-opacity">
                    <Play className="w-4 h-4 fill-white translate-x-0.5" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {album.name}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] truncate">
                  {album.artist}
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]/70 mt-1">
                  {album.songs.length} {album.songs.length === 1 ? 'song' : 'songs'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
