import { Brain, Bell, LineChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type OnboardingWelcomeProps = {
  onNext: () => void;
};

export function OnboardingWelcome({ onNext }: OnboardingWelcomeProps) {
  return (
    <div className="space-y-8 text-center">
      <div className="space-y-3">
        <div className="headline-serif text-4xl">Willkommen bei Kasona</div>
        <p className="text-muted-foreground">
          Ihr digitales Investment-Komitee. Es verbindet Kundendaten mit Marktlogik und generiert klare Handlungsimpulse.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[{ icon: Brain, title: "Das Gehirn", text: "KI kuratiert nach Value-Philosophie" },
          { icon: LineChart, title: "Das Gedachtnis", text: "Kennt Portfolio und No-Gos" },
          { icon: Bell, title: "Die Wachsamkeit", text: "Proaktive Warnungen und Chancen" }].map((item) => (
          <Card key={item.title} className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <item.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-semibold">{item.title}</div>
            <p className="mt-2 text-xs text-muted-foreground">{item.text}</p>
          </Card>
        ))}
      </div>
      <Button onClick={onNext}>Jetzt einrichten</Button>
    </div>
  );
}
