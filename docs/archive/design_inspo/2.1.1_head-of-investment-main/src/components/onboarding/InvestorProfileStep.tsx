import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, TrendingUp, BarChart3, Percent, DollarSign, Zap, Bell, BellRing } from "lucide-react";
import type { InvestorProfile } from "@/pages/Onboarding";

interface InvestorProfileStepProps {
  profile: InvestorProfile;
  setProfile: (profile: InvestorProfile) => void;
}

export function InvestorProfileStep({
  profile,
  setProfile,
}: InvestorProfileStepProps) {
  const getRiskLabel = (value: number) => {
    if (value < 25) return "Sehr Konservativ";
    if (value < 50) return "Konservativ";
    if (value < 75) return "Ausgewogen";
    return "Wachstumsorientiert";
  };

  const metrics = [
    { value: "kgv", label: "KGV", description: "Günstige Bewertung", icon: BarChart3 },
    { value: "roic", label: "ROIC", description: "Kapitaleffizienz", icon: Percent },
    { value: "dividend", label: "Dividende", description: "Regelmäßige Erträge", icon: DollarSign },
    { value: "fcf", label: "Free Cash Flow", description: "Cashflow-Stärke", icon: TrendingUp },
  ];

  const warningLevels = [
    { value: "gentle", label: "Sanft", description: "Nur wichtige Hinweise", icon: Bell },
    { value: "normal", label: "Normal", description: "Ausgewogene Warnungen", icon: BellRing },
    { value: "direct", label: "Direkt", description: "Klare Ansagen", icon: Zap },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Ihre Investment-DNA</h2>
        <p className="text-muted-foreground">
          Drei kurze Fragen, damit Ihr Assistent Sie besser versteht
        </p>
      </div>

      {/* Risk Tolerance */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Risikotoleranz</h3>
            <p className="text-sm text-muted-foreground">
              Wie viel Volatilität ist für Sie akzeptabel?
            </p>
          </div>
        </div>

        <div className="space-y-4 px-2">
          <Slider
            value={[profile.riskTolerance]}
            onValueChange={(value) =>
              setProfile({ ...profile, riskTolerance: value[0] })
            }
            max={100}
            step={1}
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Konservativ</span>
            <span className="font-medium text-primary">
              {getRiskLabel(profile.riskTolerance)}
            </span>
            <span className="text-muted-foreground">Wachstum</span>
          </div>
        </div>
      </div>

      {/* Preferred Metric */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold">Lieblingskennzahl</h3>
            <p className="text-sm text-muted-foreground">
              Welche Metrik ist Ihnen am wichtigsten?
            </p>
          </div>
        </div>

        <RadioGroup
          value={profile.preferredMetric}
          onValueChange={(value) =>
            setProfile({ ...profile, preferredMetric: value })
          }
          className="grid grid-cols-2 gap-4"
        >
          {metrics.map((metric) => (
            <label
              key={metric.value}
              className={`
                flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                ${profile.preferredMetric === metric.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <RadioGroupItem value={metric.value} className="sr-only" />
              <metric.icon className={`h-5 w-5 ${
                profile.preferredMetric === metric.value ? "text-primary" : "text-muted-foreground"
              }`} />
              <div>
                <p className="font-medium">{metric.label}</p>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Warning Level */}
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <BellRing className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Warn-Intensität</h3>
            <p className="text-sm text-muted-foreground">
              Wie direkt soll der Assistent Sie warnen?
            </p>
          </div>
        </div>

        <RadioGroup
          value={profile.warningLevel}
          onValueChange={(value) =>
            setProfile({ ...profile, warningLevel: value })
          }
          className="grid grid-cols-3 gap-4"
        >
          {warningLevels.map((level) => (
            <label
              key={level.value}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all text-center
                ${profile.warningLevel === level.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <RadioGroupItem value={level.value} className="sr-only" />
              <level.icon className={`h-6 w-6 ${
                profile.warningLevel === level.value ? "text-primary" : "text-muted-foreground"
              }`} />
              <div>
                <p className="font-medium">{level.label}</p>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
