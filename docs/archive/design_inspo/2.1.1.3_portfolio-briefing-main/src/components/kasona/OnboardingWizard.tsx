import { useState, useEffect } from 'react';
import { Check, ArrowRight, Zap, Headphones, X, Lock, Cpu, Play } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Waveform } from './Waveform';

const mockStocks = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', sector: 'Tech' },
  { id: 2, symbol: 'TSLA', name: 'Tesla', sector: 'Auto' },
  { id: 3, symbol: 'NVDA', name: 'Nvidia', sector: 'Semi' },
  { id: 4, symbol: 'MSFT', name: 'Microsoft', sector: 'Tech' },
  { id: 5, symbol: 'SAP', name: 'SAP SE', sector: 'Enterprise' },
];

interface OnboardingWizardProps {
  onClose: () => void;
}

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [risk, setRisk] = useState(50);
  const [focus, setFocus] = useState(50);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  const t = language === 'de' ? {
    step1: {
      title: "Wählen Sie Ihre Assets",
      subtitle: "Wählen Sie bis zu 5 Ticker für Ihre Demo.",
      next: "Weiter"
    },
    step2: {
      title: "Ihr Investoren-Profil",
      subtitle: "Konfigurieren Sie den AI Curator.",
      conservative: "KONSERVATIV",
      aggressive: "AGGRESSIV",
      dividend: "DIVIDENDE",
      growth: "WACHSTUM",
      back: "Zurück",
      generate: "Briefing Erstellen"
    },
    step3: {
      title: "Kasona Engine",
      subtitle: "PROCESSING LIVE DATA STREAM",
      play: "Briefing Abspielen"
    },
    step4: {
      title: "Ihr Personal Alpha.",
      basedOn: "Basierend auf",
      profile: "und einem",
      aggressive: "aggressiven",
      conservative: "konservativen",
      profileEnd: "Profil.",
      preview: "AUDIO PREVIEW",
      cta: "Möchten Sie dieses Level an Klarheit jeden Morgen?",
      apply: "Early Access Beantragen"
    }
  } : {
    step1: {
      title: "Select Your Assets",
      subtitle: "Choose up to 5 tickers for your demo.",
      next: "Next"
    },
    step2: {
      title: "Your Investor Profile",
      subtitle: "Configure the AI Curator.",
      conservative: "CONSERVATIVE",
      aggressive: "AGGRESSIVE",
      dividend: "DIVIDEND",
      growth: "GROWTH",
      back: "Back",
      generate: "Generate Briefing"
    },
    step3: {
      title: "Kasona Engine",
      subtitle: "PROCESSING LIVE DATA STREAM",
      play: "Play Briefing"
    },
    step4: {
      title: "Your Personal Alpha.",
      basedOn: "Based on",
      profile: "with a",
      aggressive: "aggressive",
      conservative: "conservative",
      profileEnd: "profile.",
      preview: "AUDIO PREVIEW",
      cta: "Want this level of clarity every morning?",
      apply: "Apply for Early Access"
    }
  };

  useEffect(() => {
    if (step === 3) {
      const logs = [
        "> Initializing Kasona Engine...",
        "> Connecting to Finnhub API...",
        "> Fetching News for Watchlist: " + selectedStocks.join(', '),
        "> [NODE: Edit Fields3] Retrieved User Profile...",
        "> [NODE: Loop] Processing 143 items...",
      ];

      let delay = 500;
      logs.forEach((log) => {
        setTimeout(() => {
          setProcessingLogs(prev => [...prev, log]);
        }, delay);
        delay += 800;
      });

      setTimeout(() => {
        const batchLog = selectedStocks.map((stock, idx) =>
          `[ID ${idx}] ${stock} Q3 Earnings Call Transcript...\nURL: https://finance.yahoo.com/${stock}...\n-------------------`
        ).join('\n');
        setProcessingLogs(prev => [...prev, "> Batching News Items...", batchLog, "> Generating Audio via 11Labs..."]);
      }, delay + 1000);

      setTimeout(() => {
        setIsGenerated(true);
      }, delay + 3000);
    }
  }, [step, selectedStocks]);

  const toggleStock = (symbol: string) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else if (selectedStocks.length < 5) {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif italic text-3xl mb-2 text-foreground">{t.step1.title}</h2>
              <p className="text-muted-foreground text-sm font-light">{t.step1.subtitle}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockStocks.map(stock => (
                <div
                  key={stock.id}
                  onClick={() => toggleStock(stock.symbol)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedStocks.includes(stock.symbol)
                      ? 'bg-primary/20 border-primary'
                      : 'bg-foreground/5 border-border hover:bg-foreground/10'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-lg text-foreground">{stock.symbol}</span>
                    {selectedStocks.includes(stock.symbol) && <Check size={16} className="text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stock.name}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={selectedStocks.length === 0}
                className="bg-foreground text-background px-6 py-3 rounded-full font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-foreground/90 transition-colors"
              >
                {t.step1.next} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center">
              <h2 className="font-serif italic text-3xl mb-2 text-foreground">{t.step2.title}</h2>
              <p className="text-muted-foreground text-sm font-light">{t.step2.subtitle}</p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                  <span>{t.step2.conservative}</span>
                  <span>{t.step2.aggressive}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={risk}
                  onChange={(e) => setRisk(Number(e.target.value))}
                  className="w-full range-slider"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                  <span>{t.step2.dividend}</span>
                  <span>{t.step2.growth}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={focus}
                  onChange={(e) => setFocus(Number(e.target.value))}
                  className="w-full range-slider"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.step2.back}
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold shadow-glow hover:shadow-glow-lg transition-shadow flex items-center gap-2"
              >
                <Zap size={16} fill="currentColor" /> {t.step2.generate}
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="h-full flex flex-col animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="font-serif italic text-2xl mb-2 flex items-center justify-center gap-2 text-foreground">
                <Cpu className="animate-pulse text-primary" /> {t.step3.title}
              </h2>
              <p className="text-xs font-mono text-muted-foreground">{t.step3.subtitle}</p>
            </div>

            <div className="flex-grow bg-background rounded-lg border border-border p-4 font-mono text-xs text-green-400 overflow-y-auto max-h-64 shadow-inner relative">
              <div className="absolute top-0 right-0 p-2"><Lock size={12} className="text-muted-foreground" /></div>
              {processingLogs.map((log, i) => (
                <div key={i} className="mb-2 whitespace-pre-wrap">{log}</div>
              ))}
              <div className="animate-pulse">_</div>
            </div>

            {isGenerated && (
              <div className="mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="w-full bg-foreground text-background py-4 rounded-full font-bold hover:bg-foreground/90 transition-colors animate-bounce"
                >
                  {t.step3.play}
                </button>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="text-center animate-fade-in space-y-8">
            <div className="inline-block p-4 rounded-full bg-primary/10 border border-primary text-primary mb-4">
              <Headphones size={32} />
            </div>
            <h2 className="font-serif italic text-4xl text-foreground">{t.step4.title}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t.step4.basedOn} {selectedStocks.join(', ')} {t.step4.profile} {risk > 50 ? t.step4.aggressive : t.step4.conservative} {t.step4.profileEnd}
            </p>

            <div className="bg-foreground/5 border border-border rounded-xl p-6 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">{t.step4.preview}</span>
                <span className="text-xs font-bold text-accent">02:14</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform">
                  <Play size={20} fill="currentColor" className="ml-1" />
                </button>
                <Waveform playing={true} />
              </div>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">{t.step4.cta}</p>
              <button className="bg-gradient-hero px-8 py-3 rounded-full font-bold text-foreground shadow-lg hover:opacity-90 transition-opacity">
                {t.step4.apply}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X size={24} />
        </button>

        {/* Progress Bar */}
        {step < 4 && (
          <div className="flex gap-2 mb-8 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-colors ${step >= i ? 'bg-primary' : 'bg-border'}`} />
            ))}
          </div>
        )}

        {renderStep()}
      </div>
    </div>
  );
}
