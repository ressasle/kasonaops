import { Headphones, MessageSquare, Cpu, Lock, Newspaper, FileText, Rss, Tags, Database, FolderKanban, Zap, Share2, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { useState, useEffect } from 'react';
import nasdaqLogo from '@/assets/nasdaq-logo.png';
import spGlobalLogo from '@/assets/sp-global-logo.png';

export function CoverageSection() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  // Animation for data flow
  const [activeInput, setActiveInput] = useState(0);
  const [activeOutput, setActiveOutput] = useState(0);
  const [pulseEngine, setPulseEngine] = useState(false);

  const inputs = [
    { icon: Newspaper, label: language === 'de' ? 'Globale News' : 'Global News' },
    { icon: FileText, label: language === 'de' ? 'Lizensierte Inhalte' : 'Licensed Content' },
    { icon: Rss, label: 'Blogs & RSS' },
  ];

  const outputs = [
    { icon: Tags, label: language === 'de' ? 'Semantische Annotation' : 'Semantic Annotations' },
    { icon: Database, label: language === 'de' ? 'Artikel-Metadaten' : 'Article Metadata' },
    { icon: FolderKanban, label: language === 'de' ? 'Kategorisierung' : 'Categorization' },
    { icon: Zap, label: language === 'de' ? 'Event-Erkennung' : 'Event Detection' },
    { icon: Share2, label: language === 'de' ? 'Social Shares' : 'Social Media Shares' },
    { icon: TrendingUp, label: language === 'de' ? 'Sentiment-Analyse' : 'Sentiment Analysis' },
    { icon: TrendingUp, label: language === 'de' ? 'Trends & Insights' : 'Trends & Insights' },
    { icon: Users, label: language === 'de' ? 'Entity-Extraktion' : 'Entity Extraction' },
  ];

  useEffect(() => {
    // Animate inputs
    const inputInterval = setInterval(() => {
      setActiveInput((prev) => (prev + 1) % inputs.length);
      setPulseEngine(true);
      setTimeout(() => setPulseEngine(false), 300);
    }, 2000);

    // Animate outputs
    const outputInterval = setInterval(() => {
      setActiveOutput((prev) => (prev + 1) % outputs.length);
    }, 800);

    return () => {
      clearInterval(inputInterval);
      clearInterval(outputInterval);
    };
  }, [inputs.length, outputs.length]);

  return (
    <section id="coverage" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase">
            {t.coverage.title_sub}
          </span>
          <h2 className="font-serif italic text-4xl md:text-5xl mt-4 text-foreground max-w-3xl mx-auto">
            {t.coverage.title_main}
          </h2>
          
          {/* Marquee text moved directly under heading */}
          <p className="text-muted-foreground mt-6 max-w-2xl mx-auto font-light text-lg">
            360° Coverage. Institutional Data Quality.
          </p>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto font-light">
            {language === 'de' 
              ? "Persönlich auf Ihr Portfolio abgestimmt."
              : "Personally tailored to your portfolio."}
          </p>
          
          {/* Data Provider Logos */}
          <div className="flex items-center justify-center gap-8 mt-8 opacity-60">
            <img src={nasdaqLogo} alt="Nasdaq" className="h-6 md:h-8 object-contain" />
            <img src={spGlobalLogo} alt="S&P Global" className="h-6 md:h-8 object-contain" />
          </div>
        </div>

        {/* Data Flow Diagram */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="glass-panel rounded-3xl overflow-hidden border border-border relative">
            {/* Terminal Header */}
            <div className="bg-background/80 border-b border-border px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/40" />
                  <div className="w-3 h-3 rounded-full bg-accent/40" />
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Cpu className="w-5 h-5 text-primary" />
                  <span className="font-serif italic text-lg text-foreground">Kasona Engine</span>
                </div>
              </div>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            
            {/* Data Flow Content */}
            <div className="p-8 md:p-12 bg-background/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                
                {/* Inputs (Left) */}
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  {inputs.map((input, index) => {
                    const Icon = input.icon;
                    const isActive = activeInput === index;
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                          isActive 
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                            : 'border-border/50 bg-background/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isActive ? 'bg-primary/20' : 'bg-muted/50'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {input.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Animated Flow Lines + Central Hub */}
                <div className="flex items-center justify-center flex-1 py-8 md:py-0">
                  {/* Left flow line */}
                  <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-primary/20 to-primary relative">
                    <div className={`absolute inset-0 bg-gradient-to-r from-primary to-accent transition-opacity duration-300 ${
                      pulseEngine ? 'opacity-100' : 'opacity-0'
                    }`} />
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                  </div>
                  
                  {/* Central Engine Hub */}
                  <div className={`relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    pulseEngine 
                      ? 'border-primary bg-primary/20 shadow-xl shadow-primary/30' 
                      : 'border-border bg-background/80'
                  }`}>
                    {/* Outer ring */}
                    <div className={`absolute inset-2 rounded-full border transition-colors ${
                      pulseEngine ? 'border-primary/50' : 'border-border/30'
                    }`} />
                    
                    {/* Inner content */}
                    <div className="text-center">
                      <Cpu className={`w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 transition-colors ${
                        pulseEngine ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="font-mono text-[10px] text-muted-foreground tracking-wider">KASONA</span>
                    </div>
                    
                    {/* Pulse effect */}
                    {pulseEngine && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                    )}
                  </div>
                  
                  {/* Right flow line */}
                  <div className="hidden md:block w-16 h-0.5 bg-gradient-to-r from-accent to-accent/20 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full" />
                  </div>
                </div>

                {/* Outputs (Right) */}
                <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                  {outputs.map((output, index) => {
                    const Icon = output.icon;
                    const isActive = activeOutput === index;
                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
                          isActive 
                            ? 'border-accent bg-accent/10 shadow-md shadow-accent/20' 
                            : 'border-border/30 bg-background/30'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground/60'}`} />
                        <span className={`text-xs ${isActive ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                          {output.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Formats - Floating cards */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <span className="font-mono text-xs text-accent tracking-[0.2em] uppercase">
              {language === 'de' ? "Ihr Briefing. Ihr Format." : "Your Briefing. Your Format."}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Audio Card */}
            <div className="glass-panel rounded-2xl p-6 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Headphones size={24} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">
                    Audio (Morning Commute)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' 
                      ? "Studio-Qualität TTS mit natürlicher Intonation."
                      : "Studio-quality TTS with natural intonation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Text Card */}
            <div className="glass-panel rounded-2xl p-6 border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <MessageSquare size={24} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground mb-1">
                    Text (Executive Summary)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'de' 
                      ? "Bullet-Points für den schnellen Scan zwischendurch."
                      : "Bullet-points for quick scanning on the go."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
