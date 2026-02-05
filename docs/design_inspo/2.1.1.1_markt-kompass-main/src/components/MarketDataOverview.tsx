import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart3, Coins, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/components/auth/AuthProvider";

interface Currency {
  id: string;
  waehrung: string;
  leitzins_percent: string;
  delta_vs_vorquartal: string;
  delta_vs_vorjahr: string;
  q3_2025: string;
  q2_2025: string;
  q1_2025: string;
  q4_2024: string;
}

interface ExchangeRate {
  id: string;
  currency: string;
  q4_2025: number;
  delta_vs_vorquartal: string;
  delta_vs_vorjahr: string;
}

interface Index {
  id: string;
  index: string;
  q4_2025: string;
  q3_2025: string;
  delta_vs_vorquartal: string;
  delta_vs_vorjahr: string;
}

interface RawMaterial {
  id: string;
  rohstoff_index: string;
  q4_2025: string;
  qoq: string;
  yoy: string;
}

interface MarketData {
  currencies: Currency[];
  exchangeRates: ExchangeRate[];
  indices: Index[];
  rawMaterials: RawMaterial[];
  timestamp: string;
}

interface MarketDataOverviewProps {
  category?: 'currencies' | 'commodities' | 'indices' | 'all';
}

const formatDelta = (delta: string | null) => {
  if (!delta) return null;
  const isPositive = delta.includes('+');
  const isNegative = delta.includes('-');
  
  return (
    <span className={`font-mono text-sm flex items-center gap-1 ${isPositive ? 'text-green-500' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
      {delta}
    </span>
  );
};

const DataCard = ({ label, value, unit, deltaQuarter, deltaYear }: { 
  label: string; 
  value: string | number; 
  unit?: string;
  deltaQuarter?: string;
  deltaYear?: string;
}) => (
  <div className="glass-panel p-4 space-y-2">
    <p className="label-mono">{label}</p>
    <p className="data-value">
      {value} {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </p>
    {(deltaQuarter || deltaYear) && (
      <div className="flex flex-wrap gap-3 text-xs">
        {deltaQuarter && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">QoQ:</span>
            {formatDelta(deltaQuarter)}
          </div>
        )}
        {deltaYear && (
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">YoY:</span>
            {formatDelta(deltaYear)}
          </div>
        )}
      </div>
    )}
  </div>
);

// Translation helpers - keyword-based for robust matching
const translateCommodity = (name: string, language: string) => {
  if (language === 'en') return name; // Already in English from DB
  
  const upperName = name.toUpperCase();
  
  // Keyword-based matching for robustness (handles variations in DB format)
  if (upperName.includes('GOLD')) return 'Gold (USD/oz)';
  if (upperName.includes('SILVER')) return 'Silber (USD/oz)';
  if (upperName.includes('COPPER')) return 'Kupfer (USD/t)';
  if (upperName.includes('BITCOIN')) return 'Bitcoin';
  if (upperName.includes('BLOOMBERG')) return 'Bloomberg Commodity Index';
  if (upperName.includes('BRENT')) return 'Öl Brent (USD/Barrel)';
  if (upperName.includes('WTI')) return 'Öl WTI (USD/Barrel)';
  if (upperName.includes('WHEAT')) return 'Weizen (USD/dt)';
  
  return name;
};

const translateExchangeRate = (currency: string, language: string) => {
  if (language === 'en') return currency;
  return currency.replace(' to ', ' zu ');
};

const sortCommodities = (materials: RawMaterial[]) => {
  const order = [
    'GOLD', 'SILVER', 'COPPER', 'BITCOIN',
    'BLOOMBERG', 'OIL BRENT', 'OIL WTI', 'WHEAT'
  ];
  
  return [...materials].sort((a, b) => {
    const aIndex = order.findIndex(o => a.rohstoff_index.toUpperCase().includes(o));
    const bIndex = order.findIndex(o => b.rohstoff_index.toUpperCase().includes(o));
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
};

export const MarketDataOverview = ({ category = 'all' }: MarketDataOverviewProps) => {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reminderActive, setReminderActive] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const fetchMarketData = async (showToast = false) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;
      
      setMarketData(data);
      if (showToast) {
        toast({
          title: t('market.notifySuccess'),
          description: t('market.notifySuccessDesc'),
        });
      }
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: t('common.error'),
        description: "Marktdaten konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load reminder preference from profile
  useEffect(() => {
    const loadReminderPref = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('quarterly_reminder')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setReminderActive(data.quarterly_reminder || false);
      }
    };
    loadReminderPref();
  }, [user]);

  const handleNotifyClick = async () => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: "Bitte melden Sie sich an",
        variant: "destructive",
      });
      return;
    }
    
    const newValue = !reminderActive;
    setReminderActive(newValue);
    
    const { error } = await supabase
      .from('profiles')
      .update({ quarterly_reminder: newValue })
      .eq('id', user.id);
    
    if (error) {
      setReminderActive(!newValue); // Revert on error
      toast({
        title: t('common.error'),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: newValue ? t('market.notifySuccess') : t('market.notifyDisabled'),
        description: newValue ? t('market.notifySuccessDesc') : t('market.notifyDisabledDesc'),
      });
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  if (!marketData || isLoading) {
    return (
      <div className="glass-panel p-8 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  // Show all sections for 'all' category
  const showCurrencies = category === 'all' || category === 'currencies';
  const showCommodities = category === 'all' || category === 'commodities';
  const showIndices = category === 'all' || category === 'indices';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Notify Button - only show for 'all' category */}
      {category === 'all' && (
        <div className="flex justify-between items-center">
          <div>
            <span className="label-mono">{t('market.asOf')}</span>
            <h2 className="headline-serif text-2xl italic">{t('dashboard.title')}</h2>
          </div>
          <Button
            variant={reminderActive ? "default" : "outline"}
            size="sm"
            onClick={handleNotifyClick}
            className={reminderActive 
              ? "shadow-glow" 
              : "glass-panel hover:glow-orange"}
          >
            <Bell className="h-4 w-4 mr-2" />
            {t('market.notifyQ1')}
          </Button>
        </div>
      )}

      {/* Currencies & Interest Rates */}
      {showCurrencies && (
        <>
          <Card className="glass-panel border-primary/20">
            <CardHeader>
              <CardTitle className="headline-serif italic flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {t('market.currencies')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketData.currencies.map((currency) => (
                  <DataCard
                    key={currency.id}
                    label={currency.waehrung}
                    value={currency.leitzins_percent}
                    unit="%"
                    deltaQuarter={currency.delta_vs_vorquartal}
                    deltaYear={currency.delta_vs_vorjahr}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exchange Rates */}
          <Card className="glass-panel border-secondary/20">
            <CardHeader>
              <CardTitle className="headline-serif italic flex items-center gap-2">
                <Coins className="h-5 w-5 text-secondary" />
                {t('market.exchangeRates')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {marketData.exchangeRates
                  .filter(rate => rate.currency.startsWith('EUR to') && rate.currency !== 'EUR to EUR')
                  .map((rate) => (
                    <DataCard
                      key={rate.id}
                      label={translateExchangeRate(rate.currency, language)}
                      value={rate.q4_2025}
                      deltaQuarter={rate.delta_vs_vorquartal}
                      deltaYear={rate.delta_vs_vorjahr}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Commodities */}
      {showCommodities && (
        <Card className="glass-panel border-kasona-yellow/20">
          <CardHeader>
            <CardTitle className="headline-serif italic flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-kasona-yellow" />
              {t('market.commodities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {sortCommodities(marketData.rawMaterials).map((material) => (
                <DataCard
                  key={material.id}
                  label={translateCommodity(material.rohstoff_index, language)}
                  value={material.q4_2025}
                  deltaQuarter={material.qoq}
                  deltaYear={material.yoy}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Indices */}
      {showIndices && (
        <Card className="glass-panel border-accent/20">
          <CardHeader>
            <CardTitle className="headline-serif italic flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              {t('market.indices')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {marketData.indices.map((index) => (
                <DataCard
                  key={index.id}
                  label={index.index}
                  value={index.q4_2025}
                  deltaQuarter={index.delta_vs_vorquartal}
                  deltaYear={index.delta_vs_vorjahr}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamp - only show for 'all' category */}
      {category === 'all' && (
        <p className="text-center text-xs text-muted-foreground">
          {t('market.asOf')}
        </p>
      )}
    </div>
  );
};
