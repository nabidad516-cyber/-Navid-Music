import React, { useState } from 'react';
import { EqualizerPresetName, EqualizerState } from '../types/music';
import { AudioEngine, EQUALIZER_PRESETS } from '../services/audioEngine';
import { Sliders, Volume2, Sparkles, RotateCcw, Power, Waves } from 'lucide-react';

interface EqualizerScreenProps {
  engine: AudioEngine;
}

export const EqualizerScreen: React.FC<EqualizerScreenProps> = ({ engine }) => {
  const [eqState, setEqState] = useState<EqualizerState>(() => engine.getEqualizerState());

  const handleToggle = () => {
    const nextState = !eqState.enabled;
    engine.toggleEqualizer(nextState);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handlePresetSelect = (preset: EqualizerPresetName) => {
    engine.setPreset(preset);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handleBandChange = (index: number, gainDb: number) => {
    engine.setBandGain(index, gainDb);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handleBassBoost = (val: number) => {
    engine.setBassBoost(val);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handleVirtualizer = (val: number) => {
    engine.setVirtualizer(val);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handlePreamp = (val: number) => {
    engine.setPreamp(val);
    setEqState({ ...engine.getEqualizerState() });
  };

  const handleReset = () => {
    engine.setPreset('Normal');
    setEqState({ ...engine.getEqualizerState() });
  };

  // Build SVG spline path for dynamic frequency response curve
  const points = eqState.bands.map((band, idx) => {
    const x = 30 + idx * 75;
    // -12dB -> y: 90, 0dB -> y: 50, +12dB -> y: 10
    const y = 50 - (band.gain / 12) * 35;
    return `${x},${y}`;
  });
  const pathD = `M 10,50 L ${points.join(' L ')} L 350,50`;

  const presetList: EqualizerPresetName[] = [
    'Normal',
    'Rock',
    'Pop',
    'Jazz',
    'Classical',
    'Dance',
    'Hip-Hop',
    'Bass Boost',
    'Vocal Boost',
    'Electronic',
    'Custom'
  ];

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto space-y-6 pb-32 animate-in fade-in duration-200">
      {/* Top Banner & Power Switch */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              eqState.enabled
                ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-glow)]'
                : 'bg-white/5 text-[var(--text-secondary)]'
            }`}
          >
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[var(--text-primary)] flex items-center gap-2">
              <span>Navid AudioFX Engine</span>
              {eqState.enabled && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Real-time 5-Band Biquad DSP with Bass Boost
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 ${
            eqState.enabled
              ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
              : 'bg-white/10 text-[var(--text-secondary)] hover:bg-white/15'
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{eqState.enabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Interactive Visual Frequency Curve */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-[var(--accent)]" />
            <span>Frequency Response Curve</span>
          </span>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Flat</span>
          </button>
        </div>

        <div className="relative w-full h-28 bg-black/40 rounded-2xl overflow-hidden border border-white/5 p-2 flex items-center justify-center">
          {/* Zero dB line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-b border-dashed border-white/20 pointer-events-none" />
          <svg className="w-full h-full" viewBox="0 0 360 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eqCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.6" />
                <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d={`${pathD} L 350,100 L 10,100 Z`}
              fill="url(#eqCurveGrad)"
              className="transition-all duration-200"
            />
            <path
              d={pathD}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-200"
            />
            {eqState.bands.map((band, idx) => {
              const x = 30 + idx * 75;
              const y = 50 - (band.gain / 12) * 35;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4.5"
                  fill="#ffffff"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>
          <span className="absolute top-1.5 right-3 text-[10px] font-mono text-white/40">+12 dB</span>
          <span className="absolute top-1/2 -translate-y-1/2 right-3 text-[10px] font-mono text-white/30">0 dB</span>
          <span className="absolute bottom-1.5 right-3 text-[10px] font-mono text-white/40">-12 dB</span>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] px-1">
          Equalizer Presets
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {presetList.map((preset) => {
            const isSelected = eqState.preset === preset;
            return (
              <button
                key={preset}
                onClick={() => handlePresetSelect(preset)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[var(--accent)] text-white shadow-md shadow-[var(--accent-glow)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-white border border-white/5'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Band Vertical Sliders */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 items-center justify-items-center">
          {eqState.bands.map((band, idx) => (
            <div key={band.freq} className="flex flex-col items-center gap-3 w-full">
              <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">
                {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)}
              </span>

              {/* Vertical slider wrapper */}
              <div className="h-44 flex items-center justify-center py-2">
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={band.gain}
                  disabled={!eqState.enabled}
                  onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                  className="w-36 h-4 accent-[var(--accent)] cursor-pointer -rotate-90 origin-center"
                  aria-label={`${band.label} gain`}
                />
              </div>

              <div className="text-center">
                <p className="text-xs font-bold text-[var(--text-primary)]">{band.label}</p>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">
                  {idx === 0 ? 'Sub' : idx === 1 ? 'Bass' : idx === 2 ? 'Mid' : idx === 3 ? 'Treble' : 'Air'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bass Boost & Virtualizer & Preamp Knobs/Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Bass Boost */}
        <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Bass Boost</span>
            </span>
            <span className="text-xs font-mono font-bold text-[var(--accent)]">
              {eqState.bassBoost}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={eqState.bassBoost}
            disabled={!eqState.enabled}
            onChange={(e) => handleBassBoost(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer"
            aria-label="Bass boost strength"
          />
          <p className="text-[11px] text-[var(--text-secondary)]">
            Deepens 60Hz-85Hz low-end thump without distorting mids.
          </p>
        </div>

        {/* 3D Virtualizer */}
        <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>3D Virtualizer</span>
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {eqState.virtualizer}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={eqState.virtualizer}
            disabled={!eqState.enabled}
            onChange={(e) => handleVirtualizer(parseInt(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
            aria-label="Virtualizer spatial strength"
          />
          <p className="text-[11px] text-[var(--text-secondary)]">
            Widens acoustic soundstage for headphones & car audio.
          </p>
        </div>
      </div>

      {/* Preamp Volume Slider */}
      <div className="bg-[var(--bg-card)] border border-white/10 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--text-primary)]">Preamp Gain</span>
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {eqState.preamp > 0 ? `+${eqState.preamp} dB` : `${eqState.preamp} dB`}
          </span>
        </div>
        <input
          type="range"
          min={-6}
          max={6}
          step={0.5}
          value={eqState.preamp}
          disabled={!eqState.enabled}
          onChange={(e) => handlePreamp(parseFloat(e.target.value))}
          className="w-full accent-[var(--accent)] cursor-pointer"
          aria-label="Preamp gain"
        />
      </div>
    </div>
  );
};
