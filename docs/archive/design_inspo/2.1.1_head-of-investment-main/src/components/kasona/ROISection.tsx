import { Clock, Shield, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

const iconMap = [Clock, Shield, Target];

export function ROISection() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <section id="roi" className="py-32 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="font-mono text-xs text-primary tracking-[0.2em] uppercase">
            {t.roi.title_sub}
          </span>
          <h2 className="font-serif italic text-5xl md:text-6xl mt-4 text-foreground">
            {t.roi.title_main}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto font-light">
            {t.roi.subtitle}
          </p>
        </div>

        {/* ROI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {t.roi.cards.map((card, idx) => {
            const Icon = iconMap[idx];
            const iconColors = ['text-accent', 'text-destructive', 'text-primary'];

            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover rounded-2xl p-10 relative overflow-hidden group border-t border-border hover:border-primary/50"
              >
                {/* Icon */}
                <div className={`absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500 ${iconColors[idx]}`}>
                  <Icon size={32} />
                </div>

                {/* Value Display */}
                <div className="mb-6 font-mono text-4xl text-foreground">
                  {card.val}
                  <span className="text-lg text-muted-foreground ml-1">{card.unit}</span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold mb-3 text-foreground">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
