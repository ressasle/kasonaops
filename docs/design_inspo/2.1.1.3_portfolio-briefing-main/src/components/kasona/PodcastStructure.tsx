import { useRef, useState, useEffect, useMemo } from 'react';
import { Newspaper, TrendingUp, Zap, ShieldCheck, Target, Play, Pause } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

interface PodcastWaveformProps {
  isPlaying: boolean;
}

function PodcastWaveform({ isPlaying }: PodcastWaveformProps) {
  const bars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      baseHeight: Math.random() * 60 + 20,
      animDuration: 1.5 + Math.random() * 2,
      animDelay: i * 0.03,
    }));
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none overflow-hidden">
      <div className="flex gap-[3px] h-32 items-end">
        {bars.map((bar) => (
          <div
            key={bar.id}
            className="w-1 rounded-full bg-gradient-to-t from-primary/60 to-accent/40"
            style={{
              height: isPlaying ? `${bar.baseHeight}%` : '15%',
              animation: isPlaying 
                ? `podcast-wave ${bar.animDuration}s ease-in-out infinite ${bar.animDelay}s`
                : 'none',
              transition: 'height 0.5s ease-out',
            }}
          />
        ))}
      </div>
    </div>
  );
}

const segmentIcons = [Newspaper, TrendingUp, Zap, ShieldCheck, Target];
const segmentColors = [
  'border-l-primary',      // Orange
  'border-l-yellow-400',   // Yellow
  'border-l-accent',       // Cyan
  'border-l-blue-400',     // Blue
  'border-l-pink-400',     // Pink
];
const iconColors = [
  'text-primary',
  'text-yellow-400',
  'text-accent',
  'text-blue-400',
  'text-pink-400',
];

export function PodcastStructure() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const maxDuration = 60; // 1 minute max

  const podcastT = t.podcastStructure;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentProgress = (audio.currentTime / maxDuration) * 100;
      setProgress(Math.min(currentProgress, 100));

      // Stop after 60 seconds
      if (audio.currentTime >= maxDuration) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setProgress(0);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Calculate stroke dashoffset for progress ring
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Animated Waveform Background */}
      <PodcastWaveform isPlaying={isPlaying} />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-xs font-mono tracking-[0.3em] uppercase text-primary mb-4 block">
            {podcastT.badge}
          </span>
          <h2 className="font-serif italic text-3xl md:text-5xl text-foreground mb-3">
            {podcastT.title}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {podcastT.subtitle}
          </p>
        </div>

        {/* Staggered Cards - Desktop */}
        <div className="hidden md:grid grid-cols-5 gap-6 items-end mb-16">
          {podcastT.segments.map((segment, index) => {
            const Icon = segmentIcons[index];
            const yOffset = index === 0 || index === 4 
              ? 'translate-y-[-30px]' 
              : index === 2 
                ? 'translate-y-[30px]' 
                : '';
            
            return (
              <div
                key={index}
                className={`glass-panel rounded-2xl p-5 border-l-4 ${segmentColors[index]} ${yOffset} hover:translate-y-[-8px] transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`font-mono text-sm ${iconColors[index]}`}>{index + 1}.</span>
                  <Icon className={`w-4 h-4 ${iconColors[index]}`} />
                </div>
                <h3 className="font-serif text-base text-foreground mb-2 leading-tight">
                  {segment.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {segment.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden flex flex-col gap-4 mb-12">
          {podcastT.segments.map((segment, index) => {
            const Icon = segmentIcons[index];
            return (
              <div
                key={index}
                className={`glass-panel rounded-xl p-4 border-l-4 ${segmentColors[index]}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm ${iconColors[index]}`}>{index + 1}.</span>
                    <Icon className={`w-4 h-4 ${iconColors[index]}`} />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm text-foreground">
                      {segment.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {segment.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Play Button with Progress Ring */}
        <div className="flex flex-col items-center">
          <button
            onClick={togglePlay}
            className="relative w-20 h-20 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-300 flex items-center justify-center group shadow-glow"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {/* Progress Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200"
              />
            </svg>
            
            {/* Play/Pause Icon */}
            <div className="relative z-10 w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              {isPlaying ? (
                <Pause className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
              )}
            </div>
          </button>
          
          <p className="mt-4 text-sm text-muted-foreground font-mono">
            {podcastT.playButton}
          </p>
          
          {isPlaying && (
            <p className="mt-2 text-xs text-primary font-mono animate-pulse">
              {Math.floor((maxDuration - (progress / 100) * maxDuration))}s {podcastT.remaining}
            </p>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio ref={audioRef} src="/podcast-sample.mp3" preload="metadata" />
      </div>

      {/* CSS for podcast wave animation */}
      <style>{`
        @keyframes podcast-wave {
          0%, 100% { height: var(--base-height, 20%); }
          50% { height: calc(var(--base-height, 20%) + 40%); }
        }
      `}</style>
    </section>
  );
}
