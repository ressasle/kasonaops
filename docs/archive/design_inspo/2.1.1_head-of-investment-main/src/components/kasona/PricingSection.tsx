import { Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';

export function PricingSection() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <section id="access" className="py-32 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <div className="glass-panel rounded-3xl p-12 md:p-20 text-center relative overflow-hidden border-t border-foreground/10">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          {/* Content */}
          <h2 className="font-serif italic text-4xl md:text-6xl mb-6 text-foreground relative z-10">
            {t.pricing.title}
          </h2>
          <p className="text-xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto relative z-10">
            {t.pricing.sub}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row justify-center gap-6 relative z-10">
            <Button
              size="lg"
              className="px-10 py-6 rounded-full bg-foreground text-background font-bold hover:bg-foreground/90 transition-colors shadow-[0_0_30px_hsl(var(--foreground)/0.2)]"
            >
              {t.pricing.cta}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-6 rounded-full border-foreground/20 hover:bg-foreground/5 transition-colors font-mono text-sm"
            >
              {t.pricing.cta_sec}
            </Button>
          </div>

          {/* Footer Note */}
          <div className="mt-12 flex justify-center items-center gap-2 text-xs text-muted-foreground font-mono relative z-10">
            <Lock size={12} />
            {t.pricing.footer}
          </div>
        </div>
      </div>
    </section>
  );
}
