import { useState } from 'react';
import { Globe, Zap, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { OnboardingWizard } from './OnboardingWizard';
import kasonaLogo from '@/assets/kasona-logo.png';

export function Navbar() {
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation(language);
  const [showWizard, setShowWizard] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#roi", label: t.nav.roi },
    { href: "#ritual", label: t.nav.ritual },
    { href: "#access", label: t.nav.access },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {showWizard && <OnboardingWizard onClose={() => setShowWizard(false)} />}
      
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={kasonaLogo} 
              alt="Kasona" 
              className="h-8 w-auto"
            />
            <span className="font-serif italic text-xs text-accent leading-none">
              Portfolio Briefing
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10 text-xs font-mono text-muted-foreground">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="relative hover:text-foreground transition-colors uppercase tracking-widest group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground border-border px-3 py-1.5 rounded-full"
            >
              <Globe size={14} />
              {language.toUpperCase()}
            </Button>
            <Button
              variant="secondary"
              className="text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full"
            >
              {t.nav.login}
            </Button>
            
            {/* Prominent Demo CTA */}
            <button 
              onClick={() => setShowWizard(true)} 
              className="btn-laser-wrapper group cursor-pointer"
            >
              <span className="btn-laser-inner block px-6 py-3 font-bold tracking-wide text-foreground flex items-center gap-2 text-sm">
                <Zap size={16} className="text-primary" />
                {t.nav.demo}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border animate-fade-in">
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left text-lg font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
                >
                  {link.label}
                </button>
              ))}
              
              <div className="pt-6 border-t border-border space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground border-border px-3 py-1.5 rounded-full"
                  >
                    <Globe size={14} />
                    {language.toUpperCase()}
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full"
                  >
                    {t.nav.login}
                  </Button>
                </div>
                
                {/* Mobile Demo CTA */}
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowWizard(true);
                  }} 
                  className="btn-laser-wrapper w-full group cursor-pointer"
                >
                  <span className="btn-laser-inner block px-6 py-4 font-bold tracking-wide text-foreground flex items-center justify-center gap-2 text-sm">
                    <Zap size={16} className="text-primary" />
                    {t.nav.demo}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
