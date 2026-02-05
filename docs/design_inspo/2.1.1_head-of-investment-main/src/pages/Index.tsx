import { LanguageProvider } from '@/contexts/LanguageContext';
import { Navbar } from '@/components/kasona/Navbar';
import { Background } from '@/components/kasona/Background';
import { HeroSection } from '@/components/kasona/HeroSection';
import { ROISection } from '@/components/kasona/ROISection';
import { Marquee } from '@/components/kasona/Marquee';
import { CoverageSection } from '@/components/kasona/CoverageSection';
import { WealthCalculator } from '@/components/kasona/WealthCalculator';
import { PricingSection } from '@/components/kasona/PricingSection';
import { Footer } from '@/components/kasona/Footer';

const Index = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background relative overflow-x-hidden selection:bg-primary/30">
        <Background />
        <Navbar />
        <main>
          <HeroSection />
          <Marquee />
          <CoverageSection />
          <WealthCalculator />
          <ROISection />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Index;
