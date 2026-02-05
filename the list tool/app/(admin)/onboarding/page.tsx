"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { OnboardingWelcome } from "@/components/admin/onboarding/onboarding-welcome";
import { OnboardingPortfolio } from "@/components/admin/onboarding/onboarding-portfolio";
import { OnboardingProfile } from "@/components/admin/onboarding/onboarding-profile";
import { OnboardingLiveDemo } from "@/components/admin/onboarding/onboarding-live-demo";

const STEPS = ["Willkommen", "Portfolio", "Profil", "Ergebnis"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Schritt {step + 1} von {STEPS.length}
          </div>
          <div className="text-sm font-medium">{STEPS[step]}</div>
        </div>
        <Progress value={progress} />
      </header>

      {step === 0 && <OnboardingWelcome onNext={() => setStep(1)} />}
      {step === 1 && <OnboardingPortfolio />}
      {step === 2 && <OnboardingProfile />}
      {step === 3 && <OnboardingLiveDemo />}

      {step > 0 && step < 3 && (
        <footer className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStep((prev) => prev - 1)}>
            <ArrowLeft className="h-4 w-4" /> Zuruck
          </Button>
          <Button onClick={() => setStep((prev) => prev + 1)}>
            Weiter <ArrowRight className="h-4 w-4" />
          </Button>
        </footer>
      )}
    </div>
  );
}
