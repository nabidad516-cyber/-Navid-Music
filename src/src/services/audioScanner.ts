import { Song, Playlist } from '../types/music';
import { INITIAL_SONGS, INITIAL_PLAYLISTS, createSynthesizedAudioUrl } from './sampleMusic';

const DB_NAME = 'navid_music_db';
const DB_VERSION = 1;
const STORE_SONGS = 'songs';
const STORE_PLAYLISTS = 'playlists';
const STORE_SETTINGS = 'settings';

export class AudioScannerService {
  private db: IDBDatabase | null = null;

  public async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SONGS)) {
          db.createObjectStore(STORE_SONGS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
          db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public async getStoredSongs(): Promise<Song[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_SONGS, 'readonly');
        const store = tx.objectStore(STORE_SONGS);
        const req = store.getAll();
        req.onsuccess = () => {
          const songs: Song[] = req.result || [];
          if (songs.length === 0) {
            // Populate initial demo songs with real audio
            const initializedSongs = this.generateInitialDemoSongs();
            this.saveSongs(initializedSongs).catch(console.error);
            resolve(initializedSongs);
          } else {
            resolve(songs);
          }
        };
        req.onerror = () => {
          resolve(this.generateInitialDemoSongs());
        };
      });
    } catch {
      return this.generateInitialDemoSongs();
    }
  }

  public generateInitialDemoSongs(): Song[] {
    const genres: ('synthwave' | 'lofi' | 'dance' | 'ambient' | 'rock' | 'acoustic')[] = [
      'synthwave',
      'lofi',
      'dance',
      'ambient',
      'rock',
      'acoustic'
    ];

    return INITIAL_SONGS.map((song, idx) => {
      const audioUrl = createSynthesizedAudioUrl(genres[idx % genres.length]);
      return {
        ...song,
        url: audioUrl
      };
    });
  }

  public async saveSongs(songs: Song[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SONGS, 'readwrite');
      const store = tx.objectStore(STORE_SONGS);
      songs.forEach(song => store.put(song));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getStoredPlaylists(): Promise<Playlist[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_PLAYLISTS, 'readonly');
        const store = tx.objectStore(STORE_PLAYLISTS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result;
          if (!list || list.length === 0) {
            this.savePlaylists(INITIAL_PLAYLISTS).catch(console.error);
            resolve(INITIAL_PLAYLISTS);
          } else {
            resolve(list);
          }
        };
        req.onerror = () => resolve(INITIAL_PLAYLISTS);
      });
    } catch {
      return INITIAL_PLAYLISTS;
    }
  }

  public async savePlaylists(playlists: Playlist[]): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PLAYLISTS, 'readwrite');
      const store = tx.objectStore(STORE_PLAYLISTS);
      store.clear();
      playlists.forEach(p => store.put(p));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Parse local files selected from phone or desktop
  public async parseAudioFiles(files: FileList | File[]): Promise<Song[]> {
    const parsedSongs: Song[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|flac|wav|m4a|ogg|aac|opus)$/i)) {
        continue;
      }

      try {
        const song = await this.parseSingleFile(file);
        parsedSongs.push(song);
      } catch (e) {
        console.warn(`Failed parsing metadata for ${file.name}:`, e);
      }
    }

    return parsedSongs;
  }

  private async parseSingleFile(file: File): Promise<Song> {
    const fileUrl = URL.createObjectURL(file);
    const id = `song-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Default metadata derived from filename
    let cleanName = file.name.replace(/\.[^/.]+$/, '');
    let title = cleanName;
    let artist = 'Unknown Artist';
    let album = 'Local Device Storage';
    let coverArt = '';

    // Check if filename is "Artist - Title" format
    if (cleanName.includes(' - ')) {
      const parts = cleanName.split(' - ');
      artist = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    // Try parsing ID3 tags from file arrayBuffer
    try {
      const buffer = await file.slice(0, 1024 * 512).arrayBuffer(); // read first 512KB for headers
      const id3Data = this.parseId3v2(buffer);
      if (id3Data.title) title = id3Data.title;
      if (id3Data.artist) artist = id3Data.artist;
      if (id3Data.album) album = id3Data.album;
      if (id3Data.coverArt) coverArt = id3Data.coverArt;
    } catch {
      // ID3 parsing optional fallback
    }

    // Determine folder path
    let folder = 'Internal Storage/Music';
    if ((file as unknown as { webkitRelativePath?: string }).webkitRelativePath) {
      const rel = (file as unknown as { webkitRelativePath: string }).webkitRelativePath;
      const parts = rel.split('/');
      if (parts.length > 1) {
        folder = `Internal Storage/${parts.slice(0, parts.length - 1).join('/')}`;
      }
    }

    // Measure duration
    const duration = await this.getAudioDuration(fileUrl);

    // Format & Bitrate
    const extMatch = file.name.match(/\.([a-z0-9]+)$/i);
    const format = (extMatch ? extMatch[1].toLowerCase() : 'mp3') as Song['format'];
    const bitrate = format === 'flac' ? 'Lossless 24-bit' : format === 'wav' ? '1411 kbps' : '320 kbps';

    if (!coverArt) {
      // Generate clean modern SVG cover
      coverArt = this.generateFallbackCover(title, artist);
    }

    return {
      id,
      title,
      artist,
      album,
      duration: duration || 180,
      url: fileUrl,
      coverArt,
      folder,
      fileSize: file.size,
      format,
      bitrate,
      sampleRate: '44.1 kHz',
      addedDate: Date.now(),
      playCount: 0,
      isFavorite: false,
      isLocalUserFile: true
    };
  }

  private getAudioDuration(url: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      const onLoaded = () => {
        cleanup();
        resolve(audio.duration && isFinite(audio.duration) ? audio.duration : 180);
      };
      const onError = () => {
        cleanup();
        resolve(180);
      };
      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('error', onError);
      audio.src = url;
    });
  }

  // Fast ID3v2 parser for standard MP3 files
  private parseId3v2(buffer: ArrayBuffer): { title?: string; artist?: string; album?: string; coverArt?: string } {
    const result: { title?: string; artist?: string; album?: string; coverArt?: string } = {};
    const view = new DataView(buffer);

    // Check 'ID3' header
    if (view.byteLength < 10) return result;
    const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2));
    if (magic !== 'ID3') return result;

    const version = view.getUint8(3); // e.g. 3 for ID3v2.3, 4 for ID3v2.4
    let pos = 10;
    const maxLen = Math.min(buffer.byteLength, 256000);

    while (pos < maxLen - 10) {
      const frameId = String.fromCharCode(
        view.getUint8(pos),
        view.getUint8(pos + 1),
        view.getUint8(pos + 2),
        view.getUint8(pos + 3)
      );

      // check if valid ascii chars
      if (!/^[A-Z0-9]{4}$/.test(frameId)) break;

      let frameSize = 0;
      if (version === 4) {
        // syncsafe integer
        frameSize = (view.getUint8(pos + 4) << 21) | (view.getUint8(pos + 5) << 14) | (view.getUint8(pos + 6) << 7) | view.getUint8(pos + 7);
      } else {
        frameSize = view.getUint32(pos + 4);
      }

      if (frameSize <= 0 || pos + 10 + frameSize > buffer.byteLength) break;

      const frameData = new Uint8Array(buffer, pos + 10, Math.min(frameSize, 200000));

      if (frameId === 'TIT2' && !result.title) {
        result.title = this.decodeTextFrame(frameData);
      } else if (frameId === 'TPE1' && !result.artist) {
        result.artist = this.decodeTextFrame(frameData);
      } else if (frameId === 'TALB' && !result.album) {
        result.album = this.decodeTextFrame(frameData);
      } else if (frameId === 'APIC' && !result.coverArt) {
        // Picture frame
        try {
          const art = this.decodeApicFrame(frameData);
          if (art) result.coverArt = art;
        } catch {
          // ignore
        }
      }

      pos += 10 + frameSize;
    }

    return result;
  }

  private decodeTextFrame(bytes: Uint8Array): string {
    if (bytes.length < 2) return '';
    const encoding = bytes[0];
    const data = bytes.slice(1);

    if (encoding === 0) {
      // ISO-8859-1
      return new TextDecoder('iso-8859-1').decode(data).replace(/\0.*$/g, '').trim();
    } else if (encoding === 1 || encoding === 2) {
      // UTF-16
      return new TextDecoder('utf-16').decode(data).replace(/\0.*$/g, '').trim();
    } else {
      // UTF-8
      return new TextDecoder('utf-8').decode(data).replace(/\0.*$/g, '').trim();
    }
  }

  private decodeApicFrame(bytes: Uint8Array): string | null {
    if (bytes.length < 10) return null;
    const encoding = bytes[0];
    let pos = 1;

    // MIME type is null-terminated ASCII
    let mime = '';
    while (pos < bytes.length && bytes[pos] !== 0) {
      mime += String.fromCharCode(bytes[pos]);
      pos++;
    }
    pos++; // skip null terminator

    if (!mime || mime === 'image/') mime = 'image/jpeg';

    pos++; // skip picture type byte

    // Skip description (null terminated according to encoding)
    if (encoding === 1 || encoding === 2) {
      while (pos < bytes.length - 1) {
        if (bytes[pos] === 0 && bytes[pos + 1] === 0) {
          pos += 2;
          break;
        }
        pos += 2;
      }
    } else {
      while (pos < bytes.length && bytes[pos] !== 0) {
        pos++;
      }
      pos++;
    }

    if (pos >= bytes.length) return null;

    const imgBytes = bytes.slice(pos);
    const blob = new Blob([imgBytes], { type: mime });
    return URL.createObjectURL(blob);
  }

  private generateFallbackCover(title: string, artist: string): string {
    const hues = [210, 260, 320, 160, 30, 340];
    const hash = (title + artist).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue1 = hues[hash % hues.length];
    const hue2 = (hue1 + 50) % 360;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue1}, 75%, 28%)"/>
          <stop offset="100%" stop-color="hsl(${hue2}, 85%, 55%)"/>
        </linearGradient>
      </defs>
      <rect width="300" height="300" rx="28" fill="url(#g)"/>
      <circle cx="150" cy="130" r="48" fill="rgba(255,255,255,0.15)"/>
      <path d="M142 105 L142 145 L170 125 Z" fill="#ffffff"/>
      <text x="24" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${title.slice(0, 22)}</text>
      <text x="24" y="268" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="500" fill="rgba(255,255,255,0.75)">${artist.slice(0, 26)}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

export const audioScanner = new AudioScannerService();
