import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

export function Footer() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <footer className="border-t border-border bg-background pt-20 pb-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row justify-between items-end mb-20">
        {/* Brand */}
        <div>
          <span className="font-serif italic text-2xl text-foreground block mb-2">
            {t.footer.brand}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {t.footer.tagline}
          </span>
        </div>

        {/* Links */}
        <div className="flex gap-6 mt-8 md:mt-0 text-xs font-mono text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            {t.footer.links.manifesto}
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            {t.footer.links.impressum}
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            {t.footer.links.datenschutz}
          </a>
        </div>
      </div>

      {/* Giant Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none opacity-[0.03]">
        <span className="text-[18vw] font-serif italic leading-none select-none text-foreground">
          Briefing
        </span>
      </div>
    </footer>
  );
}
