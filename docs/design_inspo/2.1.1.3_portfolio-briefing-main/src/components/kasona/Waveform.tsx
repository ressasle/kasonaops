import { useMemo } from 'react';

interface WaveformProps {
  playing: boolean;
  barCount?: number;
}

export function Waveform({ playing, barCount = 12 }: WaveformProps) {
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      id: i,
      delay: i * 0.05,
      baseHeight: Math.random() * 30 + 20,
    }));
  }, [barCount]);

  return (
    <div className="flex gap-1 h-8 items-end">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="audio-bar"
          style={{
            height: playing ? `${Math.random() * 80 + 20}%` : '20%',
            animationDelay: `${bar.delay}s`,
            animation: playing ? `pulse-bar 0.5s ease-in-out infinite ${bar.delay}s` : 'none',
          }}
        />
      ))}
    </div>
  );
}
