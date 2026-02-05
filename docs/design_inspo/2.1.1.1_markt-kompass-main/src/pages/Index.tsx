import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { DashboardMockup } from "@/components/DashboardMockup";
import { CookieBanner } from "@/components/CookieBanner";
import { TrendingUp, Brain, Target, Sun, Moon } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Language & Theme Toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
          className="text-sm"
        >
          {language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img 
                src="/k-compass-logo.png" 
                alt="K-Compass Logo" 
                className="h-24 w-auto"
              />
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl mb-6 text-primary tracking-wide">
              {t('index.title')}
            </h1>
            
            <p className="font-serif italic text-xl md:text-2xl text-muted-foreground mb-4">
              {t('index.subtitle')}
            </p>
            
            <p className="text-lg text-foreground/80 mb-8 max-w-2xl mx-auto">
              {t('index.tagline')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="text-lg font-semibold shadow-glow hover:shadow-glow-lg transition-all"
              >
                {t('index.startReview')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg"
              >
                {t('index.login')}
              </Button>
            </div>
            
            {/* Free Badge */}
            <p className="mt-4 text-sm">
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full font-medium">
                {t('index.free')}
              </span>
            </p>
          </div>
        </div>

        {/* Dashboard Mockup Section - Same background, seamless transition */}
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <DashboardMockup />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <TrendingUp className="h-12 w-12 text-accent" />
            </div>
            <h3 className="font-serif text-xl mb-2">{t('index.feature1Title')}</h3>
            <p className="text-muted-foreground">
              {t('index.feature1Desc')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Target className="h-12 w-12 text-accent" />
            </div>
            <h3 className="font-serif text-xl mb-2">{t('index.feature2Title')}</h3>
            <p className="text-muted-foreground">
              {t('index.feature2Desc')}
            </p>
          </div>

          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-accent" />
            </div>
            <h3 className="font-serif text-xl mb-2">{t('index.feature3Title')}</h3>
            <p className="text-muted-foreground">
              {t('index.feature3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            {t('index.ctaTitle')}
          </h2>
          <p className="text-muted-foreground mb-4 text-lg">
            {t('index.ctaSubtitle')}
          </p>
          {/* Free Badge */}
          <p className="mb-8">
            <span className="bg-secondary/20 text-secondary px-4 py-1.5 rounded-full font-semibold text-lg">
              {t('index.free')}
            </span>
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow hover:shadow-glow-lg transition-all">
            {t('index.ctaButton')}
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
      
      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
};

export default Index;