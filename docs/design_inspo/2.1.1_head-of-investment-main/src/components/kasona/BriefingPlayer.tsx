import { Play, Pause } from 'lucide-react';
import { Waveform } from './Waveform';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

interface BriefingPlayerProps {
  playing: boolean;
  onTogglePlay: () => void;
}

export function BriefingPlayer({ playing, onTogglePlay }: BriefingPlayerProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className="relative z-10 glass-panel w-80 h-[480px] rounded-t-sm rounded-b-xl border-t-4 border-t-primary p-8 flex flex-col justify-between transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 shadow-2xl group">
      {/* Header */}
      <div>
        <div className="flex justify-between items-end border-b border-border pb-4 mb-6">
          <span className="font-serif italic text-2xl text-foreground">{t.player.title}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{t.player.vol}</span>
        </div>

        {/* Abstract Content Lines */}
        <div className="space-y-4">
          <div className="h-4 bg-foreground/20 rounded w-3/4 animate-pulse" />
          <div className="h-2 bg-foreground/10 rounded w-full" />
          <div className="h-2 bg-foreground/10 rounded w-full" />
          <div className="h-2 bg-foreground/10 rounded w-5/6" />
        </div>

        {/* Critical Signal Card */}
        <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">
              {t.player.signal}
            </span>
          </div>
          <div className="h-2 bg-accent/20 rounded w-full mb-2" />
          <div className="h-2 bg-accent/20 rounded w-2/3" />
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Waveform playing={playing} />
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 rounded-full border border-foreground/30 flex items-center justify-center hover:bg-foreground hover:text-background transition-colors cursor-pointer"
        >
          {playing ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
}
