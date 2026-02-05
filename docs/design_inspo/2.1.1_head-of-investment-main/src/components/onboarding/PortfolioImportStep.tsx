import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Plus, Trash2, FileSpreadsheet, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Holding } from "@/pages/Onboarding";

interface PortfolioImportStepProps {
  holdings: Holding[];
  setHoldings: (holdings: Holding[]) => void;
  onUseDemoData: () => void;
}

export function PortfolioImportStep({
  holdings,
  setHoldings,
  onUseDemoData,
}: PortfolioImportStepProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newHolding, setNewHolding] = useState({
    ticker: "",
    name: "",
    weight: "",
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const base64 = await fileToBase64(file);
      
      const { data, error } = await supabase.functions.invoke('parse-portfolio', {
        body: {
          file: base64,
          filename: file.name,
          mimetype: file.type,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.holdings && data.holdings.length > 0) {
        setHoldings(data.holdings.map((h: any) => ({
          ticker: h.ticker || '',
          name: h.name || h.ticker || '',
          weight: h.weight,
        })));
        toast({
          title: "Portfolio erkannt",
          description: `${data.holdings.length} Positionen erfolgreich importiert.`,
        });
      } else {
        toast({
          title: "Keine Positionen gefunden",
          description: "Die KI konnte keine Aktienpositionen im Dokument erkennen.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Fehler beim Verarbeiten",
        description: "Die Datei konnte nicht analysiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addHolding = () => {
    if (newHolding.ticker) {
      setHoldings([
        ...holdings,
        {
          ticker: newHolding.ticker.toUpperCase(),
          name: newHolding.name || newHolding.ticker.toUpperCase(),
          weight: newHolding.weight ? parseFloat(newHolding.weight) : undefined,
        },
      ]);
      setNewHolding({ ticker: "", name: "", weight: "" });
    }
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Ihr Portfolio importieren</h2>
        <p className="text-muted-foreground">
          Laden Sie Ihren Depotauszug hoch oder geben Sie Ihre Positionen manuell ein
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="upload">Datei hochladen</TabsTrigger>
          <TabsTrigger value="manual">Manuell eingeben</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              glass-card border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${isDragging ? "border-primary bg-primary/5" : "border-border"}
              ${isProcessing ? "pointer-events-none opacity-50" : "cursor-pointer hover:border-primary/50"}
            `}
          >
            <input
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              {isProcessing ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
                    <Sparkles className="h-8 w-8 text-primary animate-spin" />
                  </div>
                  <p className="text-lg font-medium">Analysiere Depotauszug...</p>
                  <p className="text-sm text-muted-foreground">
                    KI erkennt Ihre Positionen
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      Depotauszug hier ablegen
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      PDF, Excel oder CSV • Max. 10MB
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-4">
                <Label htmlFor="ticker">Ticker *</Label>
                <Input
                  id="ticker"
                  placeholder="MSFT"
                  value={newHolding.ticker}
                  onChange={(e) =>
                    setNewHolding({ ...newHolding, ticker: e.target.value })
                  }
                />
              </div>
              <div className="col-span-5">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Microsoft"
                  value={newHolding.name}
                  onChange={(e) =>
                    setNewHolding({ ...newHolding, name: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="weight">Gewicht %</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="10"
                  value={newHolding.weight}
                  onChange={(e) =>
                    setNewHolding({ ...newHolding, weight: e.target.value })
                  }
                />
              </div>
              <div className="col-span-1 flex items-end">
                <Button
                  size="icon"
                  onClick={addHolding}
                  disabled={!newHolding.ticker}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Details wie Anzahl und Einstandskurs können Sie später in den Profileinstellungen ergänzen.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Holdings Preview */}
      {holdings.length > 0 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Erkannte Positionen ({holdings.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {holdings.map((holding, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono font-semibold text-primary">
                    {holding.ticker}
                  </span>
                  <span className="text-muted-foreground">{holding.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  {holding.weight && (
                    <span className="text-muted-foreground">
                      {holding.weight}%
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHolding(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Data Option */}
      <div className="text-center">
        <button
          onClick={onUseDemoData}
          className="group relative inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors px-4 py-2"
        >
          <span className="absolute inset-0 rounded-lg bg-accent/10 animate-pulse" />
          <span className="relative flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Lieber erstmal Demo-Daten nutzen →
          </span>
        </button>
      </div>
    </div>
  );
}
