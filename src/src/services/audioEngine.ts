import { EqualizerBand, EqualizerPresetName, EqualizerState, Song } from '../types/music';

export const EQUALIZER_PRESETS: Record<EqualizerPresetName, { bands: number[]; bass: number; virtualizer: number }> = {
  Normal: { bands: [0, 0, 0, 0, 0], bass: 0, virtualizer: 0 },
  Rock: { bands: [4.5, 2.5, -1.5, 3.0, 5.0], bass: 35, virtualizer: 20 },
  Pop: { bands: [-1.5, 2.0, 4.0, 2.0, -1.0], bass: 25, virtualizer: 15 },
  Jazz: { bands: [3.5, 1.5, -1.0, 2.0, 3.5], bass: 20, virtualizer: 30 },
  Classical: { bands: [4.0, 2.5, -1.5, 2.0, 3.0], bass: 15, virtualizer: 40 },
  Dance: { bands: [5.5, 3.0, 0.5, 2.5, 4.5], bass: 65, virtualizer: 30 },
  'Hip-Hop': { bands: [6.5, 4.5, 0.0, 2.0, 3.5], bass: 75, virtualizer: 25 },
  'Bass Boost': { bands: [8.0, 5.5, 1.0, 0.0, 0.0], bass: 90, virtualizer: 10 },
  'Vocal Boost': { bands: [-2.0, 2.5, 5.5, 3.5, -1.0], bass: 10, virtualizer: 15 },
  Electronic: { bands: [5.0, 3.5, -1.0, 3.0, 4.5], bass: 55, virtualizer: 35 },
  Custom: { bands: [0, 0, 0, 0, 0], bass: 0, virtualizer: 0 }
};

