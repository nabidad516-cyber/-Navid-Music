export type ThemeId = 'dark' | 'amoled' | 'neon' | 'blue' | 'red' | 'green' | 'light';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  url: string; // audio source url or blob/data url
  coverArt: string; // image url or base64
  folder: string; // e.g. "/Music/Rock" or "Internal Storage/Download"
  fileSize?: number; // bytes
  format?: 'mp3' | 'flac' | 'wav' | 'm4a' | 'ogg' | 'aac';
  bitrate?: string; // e.g. "320 kbps", "Lossless 24-bit"
  sampleRate?: string; // e.g. "44.1 kHz", "48.0 kHz"
  addedDate: number; // timestamp
  playCount: number;
  lastPlayed?: number;
  isFavorite: boolean;
  lyrics?: string;
  isLocalUserFile?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  coverArt?: string;
  isCustom?: boolean;
}

export interface EqualizerBand {
  freq: number;
  label: string;
  gain: number; // -12dB to +12dB
}

export type EqualizerPresetName =
  | 'Normal'
  | 'Rock'
  | 'Pop'
  | 'Jazz'
  | 'Classical'
  | 'Dance'
  | 'Hip-Hop'
  | 'Bass Boost'
  | 'Vocal Boost'
  | 'Electronic'
  | 'Custom';

export interface EqualizerState {
  enabled: boolean;
  preset: EqualizerPresetName;
  bands: EqualizerBand[];
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100
  preamp: number; // -6dB to +6dB
}

export type RepeatMode = 'off' | 'all' | 'one';

export type ScreenId =
  | 'home'
  | 'songs'
  | 'folders'
  | 'albums'
  | 'artists'
  | 'playlists'
  | 'favorites'
  | 'equalizer'
  | 'settings'
  | 'android-export';

export interface FolderNode {
  path: string;
  name: string;
  songCount: number;
  subfolders: string[];
  songIds: string[];
}
