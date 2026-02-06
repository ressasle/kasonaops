import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="glass-panel max-w-lg rounded-3xl p-8 text-center">
        <div className="headline-serif text-3xl">Kasona Ops</div>
        <p className="mt-3 text-sm text-muted-foreground">
          Admin workspace for sales, tracking, and fulfillment.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard">Open Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
