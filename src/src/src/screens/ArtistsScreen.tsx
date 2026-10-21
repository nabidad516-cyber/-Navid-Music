import React, { useState, useMemo } from 'react';
import { Song } from '../types/music';
import { Users, Play, Shuffle, ArrowLeft, Disc3 } from 'lucide-react';

interface ArtistsScreenProps {
  songs: Song[];
  onPlaySong: (song: Song, playlistContext?: Song[]) => void;
  onPlayAll: (songs: Song[]) => void;
  onShuffleAll: (songs: Song[]) => void;
}

export const ArtistsScreen: React.FC<ArtistsScreenProps> = ({
  songs,
  onPlaySong,
  onPlayAll,
  onShuffleAll
}) => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const artists = useMemo(() => {
    const map = new Map<string, { coverArt: string; songs: Song[] }>();
    songs.forEach((s) => {
      const artistName = s.artist || 'Unknown Artist';
      if (!map.has(artistName)) {
        map.set(artistName, { coverArt: s.coverArt, songs: [] });
      }
      map.get(artistName)!.songs.push(s);
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      coverArt: data.coverArt,
      songs: data.songs
    }));
  }, [songs]);

  const currentArtistData = selectedArtist
    ? artists.find((a) => a.name === selectedArtist)
    : null;

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4 pb-32 animate-in fade-in duration-200">
      {selectedArtist && currentArtistData ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedArtist(null)}
            className="flex items-center gap-2 text-sm font-bold text-[var(--accent)] hover:underline active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Artists</span>
          </button>

          {/* Artist Hero Header */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl shrink-0 border-2 border-[var(--accent)]">
              <img
                src={currentArtistData.coverArt}
                alt={currentArtistData.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                Artist
              </span>
              <h2 className="text-xl font-black text-[var(--text-primary)] truncate">
                {currentArtistData.name}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {currentArtistData.songs.length} Tracks in Library
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => onPlayAll(currentArtistData.songs)}
                  className="py-1.5 px-3.5 rounded-xl bg-[var(--accent)] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[var(--accent-glow)] active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => onShuffleAll(currentArtistData.songs)}
                  className="py-1.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 border border-white/10 active:scale-95 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </div>

          {/* Artist Songs */}
          <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl divide-y divide-white/5 overflow-hidden shadow-xl">
            {currentArtistData.songs.map((song, idx) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song, currentArtistData.songs)}
                className="flex items-center justify-between p-3.5 hover:bg-white/5 cursor-pointer active:bg-white/10 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono font-semibold text-[var(--text-secondary)] w-6 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={song.coverArt}
                    alt={song.title}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {song.title}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {song.album}
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySong(song, currentArtistData.songs);
                  }}
                  className="p-1.5 rounded-full bg-white/5 group-hover:bg-[var(--accent)] group-hover:text-white transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Artists List */
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
              Artists ({artists.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Performers and creators in your library
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {artists.map((artist) => (
              <div
                key={artist.name}
                onClick={() => setSelectedArtist(artist.name)}
                className="bg-[var(--bg-card)] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 active:scale-95 transition-all group flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden mb-3 shadow-lg group-hover:scale-105 transition-transform duration-500 border border-white/10">
                  <img
                    src={artist.coverArt}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate w-full">
                  {artist.name}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {artist.songs.length} {artist.songs.length === 1 ? 'track' : 'tracks'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
