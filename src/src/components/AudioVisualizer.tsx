import React, { useEffect, useRef } from 'react';
import { AudioEngine } from '../services/audioEngine';

interface AudioVisualizerProps {
  engine: AudioEngine;
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  accentColor?: string;
  styleMode?: 'bars' | 'wave' | 'mirror';
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  engine,
  isPlaying,
  barCount = 36,
  height = 54,
  accentColor = '#8b5cf6',
  styleMode = 'bars'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const freqData = new Uint8Array(64);

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, width, h);

      if (isPlaying) {
        engine.getFrequencyData(freqData);
      } else {
        // Flat zero or gentle idle breathing
        freqData.fill(4);
      }

      const barWidth = (width / barCount) * 0.75;
      const gap = (width / barCount) * 0.25;

      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency bin
        const binIndex = Math.floor((i / barCount) * (freqData.length * 0.75));
        const val = isPlaying ? freqData[binIndex] : 4;
        const normalized = val / 255;
        const barHeight = Math.max(3, normalized * h * 0.95);

        const x = i * (barWidth + gap) + gap / 2;

        if (styleMode === 'mirror') {
          const y = (h - barHeight) / 2;
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, accentColor);
          grad.addColorStop(0.5, '#ffffff');
          grad.addColorStop(1, accentColor);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        } else {
          const y = h - barHeight;
          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, '#ffffff');
          grad.addColorStop(0.3, accentColor);
          grad.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine, isPlaying, barCount, height, accentColor, styleMode]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className="w-full h-full block"
    />
  );
};
