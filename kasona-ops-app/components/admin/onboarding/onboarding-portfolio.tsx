import { Upload, FileSpreadsheet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OnboardingPortfolio() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl font-semibold">Portfolio importieren</div>
        <p className="text-sm text-muted-foreground">PDF, CSV oder Excel hochladen oder manuell erfassen.</p>
      </div>

      <Card className="p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-sm font-medium">Datei hier ablegen</div>
        <div className="text-xs text-muted-foreground">Drag & Drop oder klicken</div>
        <div className="mt-4">
          <Button variant="outline">Datei auswahlen</Button>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Beispiel Positionen</span>
        </div>
        <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
          <div>MSFT · Microsoft · 18%</div>
          <div>NVDA · Nvidia · 14%</div>
          <div>ASML · ASML · 12%</div>
        </div>
      </Card>
    </div>
  );
}
