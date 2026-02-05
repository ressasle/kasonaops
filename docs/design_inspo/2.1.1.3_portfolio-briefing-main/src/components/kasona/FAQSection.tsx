import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

export function FAQSection() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-primary uppercase tracking-wider">
              {t.faq.badge}
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            {t.faq.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t.faq.subtitle}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="glass-panel rounded-3xl p-2 md:p-4">
          <Accordion type="single" collapsible className="w-full">
            {t.faq.items.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border-b border-border/50 last:border-0"
              >
                <AccordionTrigger className="px-4 md:px-6 py-5 text-left hover:no-underline group">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-primary/60 mt-1">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors text-sm md:text-base">
                      {item.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 md:px-6 pb-6">
                  <div className="pl-8 md:pl-10 text-muted-foreground text-sm md:text-base leading-relaxed">
                    {item.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            {t.faq.contact.text}
          </p>
          <a 
            href="mailto:feedback@kasona.de" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all font-mono text-sm"
          >
            {t.faq.contact.button}
          </a>
        </div>
      </div>
    </section>
  );
}
