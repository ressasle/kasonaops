import { AppNavbar } from '@/components/layout/AppNavbar';
import { Background } from '@/components/kasona/Background';
import { PortfolioOverview } from '@/components/dashboard/PortfolioOverview';
import { EarningsCalendar } from '@/components/dashboard/EarningsCalendar';
import { TopHoldings } from '@/components/dashboard/TopHoldings';
import { RecentActivity } from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Background />
      <AppNavbar />

      <main className="pt-20 px-4 md:px-8 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
            <p className="text-muted-foreground">
              Ihr Investment-Überblick auf einen Blick
            </p>
          </div>

          {/* Portfolio Overview */}
          <PortfolioOverview />

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Holdings */}
            <div className="lg:col-span-2">
              <TopHoldings />
            </div>

            {/* Right Column - Calendar & Activity */}
            <div className="space-y-6">
              <EarningsCalendar />
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
