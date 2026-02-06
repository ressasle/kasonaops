"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, ChevronsRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerManager } from "@/components/admin/crm/customer-manager";
import { InvestorProfileForm } from "@/components/admin/crm/investor-profile-form";
import { PortfolioUpload } from "@/components/admin/crm/portfolio-upload";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/data/customers";

type Step = "company" | "investor" | "portfolio";

type CustomerOnboardingProps = {
  customers: Customer[];
  supabaseReady: boolean;
};

export function CustomerOnboarding({ customers, supabaseReady }: CustomerOnboardingProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("company");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>("");
  const [portfolioId, setPortfolioId] = useState<string | null>(null);

  const steps = [
    {
      id: "company",
      label: "Company Profile",
      description: "Basic info & due diligence",
      status: companyId ? "completed" : "current",
    },
    {
      id: "investor",
      label: "Investor DNA",
      description: "Risk & preferences",
      status: currentStep === "investor" ? "current" : companyId && currentStep === "portfolio" ? "completed" : "pending",
    },
    {
      id: "portfolio",
      label: "Portfolio Assets",
      description: "Holdings & allocation",
      status: currentStep === "portfolio" ? "current" : "pending",
    },
  ];

  const handleCompanyCreated = (id: number, name: string) => {
    setCompanyId(id);
    setCompanyName(name);
    setCurrentStep("investor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleInvestorProfileSaved = (id: string) => {
    setPortfolioId(id);
    setCurrentStep("portfolio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePortfolioComplete = () => {
    router.push(`/customers/${companyId}`);
  };

  return (
    <div className="space-y-8">
      {/* Progress Stepper */}
      <div className="relative">
        <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-muted" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isCurrent = step.status === "current";
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary bg-background text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="hidden text-xs text-muted-foreground sm:block">
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-4xl">
        {currentStep === "company" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
              <h2 className="headline-serif text-2xl">Create Company Profile</h2>
              <p className="text-muted-foreground">
                Start by adding the basic company or individual details. We'll check for duplicates automatically.
              </p>
            </div>
            {/* Reuse existing Manager but in "Create Mode" */}
            <CustomerManager
              customers={customers}
              supabaseReady={supabaseReady}
              mode="onboarding"
              onSuccess={handleCompanyCreated}
            />
          </div>
        )}

        {currentStep === "investor" && companyId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
              <h2 className="headline-serif text-2xl">Define Investor DNA</h2>
              <p className="text-muted-foreground">
                Set risk tolerance and investment preferences for <span className="text-primary font-medium">{companyName}</span>.
              </p>
            </div>
            <InvestorProfileForm
              companyId={companyId}
              onSuccess={handleInvestorProfileSaved}
              onSkip={() => setCurrentStep("portfolio")}
            />
          </div>
        )}

        {currentStep === "portfolio" && companyId && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6 text-center">
              <h2 className="headline-serif text-2xl">Import Portfolio Assets</h2>
              <p className="text-muted-foreground">
                Upload a PDF report or CSV to automatically extract holdings for <span className="text-primary font-medium">{companyName}</span>.
              </p>
            </div>
            <PortfolioUpload
              companyId={companyId}
              portfolioId={portfolioId}
              onComplete={handlePortfolioComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
}
