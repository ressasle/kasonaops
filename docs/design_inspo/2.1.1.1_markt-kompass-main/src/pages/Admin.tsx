import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { RefreshCw, Save, Shield, Database, TrendingUp, DollarSign, BarChart3 } from "lucide-react";

interface MarketDataItem {
  id: string;
  name: string;
  value: string;
  qoq: string;
  yoy: string;
  dataType: string;
  isModified?: boolean;
}

interface MarketDataFromAPI {
  currencies: Array<{
    id: string;
    waehrung: string;
    leitzins_percent: string;
    delta_vs_vorquartal: string;
    delta_vs_vorjahr: string;
  }>;
  rawMaterials: Array<{
    id: string;
    rohstoff_index: string;
    q4_2025: string;
    qoq: string;
    yoy: string;
  }>;
  indices: Array<{
    id: string;
    index: string;
    q4_2025: string;
    delta_vs_vorquartal: string;
    delta_vs_vorjahr: string;
  }>;
  exchangeRates: Array<{
    id: string;
    currency: string;
    q4_2025: number;
    delta_vs_vorquartal: string;
    delta_vs_vorjahr: string;
  }>;
}

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [commodities, setCommodities] = useState<MarketDataItem[]>([]);
  const [currencies, setCurrencies] = useState<MarketDataItem[]>([]);
  const [indices, setIndices] = useState<MarketDataItem[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;

      const apiData = data as MarketDataFromAPI;

      // Transform raw materials
      const transformedCommodities: MarketDataItem[] = apiData.rawMaterials.map(item => ({
        id: item.id,
        name: item.rohstoff_index,
        value: item.q4_2025,
        qoq: item.qoq,
        yoy: item.yoy,
        dataType: 'raw_material'
      }));

      // Transform currencies
      const transformedCurrencies: MarketDataItem[] = apiData.currencies.map(item => ({
        id: item.id,
        name: item.waehrung,
        value: item.leitzins_percent,
        qoq: item.delta_vs_vorquartal,
        yoy: item.delta_vs_vorjahr,
        dataType: 'currency'
      }));

      // Transform indices
      const transformedIndices: MarketDataItem[] = apiData.indices.map(item => ({
        id: item.id,
        name: item.index,
        value: item.q4_2025,
        qoq: item.delta_vs_vorquartal,
        yoy: item.delta_vs_vorjahr,
        dataType: 'index'
      }));

      setCommodities(transformedCommodities);
      setCurrencies(transformedCurrencies);
      setIndices(transformedIndices);

    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: "Fehler",
        description: "Marktdaten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const updateItem = (
    items: MarketDataItem[],
    setItems: React.Dispatch<React.SetStateAction<MarketDataItem[]>>,
    id: string,
    field: 'qoq' | 'yoy' | 'value',
    value: string
  ) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, [field]: value, isModified: true }
        : item
    ));
  };

  const saveItem = async (item: MarketDataItem) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('market_data_overrides')
        .upsert({
          data_type: item.dataType,
          item_name: item.name,
          qoq: item.qoq,
          yoy: item.yoy,
          current_value: item.value,
          updated_by: user.id
        }, {
          onConflict: 'data_type,item_name'
        });

      if (error) throw error;

      toast({
        title: "Gespeichert",
        description: `${item.name} wurde aktualisiert`,
      });

      // Mark as not modified after save
      if (item.dataType === 'raw_material') {
        setCommodities(prev => prev.map(i => 
          i.id === item.id ? { ...i, isModified: false } : i
        ));
      } else if (item.dataType === 'currency') {
        setCurrencies(prev => prev.map(i => 
          i.id === item.id ? { ...i, isModified: false } : i
        ));
      } else if (item.dataType === 'index') {
        setIndices(prev => prev.map(i => 
          i.id === item.id ? { ...i, isModified: false } : i
        ));
      }

    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Fehler",
        description: "Änderungen konnten nicht gespeichert werden",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const DataTable = ({ 
    items, 
    setItems,
    title,
    icon: Icon
  }: { 
    items: MarketDataItem[]; 
    setItems: React.Dispatch<React.SetStateAction<MarketDataItem[]>>;
    title: string;
    icon: React.ElementType;
  }) => (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="headline-serif italic flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Wert</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">QoQ</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">YoY</th>
                <th className="text-center py-3 px-2 font-medium text-muted-foreground">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={`border-b border-border/50 ${item.isModified ? 'bg-primary/5' : ''}`}>
                  <td className="py-3 px-2 font-medium">{item.name}</td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.value}
                      onChange={(e) => updateItem(items, setItems, item.id, 'value', e.target.value)}
                      className="h-8 w-28"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.qoq}
                      onChange={(e) => updateItem(items, setItems, item.id, 'qoq', e.target.value)}
                      className="h-8 w-28"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <Input
                      value={item.yoy}
                      onChange={(e) => updateItem(items, setItems, item.id, 'yoy', e.target.value)}
                      className="h-8 w-28"
                    />
                  </td>
                  <td className="py-3 px-2 text-center">
                    <Button
                      size="sm"
                      variant={item.isModified ? "default" : "ghost"}
                      onClick={() => saveItem(item)}
                      disabled={isSaving || !item.isModified}
                      className="h-8"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="headline-serif text-3xl italic">Admin-Panel</h1>
              <p className="text-muted-foreground">Marktdaten verwalten</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchMarketData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Aktualisieren
          </Button>
        </div>

        {/* Info Card */}
        <Card className="glass-panel mb-8 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Externe Datenbank-Verbindung</p>
                <p className="text-sm text-muted-foreground">
                  Die Daten stammen aus der Kasona-Marktdaten-Datenbank. Änderungen hier werden als lokale Überschreibungen gespeichert.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different data categories */}
        <Tabs defaultValue="commodities" className="space-y-6">
          <TabsList className="glass-panel">
            <TabsTrigger value="commodities" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Rohstoffe
            </TabsTrigger>
            <TabsTrigger value="currencies" className="gap-2">
              <DollarSign className="h-4 w-4" />
              Währungen
            </TabsTrigger>
            <TabsTrigger value="indices" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Indizes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commodities">
            <DataTable 
              items={commodities} 
              setItems={setCommodities}
              title="Rohstoffe"
              icon={TrendingUp}
            />
          </TabsContent>

          <TabsContent value="currencies">
            <DataTable 
              items={currencies} 
              setItems={setCurrencies}
              title="Währungen & Leitzinsen"
              icon={DollarSign}
            />
          </TabsContent>

          <TabsContent value="indices">
            <DataTable 
              items={indices} 
              setItems={setIndices}
              title="Indizes"
              icon={BarChart3}
            />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
