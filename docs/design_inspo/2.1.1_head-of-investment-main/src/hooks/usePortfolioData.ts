import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number | null;
  avg_cost: number | null;
  currency: string | null;
  sector: string | null;
  category: string | null;
}

export interface PortfolioData {
  holdings: Holding[];
  totalValue: number;
  positionCount: number;
  topHoldings: Holding[];
  isLoading: boolean;
  error: Error | null;
}

export function usePortfolioData(topCount: number = 5): PortfolioData {
  const { user } = useAuth();

  const { data: holdings = [], isLoading, error } = useQuery({
    queryKey: ['holdings_v2', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('holdings_v2')
        .select('id, ticker, name, shares, avg_cost, currency, sector, category')
        .eq('user_id', user.id)
        .order('avg_cost', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      return data as Holding[];
    },
    enabled: !!user?.id,
  });

  // Calculate total value (cost basis)
  const totalValue = holdings.reduce((sum, h) => {
    const shares = h.shares ?? 0;
    const cost = h.avg_cost ?? 0;
    return sum + (shares * cost);
  }, 0);

  // Top holdings by value
  const holdingsWithValue = holdings.map(h => ({
    ...h,
    value: (h.shares ?? 0) * (h.avg_cost ?? 0)
  }));
  
  const topHoldings = [...holdingsWithValue]
    .sort((a, b) => b.value - a.value)
    .slice(0, topCount);

  return {
    holdings,
    totalValue,
    positionCount: holdings.length,
    topHoldings,
    isLoading,
    error: error as Error | null,
  };
}

// Calculate allocation percentage for a holding
export function getAllocation(holding: Holding, totalValue: number): number {
  if (totalValue === 0) return 0;
  const value = (holding.shares ?? 0) * (holding.avg_cost ?? 0);
  return (value / totalValue) * 100;
}
