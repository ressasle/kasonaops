import React, { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface MarketDataResponse {
  currencies: Array<{
    currency: string;
    q1_2023: string;
    q2_2023: string;
    q3_2023: string;
    q4_2023: string;
    q1_2024: string;
    q2_2024: string;
    q3_2024: string;
    q4_2024: string;
    q1_2025: string;
    q2_2025: string;
    q3_2025: string;
    q4_2025: string;
  }>;
  exchangeRates: Array<{
    currency: string;
    q1_2023: string;
    q2_2023: string;
    q3_2023: string;
    q4_2023: string;
    q1_2024: string;
    q2_2024: string;
    q3_2024: string;
    q4_2024: string;
    q1_2025: string;
    q2_2025: string;
    q3_2025: string;
    q4_2025: string;
  }>;
  indices: Array<{
    index: string;
    q1_2023: string;
    q2_2023: string;
    q3_2023: string;
    q4_2023: string;
    q1_2024: string;
    q2_2024: string;
    q3_2024: string;
    q4_2024: string;
    q1_2025: string;
    q2_2025: string;
    q3_2025: string;
    q4_2025: string;
  }>;
  rawMaterials: Array<{
    rohstoff_index: string;
    q1_2023: string;
    q2_2023: string;
    q3_2023: string;
    q4_2023: string;
    q1_2024: string;
    q2_2024: string;
    q3_2024: string;
    q4_2024: string;
    q1_2025: string;
    q2_2025: string;
    q3_2025: string;
    q4_2025: string;
  }>;
  timestamp: string;
}

interface ChartDataPoint {
  quarter: string;
  value: number;
}

interface MarketDataChartsProps {
  category?: 'currencies' | 'commodities' | 'indices' | 'all';
}

const chartConfig: ChartConfig = {
  value: {
    label: "Wert",
    color: "hsl(var(--primary))",
  },
};

// All available quarters in chronological order
const quarterColumns = [
  { key: 'q1_2023', label: 'Q1 2023' },
  { key: 'q2_2023', label: 'Q2 2023' },
  { key: 'q3_2023', label: 'Q3 2023' },
  { key: 'q4_2023', label: 'Q4 2023' },
  { key: 'q1_2024', label: 'Q1 2024' },
  { key: 'q2_2024', label: 'Q2 2024' },
  { key: 'q3_2024', label: 'Q3 2024' },
  { key: 'q4_2024', label: 'Q4 2024' },
  { key: 'q1_2025', label: 'Q1 2025' },
  { key: 'q2_2025', label: 'Q2 2025' },
  { key: 'q3_2025', label: 'Q3 2025' },
  { key: 'q4_2025', label: 'Q4 2025' },
] as const;

type QuarterKey = typeof quarterColumns[number]['key'];

export const MarketDataCharts = ({ category = 'all' }: MarketDataChartsProps) => {
  const { t } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<"1y" | "2y" | "all">("2y");
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [marketData, setMarketData] = useState<MarketDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const allMetrics = [
    // Exchange Rates - EUR to other currencies
    { value: "eurUsd", label: t('charts.eurToUsd'), category: "currencies", unit: "USD" },
    { value: "eurChf", label: t('charts.eurToChf'), category: "currencies", unit: "CHF" },
    { value: "eurHkd", label: t('charts.eurToHkd'), category: "currencies", unit: "HKD" },
    { value: "eurSek", label: t('charts.eurToSek'), category: "currencies", unit: "SEK" },
    // Commodities
    { value: "gold", label: t('charts.gold'), category: "commodities", unit: "USD/oz" },
    { value: "silver", label: t('charts.silver'), category: "commodities", unit: "USD/oz" },
    { value: "oilBrent", label: t('charts.oilBrent'), category: "commodities", unit: "USD/bbl" },
    { value: "oilWTI", label: t('charts.oilWTI'), category: "commodities", unit: "USD/bbl" },
    { value: "copper", label: t('charts.copper'), category: "commodities", unit: "USD/t" },
    { value: "bitcoin", label: t('charts.bitcoin'), category: "commodities", unit: "USD" },
    { value: "wheat", label: t('charts.wheat'), category: "commodities", unit: "USD/dt" },
    // Indices
    { value: "dax", label: t('charts.dax'), category: "indices", unit: "Pkt" },
    { value: "sp500", label: t('charts.sp500'), category: "indices", unit: "Pkt" },
    { value: "nasdaq", label: t('charts.nasdaq'), category: "indices", unit: "Pkt" },
    { value: "msciWorld", label: t('charts.msciWorld'), category: "indices", unit: "Pkt" },
  ];

  // Filter metrics based on category prop
  const metrics = category === 'all' 
    ? allMetrics 
    : allMetrics.filter(m => m.category === category);

  // Set default selected metric when category changes
  useEffect(() => {
    if (metrics.length > 0 && (!selectedMetric || !metrics.find(m => m.value === selectedMetric))) {
      setSelectedMetric(metrics[0].value);
    }
  }, [category, metrics, selectedMetric]);

  const periods = [
    { label: t('charts.oneYear'), value: "1y" as const, quarters: 4 },
    { label: t('charts.twoYears'), value: "2y" as const, quarters: 8 },
    { label: t('charts.all'), value: "all" as const, quarters: 12 },
  ];

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;
      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
      toast({
        title: t('common.error'),
        description: t('charts.loadError'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  const getDataSourceForMetric = (metric: string): { data: Record<string, string> | null; name: string } => {
    if (!marketData) return { data: null, name: '' };

    switch (metric) {
      case 'eurUsd':
        const eurUsd = marketData.exchangeRates?.find(r => r.currency === 'EUR to USD');
        return { data: eurUsd || null, name: 'EUR/USD' };
      case 'eurChf':
        const eurChf = marketData.exchangeRates?.find(r => r.currency === 'EUR to CHF');
        return { data: eurChf || null, name: 'EUR/CHF' };
      case 'eurHkd':
        const eurHkd = marketData.exchangeRates?.find(r => r.currency === 'EUR to HKD');
        return { data: eurHkd || null, name: 'EUR/HKD' };
      case 'eurSek':
        const eurSek = marketData.exchangeRates?.find(r => r.currency === 'EUR to SEK');
        return { data: eurSek || null, name: 'EUR/SEK' };
      case 'gold':
        const gold = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('Gold'));
        return { data: gold || null, name: t('charts.gold') };
      case 'silver':
        const silver = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('Silver'));
        return { data: silver || null, name: t('charts.silver') };
      case 'oilBrent':
        const brent = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('Brent'));
        return { data: brent || null, name: t('charts.oilBrent') };
      case 'oilWTI':
        const wti = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('WTI'));
        return { data: wti || null, name: t('charts.oilWTI') };
      case 'copper':
        const copper = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('Copper'));
        return { data: copper || null, name: t('charts.copper') };
      case 'bitcoin':
        const btc = marketData.rawMaterials?.find(r => r.rohstoff_index === 'Bitcoin');
        return { data: btc || null, name: t('charts.bitcoin') };
      case 'wheat':
        const wheat = marketData.rawMaterials?.find(r => r.rohstoff_index?.includes('Wheat'));
        return { data: wheat || null, name: t('charts.wheat') };
      case 'dax':
        const dax = marketData.indices?.find(r => r.index === 'DAX');
        return { data: dax || null, name: t('charts.dax') };
      case 'sp500':
        const sp = marketData.indices?.find(r => r.index === 'S&P 500');
        return { data: sp || null, name: t('charts.sp500') };
      case 'nasdaq':
        const nasdaq = marketData.indices?.find(r => r.index === 'NASDAQ 100');
        return { data: nasdaq || null, name: t('charts.nasdaq') };
      case 'msciWorld':
        const msci = marketData.indices?.find(r => r.index === 'MSCI World');
        return { data: msci || null, name: t('charts.msciWorld') };
      default:
        return { data: null, name: '' };
    }
  };

  const parseValue = (val: string | number | undefined | null): number => {
    if (val === undefined || val === null) return 0;
    // If already a number, return it directly
    if (typeof val === 'number') return val;
    // If string, remove thousand separators and replace comma with dot
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  const transformToChartData = (): ChartDataPoint[] => {
    const { data } = getDataSourceForMetric(selectedMetric);
    if (!data) return [];

    const periodConfig = periods.find(p => p.value === selectedPeriod);
    const numQuarters = periodConfig?.quarters || 12;
    const relevantQuarters = quarterColumns.slice(-numQuarters);

    return relevantQuarters.map(q => ({
      quarter: q.label,
      value: parseValue(data[q.key]),
    })).filter(d => d.value > 0);
  };

  const chartData = transformToChartData();
  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const previousValue = chartData.length > 1 ? chartData[chartData.length - 2].value : currentValue;
  const changePercent = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = changePercent >= 0;

  // Calculate YoY change (4 quarters ago)
  const yearAgoValue = chartData.length > 4 ? chartData[chartData.length - 5].value : null;
  const yoyChangePercent = yearAgoValue && yearAgoValue !== 0 
    ? ((currentValue - yearAgoValue) / yearAgoValue) * 100 
    : null;
  const isYoyPositive = yoyChangePercent !== null ? yoyChangePercent >= 0 : true;

  // Get min/max/middle for Y-axis labels
  const minValue = chartData.length > 0 ? Math.min(...chartData.map(d => d.value)) : 0;
  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) : 0;
  const middleValue = (minValue + maxValue) / 2;

  const selectedMetricData = metrics.find(m => m.value === selectedMetric);

  const formatValue = (value: number): string => {
    if (value >= 10000) {
      return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Get category title for display
  const getCategoryTitle = () => {
    switch (category) {
      case 'currencies': return t('charts.currencies');
      case 'commodities': return t('charts.commodities');
      case 'indices': return t('charts.indices');
      default: return t('charts.quarterlyDevelopment');
    }
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="headline-serif text-xl">
            {category === 'all' ? t('charts.quarterlyDevelopment') : getCategoryTitle()}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchMarketData}
            disabled={isLoading}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-white/10">
            <SelectValue placeholder={t('charts.selectMetric')} />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
            {category === 'all' ? (
              <>
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground label-mono">{t('charts.currencies')}</SelectLabel>
                  {allMetrics.filter(m => m.category === 'currencies').map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground label-mono">{t('charts.commodities')}</SelectLabel>
                  {allMetrics.filter(m => m.category === 'commodities').map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground label-mono">{t('charts.indices')}</SelectLabel>
                  {allMetrics.filter(m => m.category === 'indices').map((metric) => (
                    <SelectItem key={metric.value} value={metric.value}>
                      {metric.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </>
            ) : (
              <SelectGroup>
                {metrics.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value}>
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="group flex w-full -space-x-[1.5px] divide-x divide-white/10 overflow-hidden rounded-lg border border-white/10">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              data-active={selectedPeriod === period.value}
              className="relative flex h-8 flex-1 items-center justify-center bg-transparent text-sm font-semibold tracking-tight text-muted-foreground outline-none first:rounded-l-lg last:rounded-r-lg hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-primary transition-colors label-mono"
            >
              {period.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-2xl font-semibold tracking-tight tabular-nums data-value">
              {formatValue(currentValue)}
            </span>
            <span className="text-sm text-muted-foreground label-mono">
              {selectedMetricData?.unit}
            </span>
            <span className={`inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium tracking-tight whitespace-nowrap ${
              isPositive 
                ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="size-3.5"
                aria-hidden="true"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d={isPositive ? "M6 18L18 6m0 0H9m9 0v9" : "M6 6l12 12m0 0H9m9 0V9"}
                />
              </svg>
              QoQ {Math.abs(changePercent).toFixed(2)}%
            </span>
            {yoyChangePercent !== null && (
              <span className={`inline-flex h-6 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium tracking-tight whitespace-nowrap ${
                isYoyPositive 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  aria-hidden="true"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d={isYoyPositive ? "M6 18L18 6m0 0H9m9 0v9" : "M6 6l12 12m0 0H9m9 0V9"}
                  />
                </svg>
                YoY {Math.abs(yoyChangePercent).toFixed(2)}%
              </span>
            )}
          </div>
          <p className="text-sm font-normal tracking-tight text-muted-foreground data-label">
            {selectedMetricData?.label} – {t(`charts.${selectedMetricData?.category}`)}
          </p>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[225px] w-full"
        >
          <LineChart accessibilityLayer data={chartData}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(33 100% 58%)" />
                <stop offset="100%" stopColor="hsl(195 91% 78%)" />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted-foreground) / 0.1)" />
            <XAxis 
              dataKey="quarter" 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              className="label-mono"
            />
            <YAxis 
              domain={[minValue * 0.95, maxValue * 1.05]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => {
                // Only show labels for actual min/max values, hide any auto-generated ticks like "0.00"
                const tolerance = (maxValue - minValue) * 0.01;
                const isMinTick = Math.abs(value - minValue * 0.95) < tolerance;
                const isMaxTick = Math.abs(value - maxValue * 1.05) < tolerance;
                const isMiddleTick = Math.abs(value - middleValue) < tolerance;
                if (isMinTick || isMaxTick || isMiddleTick) {
                  return formatValue(value);
                }
                return '';
              }}
              width={70}
              tickCount={5}
              allowDataOverflow={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator hideLabel />}
              cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
                className: "glow-orange"
              }}
            />
          </LineChart>
        </ChartContainer>
        
        {/* Print-only: Data Table with quarterly values */}
        <div className="hidden print:block print-data-table mt-4">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {chartData.map(d => (
                  <th key={d.quarter} className="border border-border px-2 py-1 text-center font-medium bg-muted">
                    {d.quarter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {chartData.map(d => (
                  <td key={d.quarter} className="border border-border px-2 py-1 text-center">
                    {formatValue(d.value)} {selectedMetricData?.unit}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
