import { Song, Playlist } from '../types/music';

// Generate vibrant SVG cover arts
function generateCoverArt(title: string, artist: string, bgGradient: string, accentColor: string, iconType: 'waveform' | 'vinyl' | 'notes' | 'headphones' | 'synth'): string {
  const iconSvg = {
    waveform: `<path d="M10 50 L10 70 M20 40 L20 80 M30 30 L30 90 M40 20 L40 100 M50 10 L50 110 M60 25 L60 95 M70 35 L70 85 M80 45 L80 75 M90 52 L90 68" stroke="${accentColor}" stroke-width="6" stroke-linecap="round"/>`,
    vinyl: `<circle cx="60" cy="60" r="45" fill="#111827" stroke="${accentColor}" stroke-width="4"/><circle cx="60" cy="60" r="30" fill="none" stroke="#374151" stroke-width="2"/><circle cx="60" cy="60" r="15" fill="${accentColor}"/><circle cx="60" cy="60" r="4" fill="#ffffff"/>`,
    notes: `<path d="M45 75 A12 10 0 1 1 33 65 L33 30 L80 18 L80 58 A12 10 0 1 1 68 48 L68 28 L45 35 Z" fill="${accentColor}"/>`,
    headphones: `<path d="M30 65 A30 30 0 0 1 90 65 L90 85 A8 8 0 0 1 75 85 L75 65 A15 15 0 0 0 45 65 L45 85 A8 8 0 0 1 30 85 Z" fill="${accentColor}"/>`,
    synth: `<rect x="25" y="40" width="70" height="40" rx="6" fill="#1f2937" stroke="${accentColor}" stroke-width="3"/><rect x="35" y="55" width="8" height="20" fill="#fff" rx="2"/><rect x="47" y="55" width="8" height="20" fill="#fff" rx="2"/><rect x="59" y="55" width="8" height="20" fill="#fff" rx="2"/><rect x="71" y="55" width="8" height="20" fill="#fff" rx="2"/>`
  }[iconType];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        ${bgGradient}
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="300" height="300" rx="24" fill="url(#grad)" />
    <g transform="translate(90, 70)" filter="url(#glow)">
      ${iconSvg}
    </g>
    <circle cx="260" cy="40" r="16" fill="rgba(255,255,255,0.15)"/>
    <text x="24" y="240" font-family="Plus Jakarta Sans, sans-serif" font-size="20" font-weight="700" fill="#ffffff">${title}</text>
    <text x="24" y="268" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="500" fill="rgba(255,255,255,0.7)">${artist} • Navid Music</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Procedural Audio Synthesizer to create high quality audio loops offline in browser
export function createSynthesizedAudioUrl(trackType: 'synthwave' | 'lofi' | 'ambient' | 'dance' | 'rock' | 'acoustic'): string {
  const sampleRate = 44100;
  const bpm = { synthwave: 115, lofi: 80, ambient: 65, dance: 124, rock: 130, acoustic: 95 }[trackType];
  const barSeconds = (60 / bpm) * 4;
  const loopBars = 4;
  const totalDuration = barSeconds * loopBars;
  const numFrames = Math.floor(sampleRate * totalDuration);

  // Create an offline audio context
  const offlineCtx = new (window.OfflineAudioContext || (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext)(2, numFrames, sampleRate);

  const now = 0;
  const master = offlineCtx.createGain();
  master.gain.value = 0.75;
  master.connect(offlineCtx.destination);

  const beatSec = 60 / bpm;

  // Drum synthesis helper
  const playKick = (time: number) => {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.15);
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
    osc.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + 0.35);
  };

  const playSnare = (time: number) => {
    // Noise buffer
    const bufferSize = sampleRate * 0.2;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = offlineCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    const gain = offlineCtx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start(time);
    noise.stop(time + 0.2);
  };

  const playHiHat = (time: number, accent = false) => {
    const bufferSize = sampleRate * 0.05;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = offlineCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;
    const gain = offlineCtx.createGain();
    gain.gain.setValueAtTime(accent ? 0.25 : 0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    noise.start(time);
    noise.stop(time + 0.05);
  };

  const playNote = (freq: number, time: number, dur: number, type: OscillatorType = 'sawtooth', filterFreq = 1800) => {
    const osc = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.frequency.exponentialRampToValueAtTime(400, time + dur);

    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    osc.start(time);
    osc.stop(time + dur);
  };

  // Compose track patterns based on genre
  if (trackType === 'synthwave') {
    // 4 on the floor kicks and snare on 2 & 4
    for (let b = 0; b < loopBars * 4; b++) {
      const t = now + b * beatSec;
      if (b % 4 === 0 || b % 4 === 2) playKick(t);
      if (b % 4 === 1 || b % 4 === 3) playSnare(t);
      for (let h = 0; h < 2; h++) {
        playHiHat(t + h * (beatSec / 2), h === 0);
      }
    }
    // Synth bassline & Arp (A minor / F / C / G)
    const chords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [261.63, 329.63, 392], // C
      [196, 246.94, 293.66], // G
    ];
    for (let bar = 0; bar < loopBars; bar++) {
      const chord = chords[bar % chords.length];
      const barTime = now + bar * barSeconds;
      for (let s = 0; s < 16; s++) {
        const stepTime = barTime + s * (beatSec / 4);
        const pitch = chord[s % chord.length] * (s % 2 === 0 ? 1 : 2);
        playNote(pitch, stepTime, beatSec / 3, 'sawtooth', 2200);
      }
    }
  } else if (trackType === 'lofi') {
    // Lo-Fi chill drums: boom-bap swing
    for (let b = 0; b < loopBars * 4; b++) {
      const t = now + b * beatSec;
      if (b % 4 === 0) playKick(t);
      if (b % 4 === 2) playKick(t + beatSec * 0.6);
      if (b % 4 === 1 || b % 4 === 3) playSnare(t + 0.02);
      playHiHat(t, true);
      playHiHat(t + beatSec * 0.55, false);
    }
    // Warm Rhodes electric piano chords (Dm9, G13, Cmaj9, Am7)
    const chords = [
      [146.83, 220, 261.63, 329.63], // Dm9
      [196, 246.94, 349.23, 440],    // G13
      [130.81, 196, 246.94, 329.63], // Cmaj9
      [220, 261.63, 329.63, 392],    // Am7
    ];
    for (let bar = 0; bar < loopBars; bar++) {
      const chord = chords[bar % chords.length];
      const barTime = now + bar * barSeconds;
      chord.forEach((freq, idx) => {
        playNote(freq, barTime + idx * 0.03, barSeconds * 0.9, 'triangle', 900);
      });
    }
  } else if (trackType === 'dance') {
    // Upbeat EDM / Dance
    for (let b = 0; b < loopBars * 4; b++) {
      const t = now + b * beatSec;
      playKick(t);
      if (b % 2 === 1) playSnare(t);
      playHiHat(t + beatSec * 0.5, true);
    }
    const bassline = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81];
    for (let bar = 0; bar < loopBars; bar++) {
      const barTime = now + bar * barSeconds;
      for (let s = 0; s < 8; s++) {
        playNote(bassline[s], barTime + s * (beatSec / 2), beatSec / 2.5, 'square', 1400);
      }
    }
  } else if (trackType === 'ambient') {
    // Deep ethereal ambient pads
    const ambientPitches = [130.81, 164.81, 196, 246.94, 293.66, 392];
    for (let i = 0; i < 6; i++) {
      playNote(ambientPitches[i], now + i * 1.5, totalDuration * 0.7, 'sine', 600);
    }
  } else if (trackType === 'rock') {
    // Driving rock beat with electric riff
    for (let b = 0; b < loopBars * 4; b++) {
      const t = now + b * beatSec;
      if (b % 2 === 0) playKick(t);
      if (b % 2 === 1) playSnare(t);
      for (let h = 0; h < 4; h++) playHiHat(t + h * (beatSec / 4), h === 0);
    }
    const riff = [164.81, 164.81, 196, 220, 196, 164.81, 146.83, 164.81];
    for (let bar = 0; bar < loopBars; bar++) {
      const barTime = now + bar * barSeconds;
      for (let s = 0; s < 8; s++) {
        playNote(riff[s], barTime + s * (beatSec / 2), beatSec * 0.45, 'sawtooth', 2500);
      }
    }
  } else {
    // Acoustic fingerstyle
    const acousticArp = [196, 246.94, 293.66, 392, 293.66, 246.94];
    for (let bar = 0; bar < loopBars; bar++) {
      const barTime = now + bar * barSeconds;
      for (let s = 0; s < 6; s++) {
        playNote(acousticArp[s], barTime + s * (beatSec / 1.5), beatSec * 0.8, 'triangle', 1500);
      }
    }
  }

  // Render to audio buffer and convert to WAV blob URL
  let renderedUrl = '';
  offlineCtx.startRendering().then((renderedBuffer) => {
    renderedUrl = bufferToWaveUrl(renderedBuffer);
  }).catch(() => {});

  // Since offlineCtx is asynchronous, we also generate an immediate audio data URL using standard PCM wave generator
  return generateProceduralWavBlob(bpm, trackType, totalDuration);
}

