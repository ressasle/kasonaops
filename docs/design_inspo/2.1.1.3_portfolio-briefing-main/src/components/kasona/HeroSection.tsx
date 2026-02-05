import { useState } from 'react';
import { Play, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { BriefingPlayer } from './BriefingPlayer';
import { OnboardingWizard } from './OnboardingWizard';

export function HeroSection() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [playing, setPlaying] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const togglePlay = () => setPlaying(!playing);

  return (
    <>
      {showWizard && <OnboardingWizard onClose={() => setShowWizard(false)} />}
      
      <section className="relative z-10 min-h-screen flex items-center pt-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left: Editorial Copy */}
          <div className="lg:col-span-7 space-y-10">
            {/* Badge */}
            <div 
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm animate-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                {t.hero.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 
              className="font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.1] text-foreground animate-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              {t.hero.headline_pre} <br />
              <span className="text-gradient-hero font-sans font-bold not-italic">
                {t.hero.headline_highlight}
              </span>
            </h1>

            {/* Subline */}
            <p 
              className="font-light text-xl text-muted-foreground max-w-lg leading-relaxed border-l-2 border-accent/30 pl-6 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              {t.hero.subline}
            </p>

            {/* CTA Section */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6 animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              <button onClick={() => setShowWizard(true)} className="btn-laser-wrapper group cursor-pointer">
                <span className="btn-laser-inner block px-10 py-5 font-bold tracking-wide text-foreground flex items-center gap-3">
                  {t.hero.cta}
                  <Zap size={18} className="text-primary" />
                </span>
              </button>
              <div className="flex flex-col">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  {t.hero.time_saved}
                </span>
                <span className="text-sm font-bold text-accent">{t.hero.time_val}</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Metaphor (The Digital Paper) */}
          <div 
            className="lg:col-span-5 relative h-[600px] flex items-center justify-center animate-fade-in"
            style={{ animationDelay: '0.5s' }}
          >
            {/* Abstract Rings */}
            <div className="absolute w-[500px] h-[500px] border border-border rounded-full animate-spin-slow" />
            <div 
              className="absolute w-[350px] h-[350px] border border-dashed border-foreground/10 rounded-full animate-spin-slow"
              style={{ animationDirection: 'reverse', animationDuration: '40s' }}
            />

            <BriefingPlayer playing={playing} onTogglePlay={togglePlay} />
          </div>
        </div>
      </section>
    </>
  );
}
