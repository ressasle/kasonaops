import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

const dataStats = {
  de: [
    { value: "30+", label: "JAHRE DATEN" },
    { value: "60+", label: "BÖRSEN" },
    { value: "150k+", label: "TICKERS" },
    { value: "20k+", label: "ETFS" },
    { value: "600+", label: "INDIZES" },
    { value: "1.1k+", label: "FOREX" },
  ],
  en: [
    { value: "30+", label: "YEARS DATA" },
    { value: "60+", label: "EXCHANGES" },
    { value: "150k+", label: "TICKERS" },
    { value: "20k+", label: "ETFS" },
    { value: "600+", label: "INDICES" },
    { value: "1.1k+", label: "FOREX" },
  ],
};

export function Marquee() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const stats = dataStats[language];
  // Create multiple repetitions for seamless infinite scroll
  const allItems = [...stats, ...stats, ...stats, ...stats];

  return (
    <div className="py-16 border-y border-border bg-background/50 overflow-hidden relative z-10">
      <div className="text-center mb-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {t.marquee}
      </div>
      <div className="flex whitespace-nowrap overflow-hidden">
        <div className="flex animate-marquee items-center gap-12 px-8">
          {allItems.map((item, i) => (
            <span key={i} className="flex items-center gap-12">
              <div className="flex flex-col items-center justify-center px-6 py-4 rounded-xl bg-card/50 border border-border min-w-[100px]">
                <span className="text-2xl font-bold text-primary font-mono">{item.value}</span>
                <span className="text-[10px] text-muted-foreground tracking-widest mt-1">{item.label}</span>
              </div>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
