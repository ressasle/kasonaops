import { useState, useEffect } from "react";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Background } from "@/components/kasona/Background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Save, Trash2, Plus } from "lucide-react";

interface HoldingV2 {
  id: string;
  ticker: string;
  name: string;
  exchange: string | null;
  country: string | null;
  category: string | null;
  sector: string | null;
  owner_comment: string | null;
  currency: string | null;
  ticker_finnhub: string | null;
  ticker_eod: string | null;
  isin: string | null;
  shares: number | null;
  avg_cost: number | null;
}

const CATEGORIES = ['Defensiv', 'Blue Chip', 'Trend Zukunft', 'Sonstige', 'Rohstoffe'];
const EXCHANGES = ['NYSE', 'NASDAQ', 'SIX', 'Xetra', 'LSE', 'ASX', 'Spot'];
const COUNTRIES = ['USA', 'CH', 'DE', 'UK', 'AU', 'Welt'];
const CURRENCIES = ['USD', 'CHF', 'EUR', 'GBP', 'AUD'];

export default function Settings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [holdings, setHoldings] = useState<HoldingV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newHolding, setNewHolding] = useState({ 
    ticker: "", 
    name: "", 
    ticker_eod: "",
    shares: "", 
    avg_cost: "",
    category: "",
    exchange: "",
    country: "",
    currency: ""
  });

  useEffect(() => {
    if (user) {
      loadHoldings();
    }
  }, [user]);

  const loadHoldings = async () => {
    if (!user) return;
    
    try {
      // Try holdings_v2 first, fall back to holdings
      const { data: v2Data, error: v2Error } = await supabase
        .from('holdings_v2')
        .select('*')
        .eq('user_id', user.id)
        .order('category', { ascending: true })
        .order('ticker', { ascending: true });
      
      if (!v2Error && v2Data && v2Data.length > 0) {
        setHoldings(v2Data);
      } else {
        // Fallback to old holdings table
        const { data, error } = await supabase
          .from('holdings')
          .select('*')
          .eq('user_id', user.id)
          .order('ticker');
        
        if (error) throw error;
        
        // Convert old format to new format
        setHoldings((data || []).map(h => ({
          ...h,
          exchange: null,
          country: null,
          category: null,
          sector: null,
          owner_comment: null,
          currency: null,
          ticker_finnhub: null,
          ticker_eod: null,
          isin: null,
        })));
      }
    } catch (error: any) {
      console.error('Error loading holdings:', error);
      toast({
        title: 'Fehler beim Laden',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateHolding = (id: string, field: keyof HoldingV2, value: string | number | null) => {
    setHoldings(prev => prev.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const saveHoldings = async () => {
    if (!user || !profile?.account_id) return;
    
    setIsSaving(true);
    try {
      for (const holding of holdings) {
        const { error } = await supabase
          .from('holdings_v2')
          .upsert({
            id: holding.id,
            user_id: user.id,
            account_id: profile.account_id,
            ticker: holding.ticker,
            name: holding.name,
            exchange: holding.exchange,
            country: holding.country,
            category: holding.category,
            sector: holding.sector,
            owner_comment: holding.owner_comment,
            currency: holding.currency,
            ticker_finnhub: holding.ticker_finnhub,
            ticker_eod: holding.ticker_eod,
            isin: holding.isin,
            shares: holding.shares,
            avg_cost: holding.avg_cost,
          });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Gespeichert!',
        description: 'Ihre Portfolio-Daten wurden aktualisiert.',
      });
    } catch (error: any) {
      console.error('Error saving holdings:', error);
      toast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHolding = async (id: string) => {
    if (!user) return;
    
    try {
      // Try to delete from holdings_v2 first
      const { error: v2Error } = await supabase
        .from('holdings_v2')
        .delete()
        .eq('id', id);
      
      if (v2Error) {
        // Fallback to old holdings table
        const { error } = await supabase
          .from('holdings')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
      
      setHoldings(prev => prev.filter(h => h.id !== id));
      toast({
        title: 'Gelöscht',
        description: 'Position wurde entfernt.',
      });
    } catch (error: any) {
      console.error('Error deleting holding:', error);
      toast({
        title: 'Fehler beim Löschen',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addHolding = async () => {
    if (!user || !newHolding.ticker || !profile?.account_id) {
      toast({
        title: 'Fehler',
        description: 'Ticker und Account-ID sind erforderlich.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('holdings_v2')
        .insert({
          user_id: user.id,
          account_id: profile.account_id,
          ticker: newHolding.ticker.toUpperCase(),
          name: newHolding.name || newHolding.ticker.toUpperCase(),
          ticker_eod: newHolding.ticker_eod || null,
          shares: parseFloat(newHolding.shares) || null,
          avg_cost: parseFloat(newHolding.avg_cost) || null,
          category: newHolding.category || null,
          exchange: newHolding.exchange || null,
          country: newHolding.country || null,
          currency: newHolding.currency || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setHoldings(prev => [...prev, data]);
      setNewHolding({ 
        ticker: "", 
        name: "", 
        ticker_eod: "",
        shares: "", 
        avg_cost: "",
        category: "",
        exchange: "",
        country: "",
        currency: ""
      });
      toast({
        title: 'Hinzugefügt',
        description: `${newHolding.ticker.toUpperCase()} wurde zum Portfolio hinzugefügt.`,
      });
    } catch (error: any) {
      console.error('Error adding holding:', error);
      toast({
        title: 'Fehler beim Hinzufügen',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Background />
      
      <div className="relative z-10">
        <AppNavbar />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle>Portfolio Einstellungen</CardTitle>
              <CardDescription>
                Ergänzen Sie Ihre Positionen mit allen Details für präzisere n8n-Analysen. 
                {profile?.account_id && (
                  <span className="ml-2 text-primary font-mono text-xs">
                    Account: {profile.account_id}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Holdings Table */}
              {holdings.length > 0 ? (
                <div className="rounded-md border border-border/50 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Ticker</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-28">Ticker EOD</TableHead>
                        <TableHead className="w-24">Kategorie</TableHead>
                        <TableHead className="w-20">Börse</TableHead>
                        <TableHead className="text-right w-20">Anzahl</TableHead>
                        <TableHead className="text-right w-24">Kurs (€)</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdings.map((holding) => (
                        <TableRow key={holding.id}>
                          <TableCell>
                            <Input
                              value={holding.ticker}
                              onChange={(e) => updateHolding(holding.id, 'ticker', e.target.value.toUpperCase())}
                              className="w-20 bg-background/50 font-mono text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={holding.name}
                              onChange={(e) => updateHolding(holding.id, 'name', e.target.value)}
                              className="bg-background/50 text-sm"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={holding.ticker_eod || ''}
                              onChange={(e) => updateHolding(holding.id, 'ticker_eod', e.target.value)}
                              className="w-28 bg-background/50 font-mono text-xs"
                              placeholder="ZTS.US"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={holding.category || ''}
                              onValueChange={(value) => updateHolding(holding.id, 'category', value)}
                            >
                              <SelectTrigger className="w-24 bg-background/50 text-xs">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(cat => (
                                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={holding.exchange || ''}
                              onValueChange={(value) => updateHolding(holding.id, 'exchange', value)}
                            >
                              <SelectTrigger className="w-20 bg-background/50 text-xs">
                                <SelectValue placeholder="-" />
                              </SelectTrigger>
                              <SelectContent>
                                {EXCHANGES.map(ex => (
                                  <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={holding.shares ?? ''}
                              onChange={(e) => updateHolding(holding.id, 'shares', parseFloat(e.target.value) || null)}
                              className="w-20 text-right bg-background/50 text-sm"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={holding.avg_cost ?? ''}
                              onChange={(e) => updateHolding(holding.id, 'avg_cost', parseFloat(e.target.value) || null)}
                              className="w-24 text-right bg-background/50 text-sm"
                              placeholder="0.00"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteHolding(holding.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Noch keine Positionen vorhanden. Fügen Sie unten neue Positionen hinzu.
                </div>
              )}

              {/* Add New Holding */}
              <div className="border-t border-border/50 pt-6">
                <h3 className="text-sm font-medium mb-3">Neue Position hinzufügen</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ticker</label>
                    <Input
                      value={newHolding.ticker}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, ticker: e.target.value }))}
                      placeholder="AAPL"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Name</label>
                    <Input
                      value={newHolding.name}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Apple Inc."
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Ticker EOD</label>
                    <Input
                      value={newHolding.ticker_eod}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, ticker_eod: e.target.value }))}
                      placeholder="AAPL.US"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Kategorie</label>
                    <Select
                      value={newHolding.category}
                      onValueChange={(value) => setNewHolding(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Börse</label>
                    <Select
                      value={newHolding.exchange}
                      onValueChange={(value) => setNewHolding(prev => ({ ...prev, exchange: value }))}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXCHANGES.map(ex => (
                          <SelectItem key={ex} value={ex}>{ex}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Land</label>
                    <Select
                      value={newHolding.country}
                      onValueChange={(value) => setNewHolding(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Währung</label>
                    <Select
                      value={newHolding.currency}
                      onValueChange={(value) => setNewHolding(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Anzahl</label>
                    <Input
                      type="number"
                      value={newHolding.shares}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, shares: e.target.value }))}
                      placeholder="100"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Einstandskurs</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newHolding.avg_cost}
                      onChange={(e) => setNewHolding(prev => ({ ...prev, avg_cost: e.target.value }))}
                      placeholder="150.00"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={addHolding} 
                      disabled={!newHolding.ticker || !profile?.account_id}
                      className="w-full gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Hinzufügen
                    </Button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {holdings.length > 0 && (
                <div className="flex justify-end pt-4">
                  <Button onClick={saveHoldings} disabled={isSaving || !profile?.account_id} className="gap-2">
                    {isSaving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Änderungen speichern
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
