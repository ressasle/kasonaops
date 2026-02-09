import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";

export const Footer = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left text-muted-foreground flex items-center gap-4">
            <a
              href="https://www.kasona.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <img
                src={theme === 'dark' ? '/kasona-logo-dark.png' : '/kasona-logo-light.png'}
                alt="Kasona Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
            <div>
              <p className="text-sm">
                {t('footer.poweredBy')}{" "}
                <a
                  href="https://www.kasona.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Kasona AI
                </a>
              </p>
              <p className="text-xs mt-1">
                {t('footer.disclaimer')}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <Link
              to="/impressum"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {t('footer.impressum')}
            </Link>
            <Link
              to="/datenschutz"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {t('footer.privacy')}
            </Link>
            <Link
              to="/kontakt"
              className="text-muted-foreground hover:text-accent transition-colors"
            >
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
