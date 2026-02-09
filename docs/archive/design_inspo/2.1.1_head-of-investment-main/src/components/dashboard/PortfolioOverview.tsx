import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function PortfolioOverview() {
  const { user } = useAuth();

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['holdings_v2_overview', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('holdings_v2')
        .select('shares, avg_cost')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Berechne Gesamtwert (Einstandswert)
  const totalValue = holdings.reduce((sum, h) => sum + (h.shares || 0) * (h.avg_cost || 0), 0);
  const positionCount = holdings.length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const stats = [
    {
      label: 'Gesamtwert',
      value: isLoading ? '...' : formatCurrency(totalValue),
      change: 'Einstandswert',
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: 'Tagesgewinn',
      value: '—',
      change: 'Noch keine Kursdaten',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      label: 'Positionen',
      value: isLoading ? '...' : positionCount.toString(),
      change: 'Im Portfolio',
      isPositive: true,
      icon: PieChart,
    },
    {
      label: 'Volatilität',
      value: '—',
      change: 'Noch nicht berechnet',
      isPositive: true,
      icon: Activity,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-panel rounded-xl p-5 hover:border-primary/20 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <stat.icon size={18} className="text-primary" />
            </div>
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                'text-muted-foreground'
              )}
            >
              {stat.change}
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
