import { AppNavbar } from '@/components/layout/AppNavbar';
import { PortfolioIntelligence } from '@/components/portfolio-intelligence/PortfolioIntelligence';

// --- MOCK DATA ---
const MOCK_DATA = {
  netWorth: 391394,
  invested: 194723, // ca 101% gain
  cashflow: {
    dividends: 2242,
    interest: 1287
  },
  friction: {
    total: -665.73,
    items: [
      { source: 'Financing', description: 'Sollzinsen USD Account', value: -571.73, severity: 'Critical' as const },
      { source: 'Trading Execution', description: 'Estimated Fees', value: -94.00, severity: 'Standard' as const }
    ],
    recommendation: 'Your debit interest (Sollzinsen) of €571 significantly reduces yield. Consider rebalancing cash from "Giro" accounts to cover negative USD balances in Captrader.'
  },
  assets: [
    { ticker: 'GOOGL', name: 'Alphabet', type: 'Equity', marketValue: 127440, unrealized: 98108, perfPercent: 335.0, qScore: 'A' as const },
    { ticker: 'VWRL', name: 'FTSE All-World', type: 'ETF', marketValue: 26390, unrealized: 5420, perfPercent: 25.8, qScore: 'A' as const },
    { ticker: 'BTC', name: 'Bitcoin', type: 'Crypto', marketValue: 6887, unrealized: 1878, perfPercent: 37.5, qScore: 'B' as const },
    { ticker: 'DIS', name: 'Disney', type: 'Equity', marketValue: 18411, unrealized: -6731, perfPercent: -26.8, qScore: 'A' as const },
    { ticker: 'SOL', name: 'Solana', type: 'Crypto', marketValue: 899, unrealized: -134, perfPercent: -13.0, qScore: 'B' as const },
  ],
  waterfall: [
    { label: 'DIVS', value: 2242, type: 'pos' as const },
    { label: 'INT', value: 1287, type: 'pos' as const },
    { label: 'FX', value: 839, type: 'pos' as const },
    { label: 'FIN', value: -571, type: 'neg' as const },
    { label: 'TRADES', value: -3250, type: 'neg' as const },
    { label: 'RESULT', value: 547, type: 'res' as const },
  ],
  trades: [
    { date: '2025-12-15', name: 'Meta Platforms', isin: 'US30303M1027', sellProceeds: 3289.70, costBasis: 2801.57, realizedPL: 488.13, quality: 'clean' as const, qualityLabel: '' },
    { date: '2025-12-16', name: 'Disney (Walt)', isin: 'US2546871060', sellProceeds: 9498.10, costBasis: 13268.68, realizedPL: -3770.58, quality: 'loss' as const, qualityLabel: 'LOSS' },
    { date: '2025-12-29', name: 'Meituan Cl.B', isin: 'KYG596691041', sellProceeds: 31.77, costBasis: 55.00, realizedPL: -23.23, quality: 'check' as const, qualityLabel: 'CHK COST' },
  ]
};

export default function Intelligence() {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main className="pt-16">
        <PortfolioIntelligence
          netWorth={MOCK_DATA.netWorth}
          invested={MOCK_DATA.invested}
          cashflow={MOCK_DATA.cashflow}
          friction={MOCK_DATA.friction}
          assets={MOCK_DATA.assets}
          waterfall={MOCK_DATA.waterfall}
          trades={MOCK_DATA.trades}
        />
      </main>
    </div>
  );
}
