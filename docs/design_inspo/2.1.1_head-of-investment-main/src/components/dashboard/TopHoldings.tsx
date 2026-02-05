import { TrendingUp, TrendingDown, MoreHorizontal, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number | null;
  avg_cost: number | null;
  currency: string | null;
}

export function TopHoldings() {
  const { user } = useAuth();

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['holdings_v2', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('holdings_v2')
        .select('id, ticker, name, shares, avg_cost, currency')
        .eq('user_id', user.id)
        .order('avg_cost', { ascending: false, nullsFirst: false })
        .limit(6);

      if (error) throw error;
      return data as Holding[];
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Berechne Allokation basierend auf Einstandswert
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares || 0) * (h.avg_cost || 0), 0);

  const getAllocation = (holding: Holding) => {
    if (totalValue === 0) return 0;
    const value = (holding.shares || 0) * (holding.avg_cost || 0);
    return (value / totalValue) * 100;
  };

  if (isLoading) {
    return (
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Top Positionen</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (holdings.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Top Positionen</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>Keine Positionen vorhanden</p>
          <p className="text-sm mt-1">Importiere dein Portfolio um loszulegen</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold">Top Positionen</h2>
        <Button variant="ghost" size="sm" className="text-xs">
          Alle anzeigen
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left pb-3 font-medium">Asset</th>
              <th className="text-right pb-3 font-medium">Anteile</th>
              <th className="text-right pb-3 font-medium hidden sm:table-cell">Einstand</th>
              <th className="text-right pb-3 font-medium">Wert</th>
              <th className="text-right pb-3 font-medium hidden md:table-cell">Allokation</th>
              <th className="text-right pb-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((holding) => {
              const allocation = getAllocation(holding);
              const totalHoldingValue = (holding.shares || 0) * (holding.avg_cost || 0);

              return (
                <tr
                  key={holding.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                        {holding.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium">{holding.ticker}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {holding.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-4 font-mono text-sm">
                    {holding.shares?.toLocaleString('de-DE') || '-'}
                  </td>
                  <td className="text-right py-4 font-mono text-sm text-muted-foreground hidden sm:table-cell">
                    {holding.avg_cost ? formatCurrency(holding.avg_cost, holding.currency || 'USD') : '-'}
                  </td>
                  <td className="text-right py-4 font-mono text-sm">
                    {formatCurrency(totalHoldingValue, holding.currency || 'USD')}
                  </td>
                  <td className="text-right py-4 hidden md:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(allocation, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-10">
                        {allocation.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