export const DEFAULT_BANDS: EqualizerBand[] = [
  { freq: 60, label: '60 Hz', gain: 0 },
  { freq: 230, label: '230 Hz', gain: 0 },
  { freq: 910, label: '910 Hz', gain: 0 },
  { freq: 3600, label: '3.6 kHz', gain: 0 },
  { freq: 14000, label: '14 kHz', gain: 0 }
];

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private bandFilters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private virtualizerGain: GainNode | null = null;
  private preampGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  private currentSong: Song | null = null;
  private isPlaying = false;
  private equalizerState: EqualizerState = {
    enabled: true,
    preset: 'Normal',
    bands: JSON.parse(JSON.stringify(DEFAULT_BANDS)),
    bassBoost: 20,
    virtualizer: 15,
    preamp: 0
  };

  private listeners: {
    timeUpdate: ((currentTime: number, duration: number) => void)[];
    playState: ((isPlaying: boolean) => void)[];
    ended: (() => void)[];
    songChange: ((song: Song | null) => void)[];
    error: ((err: string) => void)[];
  } = {
    timeUpdate: [],
    playState: [],
    ended: [],
    songChange: [],
    error: []
  };

  private animationFrameId: number | null = null;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.setupAudioListeners();
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  private initAudioNodes() {
    if (this.audioCtx) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

      // 1. Preamp Gain
      this.preampGain = this.audioCtx.createGain();
      this.preampGain.gain.value = 1.0;

      // 2. 5-Band Biquad Filters
      this.bandFilters = DEFAULT_BANDS.map((band, idx) => {
        const filter = this.audioCtx!.createBiquadFilter();
        if (idx === 0) {
          filter.type = 'lowshelf';
        } else if (idx === DEFAULT_BANDS.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
          filter.Q.value = 1.4;
        }
        filter.frequency.value = band.freq;
        filter.gain.value = band.gain;
        return filter;
      });

      // 3. Bass Boost filter (lowshelf at 85 Hz)
      this.bassBoostFilter = this.audioCtx.createBiquadFilter();
      this.bassBoostFilter.type = 'lowshelf';
      this.bassBoostFilter.frequency.value = 85;
      this.bassBoostFilter.gain.value = (this.equalizerState.bassBoost / 100) * 12;

      // 4. Virtualizer / Spatial widening simulator
      this.virtualizerGain = this.audioCtx.createGain();
      this.virtualizerGain.gain.value = 1.0;

      // 5. Analyser for real-time visualization spectrum
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;

      // 6. Master output Gain
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = 1.0;

      // Connect graph:
      // source -> preamp -> band0 -> band1 -> band2 -> band3 -> band4 -> bassBoost -> analyser -> masterGain -> destination
      let lastNode: AudioNode = this.sourceNode;
      lastNode.connect(this.preampGain);
      lastNode = this.preampGain;

      for (const filter of this.bandFilters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      lastNode.connect(this.bassBoostFilter);
      lastNode = this.bassBoostFilter;

      lastNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      this.applyEqualizerState();
    } catch (e) {
      console.warn('AudioContext initialization deferred or restricted:', e);
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('timeupdate', () => {
      const dur = isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : this.currentSong?.duration || 0;
      this.listeners.timeUpdate.forEach(cb => cb(this.audio.currentTime, dur));
    });

    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.listeners.playState.forEach(cb => cb(true));
      this.updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.listeners.playState.forEach(cb => cb(false));
      this.updateMediaSessionPlaybackState('paused');
    });

    this.audio.addEventListener('ended', () => {
      this.listeners.ended.forEach(cb => cb());
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e);
      this.listeners.error.forEach(cb => cb('Playback error occurred on this track.'));
    });
  }

  public async playSong(song: Song, resumeTime?: number) {
    this.initAudioNodes();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const isDifferentSong = !this.currentSong || this.currentSong.id !== song.id;
    this.currentSong = song;

    if (isDifferentSong || !this.audio.src) {
      this.audio.src = song.url;
      this.audio.load();
    }

    if (typeof resumeTime === 'number' && resumeTime >= 0) {
      this.audio.currentTime = resumeTime;
    }

    try {
      await this.audio.play();
      this.isPlaying = true;
      this.listeners.songChange.forEach(cb => cb(song));
      this.updateMediaSessionMetadata(song);
    } catch (err) {
      console.warn('Playback play request prevented by user gesture constraint:', err);
    }
  }

  public pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  public resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    this.audio.play().catch(e => console.warn('Resume error:', e));
  }

  public togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public seek(seconds: number) {
    if (isFinite(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || 9999));
    }
  }

  public seekRelative(offsetSeconds: number) {
    this.seek(this.audio.currentTime + offsetSeconds);
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
  }

  public setPlaybackRate(rate: number) {
    this.audio.playbackRate = Math.max(0.5, Math.min(2.5, rate));
  }

  public getCurrentTime(): number {
    return this.audio.currentTime || 0;
  }

  public getDuration(): number {
    return isFinite(this.audio.duration) && this.audio.duration > 0
      ? this.audio.duration
      : this.currentSong?.duration || 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSong(): Song | null {
    return this.currentSong;
  }

  // Equalizer controls
  public getEqualizerState(): EqualizerState {
    return this.equalizerState;
  }

  public setBandGain(bandIndex: number, gainDb: number) {
    if (this.equalizerState.bands[bandIndex]) {
      this.equalizerState.bands[bandIndex].gain = gainDb;
      this.equalizerState.preset = 'Custom';
      this.applyEqualizerState();
    }
  }

  public setBassBoost(percent: number) {
    this.equalizerState.bassBoost = Math.max(0, Math.min(100, percent));
    this.applyEqualizerState();
  }

  public setVirtualizer(percent: number) {
    this.equalizerState.virtualizer = Math.max(0, Math.min(100, percent));
    this.applyEqualizerState();
  }

  public setPreamp(db: number) {
    this.equalizerState.preamp = Math.max(-6, Math.min(6, db));
    this.applyEqualizerState();
  }

  public toggleEqualizer(enabled?: boolean) {
    this.equalizerState.enabled = enabled !== undefined ? enabled : !this.equalizerState.enabled;
    this.applyEqualizerState();
  }

  public setPreset(presetName: EqualizerPresetName) {
    const preset = EQUALIZER_PRESETS[presetName];
    if (preset) {
      this.equalizerState.preset = presetName;
      this.equalizerState.bands.forEach((b, idx) => {
        b.gain = preset.bands[idx] ?? 0;
      });
      this.equalizerState.bassBoost = preset.bass;
      this.equalizerState.virtualizer = preset.virtualizer;
      this.applyEqualizerState();
    }
  }

  private applyEqualizerState() {
    if (!this.audioCtx) return;

    const isEnabled = this.equalizerState.enabled;

    // Preamp
    if (this.preampGain) {
      const db = isEnabled ? this.equalizerState.preamp : 0;
      const linear = Math.pow(10, db / 20);
      this.preampGain.gain.setTargetAtTime(linear, this.audioCtx.currentTime, 0.05);
    }

    // 5 Bands
    this.bandFilters.forEach((filter, idx) => {
      const targetGain = isEnabled ? this.equalizerState.bands[idx].gain : 0;
      filter.gain.setTargetAtTime(targetGain, this.audioCtx!.currentTime, 0.05);
    });

    // Bass Boost (lowshelf filter boost)
    if (this.bassBoostFilter) {
      const boostDb = isEnabled ? (this.equalizerState.bassBoost / 100) * 14 : 0;
      this.bassBoostFilter.gain.setTargetAtTime(boostDb, this.audioCtx.currentTime, 0.05);
    }
  }

  // Real-time Frequency Spectrum for Visualizer
  public getFrequencyData(array: Uint8Array): void {
    if (this.analyser) {
      // Type assertion for TS 7 compatibility between ArrayBufferLike and ArrayBuffer
      (this.analyser as unknown as { getByteFrequencyData: (arr: Uint8Array) => void }).getByteFrequencyData(array);
    } else {
      array.fill(0);
    }
  }

  // Android MediaSession Notification and Lock-Screen integration
  private updateMediaSessionMetadata(song: Song) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artist,
          album: song.album,
          artwork: [
            { src: song.coverArt, sizes: '96x96', type: 'image/png' },
            { src: song.coverArt, sizes: '128x128', type: 'image/png' },
            { src: song.coverArt, sizes: '192x192', type: 'image/png' },
            { src: song.coverArt, sizes: '256x256', type: 'image/png' },
            { src: song.coverArt, sizes: '512x512', type: 'image/png' }
          ]
        });
      } catch (e) {
        console.warn('MediaSession metadata error:', e);
      }
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = state;
      } catch (e) {
        console.warn('MediaSession playbackState error:', e);
      }
    }
  }

  public registerMediaSessionHandlers(handlers: {
    onPlay: () => void;
    onPause: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onSeek: (seconds: number) => void;
  }) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', handlers.onPlay);
        navigator.mediaSession.setActionHandler('pause', handlers.onPause);
        navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevious);
        navigator.mediaSession.setActionHandler('nexttrack', handlers.onNext);
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            handlers.onSeek(details.seekTime);
          }
        });
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          this.seekRelative(-(details.seekOffset || 10));
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          this.seekRelative(details.seekOffset || 10);
        });
      } catch (e) {
        console.warn('Error setting MediaSession handlers:', e);
      }
    }
  }

  // Event subscription helpers
  public onTimeUpdate(cb: (currentTime: number, duration: number) => void) {
    this.listeners.timeUpdate.push(cb);
    return () => {
      this.listeners.timeUpdate = this.listeners.timeUpdate.filter(x => x !== cb);
    };
  }

  public onPlayState(cb: (isPlaying: boolean) => void) {
    this.listeners.playState.push(cb);
    return () => {
      this.listeners.playState = this.listeners.playState.filter(x => x !== cb);
    };
  }

  public onEnded(cb: () => void) {
    this.listeners.ended.push(cb);
    return () => {
      this.listeners.ended = this.listeners.ended.filter(x => x !== cb);
    };
  }

  public onSongChange(cb: (song: Song | null) => void) {
    this.listeners.songChange.push(cb);
    return () => {
      this.listeners.songChange = this.listeners.songChange.filter(x => x !== cb);
    };
  }
}
