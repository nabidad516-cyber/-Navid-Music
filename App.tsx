import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, Playlist, ThemeId, ScreenId, RepeatMode } from './types/music';
import { AudioEngine } from './services/audioEngine';
import { audioScanner } from './services/audioScanner';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { TopAppBar, BottomNavBar, ScreenSubHeader } from './components/Navigation';
import { NowPlayingBar } from './components/NowPlayingBar';
import { NowPlayingModal } from './components/NowPlayingModal';

import { HomeScreen } from './screens/HomeScreen';
import { SongsScreen } from './screens/SongsScreen';
import { FoldersScreen } from './screens/FoldersScreen';
import { AlbumsScreen } from './screens/AlbumsScreen';
import { ArtistsScreen } from './screens/ArtistsScreen';
import { PlaylistsScreen } from './screens/PlaylistsScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { EqualizerScreen } from './screens/EqualizerScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AndroidExportModal } from './screens/AndroidExportModal';

import { Search, X, CheckCircle, Smartphone } from 'lucide-react';

export default function App() {
  const engineRef = useRef<AudioEngine>(AudioEngine.getInstance());
  const engine = engineRef.current;

  // App State
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentQueue, setCurrentQueue] = useState<Song[]>([]);

  // Navigation & UI State
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('dark');
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // File Inputs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  // Load Initial Songs & Playlists from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const storedSongs = await audioScanner.getStoredSongs();
        const storedPlaylists = await audioScanner.getStoredPlaylists();
        setSongs(storedSongs);
        setPlaylists(storedPlaylists);
        setCurrentQueue(storedSongs);

        if (storedSongs.length > 0 && !currentSong) {
          setCurrentSong(storedSongs[0]);
        }
      } catch (err) {
        console.error('Failed to load songs from IndexedDB:', err);
      }
    }
    loadData();
  }, []);

  // Theme synchronization with body attribute & meta theme-color
  useEffect(() => {
    document.body.setAttribute('data-theme', currentTheme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    const themeColors: Record<ThemeId, string> = {
      dark: '#0b0f19',
      amoled: '#000000',
      neon: '#090314',
      blue: '#030d1d',
      red: '#140507',
      green: '#03120b',
      light: '#f8fafc'
    };
    if (metaTheme) {
      metaTheme.setAttribute('content', themeColors[currentTheme] || '#0b0f19');
    }
  }, [currentTheme]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Audio Engine Event Listeners
  useEffect(() => {
    const unsubTime = engine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      setDuration(dur);
    });

    const unsubPlayState = engine.onPlayState((playing) => {
      setIsPlaying(playing);
    });

    const unsubSongChange = engine.onSongChange((song) => {
      setCurrentSong(song);
    });

    const unsubEnded = engine.onEnded(() => {
      handleSongEnded();
    });

    return () => {
      unsubTime();
      unsubPlayState();
      unsubSongChange();
      unsubEnded();
    };
  }, [currentSong, currentQueue, repeatMode, isShuffle]);

  // MediaSession API setup
  useEffect(() => {
    engine.registerMediaSessionHandlers({
      onPlay: () => engine.resume(),
      onPause: () => engine.pause(),
      onNext: () => handleNextTrack(),
      onPrevious: () => handlePreviousTrack(),
      onSeek: (seconds) => engine.seek(seconds)
    });
  }, [currentSong, currentQueue, isShuffle]);

  const handlePlaySong = (song: Song, playlistContext?: Song[]) => {
    if (playlistContext) {
      setCurrentQueue(playlistContext);
    }
    engine.playSong(song);

    // Update playCount & lastPlayed in songs list and DB
    setSongs((prev) => {
      const updated = prev.map((s) =>
        s.id === song.id
          ? { ...s, playCount: (s.playCount || 0) + 1, lastPlayed: Date.now() }
          : s
      );
      audioScanner.saveSongs(updated).catch(console.error);
      return updated;
    });
  };

  const handleTogglePlayPause = () => {
    if (!currentSong && songs.length > 0) {
      handlePlaySong(songs[0], songs);
      return;
    }
    engine.togglePlayPause();
  };

  const handleNextTrack = () => {
    if (currentQueue.length === 0) return;
    if (isShuffle) {
      const randIdx = Math.floor(Math.random() * currentQueue.length);
      handlePlaySong(currentQueue[randIdx]);
      return;
    }

    const currentIdx = currentQueue.findIndex((s) => s.id === currentSong?.id);
    const nextIdx = (currentIdx + 1) % currentQueue.length;
    handlePlaySong(currentQueue[nextIdx]);
  };

  const handlePreviousTrack = () => {
    if (currentTime > 3) {
      engine.seek(0);
      return;
    }
    if (currentQueue.length === 0) return;
    const currentIdx = currentQueue.findIndex((s) => s.id === currentSong?.id);
    const prevIdx = (currentIdx - 1 + currentQueue.length) % currentQueue.length;
    handlePlaySong(currentQueue[prevIdx]);
  };

  const handleSongEnded = () => {
    if (repeatMode === 'one' && currentSong) {
      engine.seek(0);
      engine.resume();
    } else if (repeatMode === 'all') {
      handleNextTrack();
    } else {
      // Repeat off: stop at end of queue
      const currentIdx = currentQueue.findIndex((s) => s.id === currentSong?.id);
      if (currentIdx < currentQueue.length - 1) {
        handleNextTrack();
      } else {
        engine.pause();
      }
    }
  };

  const handlePlayAll = (songsToPlay: Song[]) => {
    if (songsToPlay.length === 0) return;
    setCurrentQueue(songsToPlay);
    handlePlaySong(songsToPlay[0], songsToPlay);
  };

  const handleShuffleAll = (songsToPlay: Song[]) => {
    if (songsToPlay.length === 0) return;
    const shuffled = [...songsToPlay].sort(() => Math.random() - 0.5);
    setCurrentQueue(shuffled);
    setIsShuffle(true);
    handlePlaySong(shuffled[0], shuffled);
    showToast('Shuffle Mix Started');
  };

  const handleToggleFavorite = (songId: string) => {
    setSongs((prev) => {
      const updated = prev.map((s) =>
        s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s
      );
      audioScanner.saveSongs(updated).catch(console.error);
      const target = updated.find((s) => s.id === songId);
      if (target) {
        showToast(target.isFavorite ? 'Added to Favorites' : 'Removed from Favorites');
      }
      return updated;
    });
  };

  const handleCycleRepeat = () => {
    const modes: RepeatMode[] = ['all', 'one', 'off'];
    const nextIdx = (modes.indexOf(repeatMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    setRepeatMode(nextMode);
    showToast(`Repeat: ${nextMode.toUpperCase()}`);
  };

  const handleToggleShuffle = () => {
    setIsShuffle((prev) => {
      const next = !prev;
      showToast(next ? 'Shuffle Enabled' : 'Shuffle Disabled');
      return next;
    });
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    engine.setPlaybackRate(rate);
    showToast(`Speed: ${rate}x`);
  };

  // Playlists management
  const handleCreatePlaylist = (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      songIds: [],
      createdAt: Date.now(),
      isCustom: true
    };
    const updated = [newPlaylist, ...playlists];
    setPlaylists(updated);
    audioScanner.savePlaylists(updated).catch(console.error);
    showToast(`Playlist "${name}" created`);
  };

  const handleRenamePlaylist = (playlistId: string, newName: string) => {
    const updated = playlists.map((p) =>
      p.id === playlistId ? { ...p, name: newName } : p
    );
    setPlaylists(updated);
    audioScanner.savePlaylists(updated).catch(console.error);
    showToast('Playlist renamed');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    const updated = playlists.filter((p) => p.id !== playlistId);
    setPlaylists(updated);
    audioScanner.savePlaylists(updated).catch(console.error);
    showToast('Playlist deleted');
  };

  const handleAddToPlaylist = (playlistId: string, songId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        if (p.songIds.includes(songId)) return p;
        return { ...p, songIds: [...p.songIds, songId] };
      }
      return p;
    });
    setPlaylists(updated);
    audioScanner.savePlaylists(updated).catch(console.error);
    showToast('Song added to playlist');
  };

  const handleRemoveFromPlaylist = (playlistId: string, songId: string) => {
    const updated = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, songIds: p.songIds.filter((id) => id !== songId) };
      }
      return p;
    });
    setPlaylists(updated);
    audioScanner.savePlaylists(updated).catch(console.error);
    showToast('Removed from playlist');
  };

  // Scanning files & folders
  const handleImportFiles = () => {
    fileInputRef.current?.click();
  };

  const handleImportFolder = () => {
    if ('showDirectoryPicker' in window) {
      (window as unknown as { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> })
        .showDirectoryPicker()
        .then(async (dirHandle) => {
          showToast(`Scanning directory: ${dirHandle.name}...`);
          // Fallback to directory input if file handle reading requires permission tokens
          folderInputRef.current?.click();
        })
        .catch(() => {
          folderInputRef.current?.click();
        });
    } else {
      folderInputRef.current?.click();
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast(`Parsing ${files.length} audio files...`);
    const newSongs = await audioScanner.parseAudioFiles(files);
    if (newSongs.length > 0) {
      const merged = [...newSongs, ...songs];
      setSongs(merged);
      audioScanner.saveSongs(merged).catch(console.error);
      showToast(`Added ${newSongs.length} local songs to library!`);
      // Start playing the newly imported first track
      handlePlaySong(newSongs[0], merged);
    } else {
      showToast('No compatible audio tracks found in selection.');
    }
    e.target.value = '';
  };

  const handleResetLibrary = () => {
    const demoSongs = audioScanner.generateInitialDemoSongs();
    setSongs(demoSongs);
    audioScanner.saveSongs(demoSongs).catch(console.error);
    handlePlaySong(demoSongs[0], demoSongs);
    showToast('Library reset to high quality demo tracks');
  };

  const handleCycleTheme = () => {
    const themeList: ThemeId[] = ['dark', 'amoled', 'neon', 'blue', 'red', 'green', 'light'];
    const nextIdx = (themeList.indexOf(currentTheme) + 1) % themeList.length;
    setCurrentTheme(themeList[nextIdx]);
    showToast(`Theme: ${themeList[nextIdx].toUpperCase()}`);
  };

  // Global search filtered results
  const globalSearchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.album.toLowerCase().includes(q) ||
        s.folder.toLowerCase().includes(q)
    );
  }, [songs, globalSearchQuery]);

  const totalSizeMb = songs.reduce((acc, s) => acc + (s.fileSize || 0), 0) / (1024 * 1024);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors flex flex-col justify-between selection:bg-[var(--accent)] selection:text-white">
      {/* Hidden file input elements */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.flac,.wav,.m4a,.ogg,.aac,.opus"
        className="hidden"
        onChange={handleFilesSelected}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        // @ts-expect-error webkitdirectory is standard in HTML5 directory pickers
        webkitdirectory="true"
        directory="true"
        className="hidden"
        onChange={handleFilesSelected}
      />

      {/* Main App Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1 relative">
        {/* Android Status Bar */}
        <AndroidStatusBar isPlaying={isPlaying} />

        {/* Top App Bar */}
        <TopAppBar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          onOpenSearch={() => setIsSearchOpen(true)}
          theme={currentTheme}
          onCycleTheme={handleCycleTheme}
        />

        {/* Sub-Header Horizontal Category Tabs */}
        {currentScreen !== 'equalizer' && currentScreen !== 'settings' && currentScreen !== 'android-export' && (
          <ScreenSubHeader
            currentScreen={currentScreen}
            onSelectScreen={setCurrentScreen}
          />
        )}

        {/* Dynamic Screen Content */}
        <main className="flex-1">
          {currentScreen === 'home' && (
            <HomeScreen
              songs={songs}
              playlists={playlists}
              onPlaySong={handlePlaySong}
              onShuffleAll={handleShuffleAll}
              onSelectScreen={setCurrentScreen}
              onToggleFavorite={handleToggleFavorite}
              onOpenEqualizer={() => setCurrentScreen('equalizer')}
              onScanMusic={handleImportFiles}
            />
          )}

          {currentScreen === 'songs' && (
            <SongsScreen
              songs={songs}
              playlists={playlists}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
              onToggleFavorite={handleToggleFavorite}
              onAddToPlaylist={handleAddToPlaylist}
              onScanMusic={handleImportFiles}
            />
          )}

          {currentScreen === 'folders' && (
            <FoldersScreen
              songs={songs}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
              onScanFolder={handleImportFolder}
            />
          )}

          {currentScreen === 'albums' && (
            <AlbumsScreen
              songs={songs}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
            />
          )}

          {currentScreen === 'artists' && (
            <ArtistsScreen
              songs={songs}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
            />
          )}

          {currentScreen === 'playlists' && (
            <PlaylistsScreen
              playlists={playlists}
              songs={songs}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
              onCreatePlaylist={handleCreatePlaylist}
              onRenamePlaylist={handleRenamePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
            />
          )}

          {currentScreen === 'favorites' && (
            <FavoritesScreen
              songs={songs}
              onPlaySong={handlePlaySong}
              onPlayAll={handlePlayAll}
              onShuffleAll={handleShuffleAll}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {currentScreen === 'equalizer' && (
            <EqualizerScreen engine={engine} />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              currentTheme={currentTheme}
              onSelectTheme={setCurrentTheme}
              songsCount={songs.length}
              totalSizeMb={totalSizeMb}
              onScanMusic={handleImportFiles}
              onResetLibrary={handleResetLibrary}
              onOpenAndroidExport={() => setCurrentScreen('android-export')}
              onSelectScreen={setCurrentScreen}
            />
          )}

          {currentScreen === 'android-export' && (
            <AndroidExportModal />
          )}
        </main>

        {/* Bottom Floating Mini Player */}
        <NowPlayingBar
          song={currentSong}
          isPlaying={isPlaying}
          engine={engine}
          currentTime={currentTime}
          duration={duration}
          onTogglePlayPause={handleTogglePlayPause}
          onNext={handleNextTrack}
          onToggleFavorite={handleToggleFavorite}
          onOpenFullPlayer={() => setIsFullPlayerOpen(true)}
        />

        {/* Bottom Android Navigation Bar */}
        <BottomNavBar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
        />
      </div>

      {/* Full-Screen Now Playing Modal */}
      <NowPlayingModal
        isOpen={isFullPlayerOpen}
        song={currentSong}
        isPlaying={isPlaying}
        engine={engine}
        currentTime={currentTime}
        duration={duration}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        queue={currentQueue}
        onClose={() => setIsFullPlayerOpen(false)}
        onTogglePlayPause={handleTogglePlayPause}
        onNext={handleNextTrack}
        onPrevious={handlePreviousTrack}
        onSeek={(time) => engine.seek(time)}
        onToggleFavorite={handleToggleFavorite}
        onToggleShuffle={handleToggleShuffle}
        onCycleRepeat={handleCycleRepeat}
        onOpenEqualizer={() => {
          setIsFullPlayerOpen(false);
          setCurrentScreen('equalizer');
        }}
        onSelectQueueSong={(song) => handlePlaySong(song, currentQueue)}
        playbackRate={playbackRate}
        onChangePlaybackRate={handleChangePlaybackRate}
      />

      {/* Global Quick Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 animate-in fade-in duration-150">
          <div className="max-w-md mx-auto w-full space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search all songs, artists, albums..."
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-[var(--bg-card)] border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] shadow-xl"
                />
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setGlobalSearchQuery('');
                }}
                className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/15"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--bg-card)] border border-white/10 rounded-2xl max-h-[70vh] overflow-y-auto divide-y divide-white/5 shadow-2xl">
              {globalSearchQuery.trim() === '' ? (
                <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                  Type a song title, artist, or album name to search instantly.
                </div>
              ) : globalSearchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-[var(--text-secondary)]">
                  No matching tracks found for "{globalSearchQuery}".
                </div>
              ) : (
                globalSearchResults.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      handlePlaySong(song, songs);
                      setIsSearchOpen(false);
                      setGlobalSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer"
                  >
                    <img
                      src={song.coverArt}
                      alt={song.title}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                        {song.title}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] truncate">
                        {song.artist} • {song.album}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-2xl bg-black/90 border border-white/15 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
