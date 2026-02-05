import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Background } from "@/components/kasona/Background";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { WelcomeStep } from "@/components/onboarding/WelcomeStep";
import { PortfolioImportStep } from "@/components/onboarding/PortfolioImportStep";
import { InvestorProfileStep } from "@/components/onboarding/InvestorProfileStep";
import { LiveDemoStep } from "@/components/onboarding/LiveDemoStep";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

export interface Holding {
  ticker: string;
  name: string;
  weight?: number; // Optional percentage weight
}

export interface InvestorProfile {
  riskTolerance: number;
  preferredMetric: string;
  warningLevel: string;
}

const STEPS = ["Willkommen", "Portfolio", "Profil", "Ergebnis"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile>({
    riskTolerance: 50,
    preferredMetric: "roic",
    warningLevel: "normal",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in or already onboarded
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
      } else if (profile?.onboarding_complete) {
        navigate('/app/chat');
      }
    }
  }, [user, profile, loading, navigate]);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = () => {
    if (currentStep === 1) return holdings.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Save holdings (basic data, full details can be added later in settings)
      if (holdings.length > 0) {
        const holdingsToInsert = holdings.map((h) => ({
          user_id: user.id,
          ticker: h.ticker,
          name: h.name,
          shares: h.weight || 0, // Use weight as placeholder, will be updated in settings
          avg_cost: 0, // Will be added later in settings
        }));
        
        const { error: holdingsError } = await supabase
          .from('holdings')
          .insert(holdingsToInsert);
        
        if (holdingsError) throw holdingsError;
      }

      // Save investor profile
      const { error: profileError } = await supabase
        .from('investor_profiles')
        .upsert({
          user_id: user.id,
          risk_tolerance: investorProfile.riskTolerance,
          preferred_metric: investorProfile.preferredMetric,
          warning_level: investorProfile.warningLevel,
        });
      
      if (profileError) throw profileError;

      // Mark onboarding as complete
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ onboarding_complete: true })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      await refreshProfile();
      
      toast({
        title: 'Setup abgeschlossen!',
        description: 'Ihr Investment Terminal ist bereit.',
      });
      
      navigate("/app/chat");
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: error.message || 'Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseDemoData = () => {
    setHoldings([
      { ticker: "MSFT", name: "Microsoft", weight: 25 },
      { ticker: "AAPL", name: "Apple", weight: 20 },
      { ticker: "DIS", name: "Disney", weight: 15 },
      { ticker: "KO", name: "Coca-Cola", weight: 20 },
      { ticker: "JNJ", name: "Johnson & Johnson", weight: 20 },
    ]);
    handleNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Schritt {currentStep + 1} von {STEPS.length}
                </span>
              </div>
              <span className="text-sm font-medium">{STEPS[currentStep]}</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {currentStep === 0 && (
              <WelcomeStep onNext={handleNext} />
            )}
            {currentStep === 1 && (
              <PortfolioImportStep
                holdings={holdings}
                setHoldings={setHoldings}
                onUseDemoData={handleUseDemoData}
              />
            )}
            {currentStep === 2 && (
              <InvestorProfileStep
                profile={investorProfile}
                setProfile={setInvestorProfile}
              />
            )}
            {currentStep === 3 && (
              <LiveDemoStep
                holdings={holdings}
                profile={investorProfile}
                onComplete={handleComplete}
                isLoading={isSaving}
              />
            )}
          </div>
        </main>

        {/* Footer Navigation */}
        {currentStep > 0 && currentStep < 3 && (
          <footer className="p-6">
            <div className="max-w-4xl mx-auto flex justify-between">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Zurück
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Weiter
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
