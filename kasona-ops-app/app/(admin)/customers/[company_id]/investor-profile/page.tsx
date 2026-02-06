import { notFound } from "next/navigation";

import { InvestorProfileOverview } from "@/components/admin/crm/investor-profile-overview";
import { getCustomers, getInvestorProfiles } from "@/lib/data/customers";

interface PageProps {
  params: Promise<{
    company_id: string;
  }>;
}

export default async function InvestorProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  const companyIdValue = Number(resolvedParams.company_id);
  if (Number.isNaN(companyIdValue)) {
    return notFound();
  }

  const [customers, profiles] = await Promise.all([
    getCustomers(200),
    getInvestorProfiles()
  ]);

  if (customers.length === 0) {
    return notFound();
  }

  return (
    <div className="space-y-8">
      <InvestorProfileOverview
        customers={customers}
        profiles={profiles}
        defaultCustomerId={companyIdValue}
      />
    </div>
  );
}
