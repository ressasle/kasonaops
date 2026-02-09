import React, { useState } from "react";
import { Bar, BarChart, XAxis, YAxis, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useLanguage } from "@/contexts/LanguageContext";

interface PerformanceDataPoint {
  asset: string;
  percent: number;
  category: string;
}

const chartConfig: ChartConfig = {
  percent: {
    label: "Change %",
    color: "hsl(var(--primary))",
  },
};

// Translation helper for Performance Chart
const translateAsset = (name: string, language: string) => {
  if (language === 'de') return name; // Already in German
  
  // English translations
  const translations: Record<string, string> = {
    'Silber (USD/oz)': 'Silver (USD/oz)',
    'Gold (USD/oz)': 'Gold (USD/oz)',
    'Kupfer (USD/t)': 'Copper (USD/t)',
    'Weizen (USD/dt)': 'Wheat (USD/dt)',
    'Öl WTI (USD)': 'Oil WTI (USD)',
    'Öl Brent (USD)': 'Oil Brent (USD)',
    'Bitcoin (USD)': 'Bitcoin (USD)',
    'Bloomberg Commodity': 'Bloomberg Commodity',
    'DAX (Pkt)': 'DAX (Pts)',
    'NASDAQ 100 (Pkt)': 'NASDAQ 100 (Pts)',
    'MSCI World (Pkt)': 'MSCI World (Pts)',
    'S&P 500 (Pkt)': 'S&P 500 (Pts)',
  };
  
  return translations[name] || name;
};

export const YoYPerformanceChart = () => {
  const { language } = useLanguage();
  const [viewType, setViewType] = useState<'yoy' | 'qoq'>('yoy');

  // Static verified YoY data from CSV (Q4 2025 vs Q4 2024)
  const yoyData: PerformanceDataPoint[] = [
    { asset: 'Silber (USD/oz)', percent: 146.12, category: 'commodity' },
    { asset: 'Gold (USD/oz)', percent: 64.37, category: 'commodity' },
    { asset: 'Kupfer (USD/t)', percent: 44.61, category: 'commodity' },
    { asset: 'DAX (Pkt)', percent: 23, category: 'index' },
    { asset: 'NASDAQ 100 (Pkt)', percent: 20, category: 'index' },
    { asset: 'MSCI World (Pkt)', percent: 19, category: 'index' },
    { asset: 'S&P 500 (Pkt)', percent: 16, category: 'index' },
    { asset: 'Bloomberg Commodity', percent: 11.10, category: 'commodity' },
    { asset: 'Weizen (USD/dt)', percent: -6.72, category: 'commodity' },
    { asset: 'Bitcoin (USD)', percent: -7.14, category: 'commodity' },
    { asset: 'Öl WTI (USD)', percent: -19.94, category: 'commodity' },
    { asset: 'Öl Brent (USD)', percent: -25.85, category: 'commodity' },
  ];

  // Static verified QoQ data from CSV (Q4 2025 vs Q3 2025)
  const qoqData: PerformanceDataPoint[] = [
    { asset: 'Silber (USD/oz)', percent: 52.71, category: 'commodity' },
    { asset: 'Kupfer (USD/t)', percent: 21.48, category: 'commodity' },
    { asset: 'Gold (USD/oz)', percent: 11.83, category: 'commodity' },
    { asset: 'DAX (Pkt)', percent: 4.38, category: 'index' },
    { asset: 'Bloomberg Commodity', percent: 4.01, category: 'commodity' },
    { asset: 'NASDAQ 100 (Pkt)', percent: 3.32, category: 'index' },
    { asset: 'S&P 500 (Pkt)', percent: 2.53, category: 'index' },
    { asset: 'MSCI World (Pkt)', percent: 2.03, category: 'index' },
    { asset: 'Weizen (USD/dt)', percent: -0.24, category: 'commodity' },
    { asset: 'Öl Brent (USD)', percent: -6.81, category: 'commodity' },
    { asset: 'Öl WTI (USD)', percent: -7.94, category: 'commodity' },
    { asset: 'Bitcoin (USD)', percent: -23.61, category: 'commodity' },
  ];

  const activeData = (viewType === 'yoy' ? yoyData : qoqData).map(item => ({
    ...item,
    asset: translateAsset(item.asset, language)
  }));

  const getSubtitle = () => {
    if (viewType === 'yoy') {
      return language === 'de' 
        ? 'YoY Veränderung Q4 2025 vs Q4 2024' 
        : 'YoY Change Q4 2025 vs Q4 2024';
    }
    return language === 'de' 
      ? 'QoQ Veränderung Q4 2025 vs Q3 2025' 
      : 'QoQ Change Q4 2025 vs Q3 2025';
  };

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="headline-serif text-xl">
            {language === 'de' ? 'Performance Vergleich' : 'Performance Comparison'}
          </CardTitle>
          <ToggleGroup 
            type="single" 
            value={viewType} 
            onValueChange={(v) => v && setViewType(v as 'yoy' | 'qoq')}
            className="bg-background/50 border border-white/10 rounded-lg p-1"
          >
            <ToggleGroupItem 
              value="qoq" 
              className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              QoQ
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="yoy" 
              className="px-3 py-1 text-xs data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
            >
              YoY
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <p className="text-sm text-muted-foreground label-mono">
          {getSubtitle()}
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height: `${Math.max(300, activeData.length * 32)}px` }}
        >
          <BarChart
            data={activeData}
            layout="vertical"
            margin={{ top: 10, right: 80, left: 80, bottom: 10 }}
          >
            <XAxis 
              type="number" 
              domain={[-40, 160]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => `${value}%`}
            />
            <YAxis 
              type="category" 
              dataKey="asset"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              width={75}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator />}
              cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
            />
            <Bar 
              dataKey="percent" 
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {activeData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.percent >= 0 ? 'hsl(195 91% 78%)' : 'hsl(33 100% 58%)'}
                />
              ))}
              <LabelList
                dataKey="percent"
                position="right"
                formatter={(value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`}
                style={{ 
                  fill: 'hsl(var(--foreground))', 
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