// Synchronous high-speed WAV generator for instant playback
function generateProceduralWavBlob(bpm: number, style: string, durationSec: number): string {
  const sampleRate = 22050; // optimized for speed and quality
  const numSamples = Math.floor(sampleRate * Math.min(durationSec, 12)); // 12-second seamless loop
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const beatSec = 60 / bpm;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Bass / Beat rhythm
    const beatPos = (t % beatSec) / beatSec;
    const barPos = (t % (beatSec * 4)) / (beatSec * 4);

    // Kick drum on beats 1 and 3
    if (barPos < 0.25 || (barPos >= 0.5 && barPos < 0.75)) {
      const kickT = (t % (beatSec * 2));
      if (kickT < 0.2) {
        const kickFreq = 120 * Math.exp(-kickT * 18) + 40;
        sample += Math.sin(2 * Math.PI * kickFreq * kickT) * Math.exp(-kickT * 10) * 0.45;
      }
    }

    // Snare / Clap on beats 2 and 4
    if ((barPos >= 0.25 && barPos < 0.5) || barPos >= 0.75) {
      const snareT = (t % beatSec);
      if (snareT < 0.15) {
        sample += (Math.random() * 2 - 1) * Math.exp(-snareT * 22) * 0.25;
      }
    }

    // Melodic synth/chords according to style
    let pitch = 220; // A3
    if (style === 'synthwave') {
      const melodyNotes = [220, 261.63, 293.66, 329.63, 392, 440];
      const noteIdx = Math.floor(t * 4) % melodyNotes.length;
      pitch = melodyNotes[noteIdx];
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.2;
      sample += Math.sin(2 * Math.PI * (pitch * 0.5) * t) * 0.25; // sub bass
    } else if (style === 'lofi') {
      const lofiNotes = [174.61, 220, 261.63, 329.63];
      const noteIdx = Math.floor(t * 1.5) % lofiNotes.length;
      pitch = lofiNotes[noteIdx];
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.25;
      // vinyl crackle
      if (Math.random() < 0.015) sample += (Math.random() * 2 - 1) * 0.15;
    } else if (style === 'dance') {
      const danceNotes = [130.81, 164.81, 196, 261.63];
      const noteIdx = Math.floor(t * 6) % danceNotes.length;
      pitch = danceNotes[noteIdx];
      sample += (Math.sin(2 * Math.PI * pitch * t) > 0 ? 0.18 : -0.18);
    } else {
      const acousticNotes = [196, 246.94, 293.66, 392];
      const noteIdx = Math.floor(t * 3) % acousticNotes.length;
      pitch = acousticNotes[noteIdx];
      sample += Math.sin(2 * Math.PI * pitch * t) * 0.28;
    }

    // Clamp to 16-bit range
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWaveUrl(abuffer: AudioBuffer): string {
  const numOfChan = abuffer.numberOfChannels;
  const length = abuffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample: number;
  let offset = 0;
  let pos = 0;

  writeString(out, pos, 'RIFF'); pos += 4;
  out.setUint32(pos, length - 8, true); pos += 4;
  writeString(out, pos, 'WAVE'); pos += 4;
  writeString(out, pos, 'fmt '); pos += 4;
  out.setUint32(pos, 16, true); pos += 4;
  out.setUint16(pos, 1, true); pos += 2;
  out.setUint16(pos, numOfChan, true); pos += 2;
  out.setUint32(pos, abuffer.sampleRate, true); pos += 4;
  out.setUint32(pos, abuffer.sampleRate * 2 * numOfChan, true); pos += 4;
  out.setUint16(pos, numOfChan * 2, true); pos += 2;
  out.setUint16(pos, 16, true); pos += 2;
  writeString(out, pos, 'data'); pos += 4;
  out.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < abuffer.numberOfChannels; i++) {
    channels.push(abuffer.getChannelData(i));
  }

  while (offset < abuffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  const blob = new Blob([out.buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

// Default initial library of rich songs
export const INITIAL_SONGS: Song[] = [
  {
    id: 'navid-song-1',
    title: 'Midnight Horizon',
    artist: 'Navid feat. Cyberwave',
    album: 'Neon Citylights (Deluxe)',
    duration: 218,
    url: '', // populated at runtime with synthwave audio
    coverArt: generateCoverArt(
      'Midnight Horizon',
      'Navid feat. Cyberwave',
      '<stop offset="0%" stop-color="#4c1d95"/><stop offset="50%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#f43f5e"/>',
      '#38bdf8',
      'synth'
    ),
    folder: 'Internal Storage/Music/Electronic',
    fileSize: 8450112,
    format: 'flac',
    bitrate: 'Lossless 24-bit',
    sampleRate: '48.0 kHz',
    addedDate: Date.now() - 86400000 * 2,
    playCount: 42,
    isFavorite: true,
    lyrics: `[00:08.00] Cruising down the midnight street
[00:15.00] Neon shadows underneath our feet
[00:23.00] Bassline pulsing through the cold night air
[00:31.00] Electric dreams and nothing left to fear
[00:39.00] Turn it up, feel the Navid rhythm roll
[00:47.00] Pure soundwaves healing the soul
[00:55.00] Midnight horizon, burning so bright
[01:03.00] We ride the frequency tonight`
  },
  {
    id: 'navid-song-2',
    title: 'Velvet Sunset',
    artist: 'Lo-Fi Chill Studio',
    album: 'Coffee & Rainy Windows',
    duration: 174,
    url: '',
    coverArt: generateCoverArt(
      'Velvet Sunset',
      'Lo-Fi Chill Studio',
      '<stop offset="0%" stop-color="#0f172a"/><stop offset="50%" stop-color="#3b0764"/><stop offset="100%" stop-color="#db2777"/>',
      '#f472b6',
      'vinyl'
    ),
    folder: 'Internal Storage/Music/Lo-Fi',
    fileSize: 5210984,
    format: 'mp3',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    addedDate: Date.now() - 86400000 * 5,
    playCount: 88,
    isFavorite: true,
    lyrics: `[00:05.00] Warm tea on a wooden desk
[00:12.00] Soft rain taking care of the rest
[00:20.00] Vinyl turning round and round
[00:28.00] Peace is the only thing we found
[00:36.00] Velvet sunset painted in gold
[00:44.00] Stories that never get old`
  },
  {
    id: 'navid-song-3',
    title: 'Neon Pulse (Club Edit)',
    artist: 'Navid Beats',
    album: 'Future Bass Anthems',
    duration: 195,
    url: '',
    coverArt: generateCoverArt(
      'Neon Pulse',
      'Navid Beats',
      '<stop offset="0%" stop-color="#0369a1"/><stop offset="50%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#10b981"/>',
      '#67e8f9',
      'waveform'
    ),
    folder: 'Internal Storage/Download',
    fileSize: 7654320,
    format: 'mp3',
    bitrate: '320 kbps',
    sampleRate: '48.0 kHz',
    addedDate: Date.now() - 86400000 * 1,
    playCount: 19,
    isFavorite: false,
    lyrics: `[00:10.00] Drop the frequency low
[00:18.00] Feel the subwoofer blow
[00:26.00] 124 on the beat
[00:34.00] Jump when the drop hits your feet
[00:42.00] Navid Music in full drive
[00:50.00] That's how we stay alive`
  },
  {
    id: 'navid-song-4',
    title: 'Starlight Echoes',
    artist: 'Celestial Soundscapes',
    album: 'Deep Cosmos Vol. 2',
    duration: 260,
    url: '',
    coverArt: generateCoverArt(
      'Starlight Echoes',
      'Celestial Soundscapes',
      '<stop offset="0%" stop-color="#020617"/><stop offset="50%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#312e81"/>',
      '#818cf8',
      'headphones'
    ),
    folder: 'Internal Storage/Music/Ambient',
    fileSize: 10450912,
    format: 'flac',
    bitrate: 'Lossless 24-bit',
    sampleRate: '96.0 kHz',
    addedDate: Date.now() - 86400000 * 7,
    playCount: 31,
    isFavorite: true,
    lyrics: `[Instrumental Ambient Odyssey]
Floating through the rings of Saturn
Infinite stars and eternal calm`
  },
  {
    id: 'navid-song-5',
    title: 'Electric Velocity',
    artist: 'Navid Rock Collective',
    album: 'Overdrive 1984',
    duration: 202,
    url: '',
    coverArt: generateCoverArt(
      'Electric Velocity',
      'Navid Rock Collective',
      '<stop offset="0%" stop-color="#7f1d1d"/><stop offset="50%" stop-color="#b91c1c"/><stop offset="100%" stop-color="#f97316"/>',
      '#fbbf24',
      'waveform'
    ),
    folder: 'Internal Storage/Music/Rock',
    fileSize: 6890123,
    format: 'mp3',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz',
    addedDate: Date.now() - 86400000 * 9,
    playCount: 54,
    isFavorite: false,
    lyrics: `[00:12.00] Engines roaring in the dark
[00:19.00] Striking like an electric spark
[00:27.00] Full throttle on the open road
[00:35.00] Crank the volume to overload!`
  },
  {
    id: 'navid-song-6',
    title: 'Acoustic Raindrops',
    artist: 'Navid Acoustic Project',
    album: 'Morning Serenade',
    duration: 188,
    url: '',
    coverArt: generateCoverArt(
      'Acoustic Raindrops',
      'Navid Acoustic Project',
      '<stop offset="0%" stop-color="#064e3b"/><stop offset="50%" stop-color="#059669"/><stop offset="100%" stop-color="#34d399"/>',
      '#a7f3d0',
      'notes'
    ),
    folder: 'Internal Storage/Download',
    fileSize: 5890000,
    format: 'wav',
    bitrate: '1411 kbps',
    sampleRate: '44.1 kHz',
    addedDate: Date.now() - 86400000 * 3,
    playCount: 72,
    isFavorite: true,
    lyrics: `[00:08.00] Drops tapping on the glass
[00:16.00] Watching the gentle shadows pass
[00:24.00] Six strings playing a lullaby
[00:32.00] Underneath a quiet sky`
  }
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-synthwave',
    name: 'Cyberpunk & Synth',
    description: 'High octane retro electro beats with deep bass',
    songIds: ['navid-song-1', 'navid-song-3', 'navid-song-5'],
    createdAt: Date.now() - 86400000 * 4,
    isCustom: true
  },
  {
    id: 'pl-chill',
    name: 'Study & Coffee Relax',
    description: 'Gentle lo-fi and acoustic harmonies for focus',
    songIds: ['navid-song-2', 'navid-song-4', 'navid-song-6'],
    createdAt: Date.now() - 86400000 * 6,
    isCustom: true
  },
  {
    id: 'pl-gym',
    name: 'Workout Energy',
    description: 'BPM 120+ driving songs to keep the pulse high',
    songIds: ['navid-song-3', 'navid-song-5', 'navid-song-1'],
    createdAt: Date.now() - 86400000 * 2,
    isCustom: true
  }
];
