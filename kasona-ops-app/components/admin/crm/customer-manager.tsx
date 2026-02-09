"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import type { Customer } from "@/lib/data/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const STATUS_OPTIONS = [
  "Lead Identified",
  "Lead Captured",
  "Lead Enriched",
  "Meeting Booked",
  "Offer Generated",
  "Offer Sent",
  "Free User",
  "Paid User",
  "Expanded",
  "Closed Won",
  "Closed Lost",
  "Churned"
];

const ACTION_STATUS_OPTIONS = [
  "New",
  "To Check",
  "Reminder Set",
  "To Reach Out",
  "Mail Sent",
  "Backlog",
  "To Expand",
  "Renewed"
];

const INDUSTRY_OPTIONS = ["Investing", "Industrial Services", "Consulting", "E-Commerce"];

const SOURCE_OPTIONS = ["Inbound", "Outbound"];

const TYPE_OPTIONS = ["customer", "partner", "supplier", "other"];

const PRODUCT_OPTIONS = ["Wealth Intelligence", "Quartals-kompass", "Transformations Paket"];

const CHARGE_TYPE_OPTIONS = ["Reatiner", "Per Hour", "Package", "Fixed Fee"];

const BILLING_TYPE_OPTIONS = ["Quarterly", "Monthly", "Project-based", "Per Output"];

type CustomerFormState = {
  company_name: string;
  contact_person_name: string;
  contact_person_position: string;
  email: string;
  website: string;
  phone: string;
  industry: string;
  status: string;
  action_status: string;
  source: string;
  type: string;
  expected_deal_value: string;
  probability: string;
  product_type: string;
  contract_size: string;
  charge_type: string;
  billing_type: string;
  billing_address: string;
  billing_email: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  entered_at: string;
  exited_at: string;
  days_in_stage: string;
  fit_tier: string;
  previous_stage: string;
  changed_by: string;
  change_reason: string;
  notes: string;
  payment_terms: string;
  owner_id: string;
};

const EMPTY_STATE: CustomerFormState = {
  company_name: "",
  contact_person_name: "",
  contact_person_position: "",
  email: "",
  website: "",
  phone: "",
  industry: "",
  status: "",
  action_status: "",
  source: "",
  type: "",
  expected_deal_value: "",
  probability: "",
  product_type: "",
  contract_size: "",
  charge_type: "",
  billing_type: "",
  billing_address: "",
  billing_email: "",
  start_date: "",
  end_date: "",
  is_current: true,
  entered_at: "",
  exited_at: "",
  days_in_stage: "",
  fit_tier: "",
  previous_stage: "",
  changed_by: "",
  change_reason: "",
  notes: "",
  payment_terms: "",
  owner_id: ""
};

const numberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const fixEncoding = (value: string) => {
  if (!value) return value;
  return value
    .replace(/Ã¤/g, "\u00e4")
    .replace(/Ã¶/g, "\u00f6")
    .replace(/Ã¼/g, "\u00fc")
    .replace(/Ã„/g, "\u00c4")
    .replace(/Ã–/g, "\u00d6")
    .replace(/Ãœ/g, "\u00dc")
    .replace(/ÃŸ/g, "\u00df");
};

const mapCustomerToForm = (customer: Customer): CustomerFormState => ({
  company_name: customer.company_name ?? "",
  contact_person_name: customer.contact_person_name ?? "",
  contact_person_position: customer.contact_person_position ?? "",
  email: customer.email ?? "",
  website: customer.website ?? "",
  phone: customer.phone ?? "",
  industry: customer.industry ?? "",
  status: customer.status ?? "",
  action_status: customer.action_status ?? "",
  source: customer.source ?? "",
  type: customer.type ?? "",
  expected_deal_value: customer.expected_deal_value?.toString() ?? "",
  probability: customer.probability?.toString() ?? "",
  product_type: customer.product_type ?? "",
  contract_size: customer.contract_size?.toString() ?? "",
  charge_type: customer.charge_type ?? "",
  billing_type: customer.billing_type ?? "",
  billing_address: customer.billing_address ?? "",
  billing_email: customer.billing_email ?? "",
  start_date: customer.start_date ?? "",
  end_date: customer.end_date ?? "",
  is_current: customer.is_current ?? true,
  entered_at: customer.entered_at ?? "",
  exited_at: customer.exited_at ?? "",
  days_in_stage: customer.days_in_stage?.toString() ?? "",
  fit_tier: customer.fit_tier ?? "",
  previous_stage: customer.previous_stage ?? "",
  changed_by: customer.changed_by ?? "",
  change_reason: customer.change_reason ?? "",
  notes: customer.notes ?? "",
  payment_terms: customer.payment_terms?.toString() ?? "",
  owner_id: customer.owner_id ?? ""
});

type CustomerManagerProps = {
  customers: Customer[];
  supabaseReady: boolean;
  mode?: "list" | "form" | "onboarding" | "new-lead";
  onSuccess?: (id: number, name: string) => void;
  initialEditId?: number;
  initialFilters?: {
    search?: string;
    status?: string;
    action?: string;
    industry?: string;
    type?: string;
    product?: string;
  };
};

export function CustomerManager({
  customers,
  supabaseReady,
  mode = "list",
  onSuccess,
  initialEditId,
  initialFilters
}: CustomerManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState<CustomerFormState>(EMPTY_STATE);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [potentialMatches, setPotentialMatches] = useState<Customer[]>([]);
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [enrichingCompanyId, setEnrichingCompanyId] = useState<number | null>(null);
  const [enrichmentMessage, setEnrichmentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialFilters) return;
    if (initialFilters.search !== undefined) setSearchTerm(initialFilters.search);
    if (initialFilters.status !== undefined) setStatusFilter(initialFilters.status);
    if (initialFilters.action !== undefined) setActionFilter(initialFilters.action);
    if (initialFilters.industry !== undefined) setIndustryFilter(initialFilters.industry);
    if (initialFilters.type !== undefined) setTypeFilter(initialFilters.type);
    if (initialFilters.product !== undefined) setProductFilter(initialFilters.product);
  }, [initialFilters]);

  useEffect(() => {
    if (!initialEditId || editingId) return;
    const target = customers.find((customer) => customer.company_id === initialEditId);
    if (target) {
      handleEdit(target);
      setTimeout(() => {
        const element = document.getElementById("new-company");
        if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [initialEditId, customers, editingId]);

  const handleChange =
    (field: keyof CustomerFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleCheckbox = (field: keyof CustomerFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const resetForm = () => {
    setForm(EMPTY_STATE);
    setEditingId(null);
    setError(null);
    setPotentialMatches([]);
    setDuplicateConfirmed(false);
  };

  const normalizedName = useMemo(() => form.company_name.trim(), [form.company_name]);
  const normalizedEmail = useMemo(() => form.email.trim(), [form.email]);
  const normalizedWebsite = useMemo(() => form.website.trim(), [form.website]);

  const duplicateMap = useMemo(() => {
    const seen: Record<string, number> = {};
    const markKey = (key: string | null) => {
      if (!key) return;
      seen[key] = (seen[key] ?? 0) + 1;
    };

    customers.forEach((customer) => {
      const nameKey = customer.company_name?.trim().toLowerCase() ?? null;
      const emailKey = customer.email?.trim().toLowerCase() ?? null;
      const websiteKey = customer.website?.trim().toLowerCase() ?? null;
      markKey(nameKey ? `name:${nameKey}` : null);
      markKey(emailKey ? `email:${emailKey}` : null);
      markKey(websiteKey ? `website:${websiteKey}` : null);
    });

    return seen;
  }, [customers]);

  const isDuplicate = (customer: Customer) => {
    const nameKey = customer.company_name?.trim().toLowerCase() ?? null;
    const emailKey = customer.email?.trim().toLowerCase() ?? null;
    const websiteKey = customer.website?.trim().toLowerCase() ?? null;
    return Boolean(
      (nameKey && duplicateMap[`name:${nameKey}`] > 1) ||
      (emailKey && duplicateMap[`email:${emailKey}`] > 1) ||
      (websiteKey && duplicateMap[`website:${websiteKey}`] > 1)
    );
  };

  const missingReviewFields = (customer: Customer) => {
    const fields: string[] = [];
    if (!customer.contact_person_name) fields.push("Contact");
    if (!customer.contact_person_position) fields.push("Position");
    if (!customer.billing_address) fields.push("Billing");
    if (!customer.start_date) fields.push("Start date");
    return fields;
  };

  useEffect(() => {
    if (!supabaseReady) {
      setPotentialMatches([]);
      return;
    }

    const hasQuery =
      normalizedName.length >= 2 || normalizedEmail.length >= 3 || normalizedWebsite.length >= 3;

    if (!hasQuery || editingId) {
      setPotentialMatches([]);
      return;
    }

    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (normalizedName.length >= 2) params.set("name", normalizedName);
        if (normalizedEmail.length >= 3) params.set("email", normalizedEmail);
        if (normalizedWebsite.length >= 3) params.set("website", normalizedWebsite);
        const response = await fetch(`/api/customers/search?${params.toString()}`);
        if (!response.ok) {
          setPotentialMatches([]);
          return;
        }
        const payload = (await response.json()) as { data?: Customer[] };
        setPotentialMatches(payload.data ?? []);
      } catch (err) {
        setPotentialMatches([]);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [normalizedName, normalizedEmail, normalizedWebsite, supabaseReady, editingId]);

  const sortedCustomers = useMemo(() => {
    return customers.slice().sort((a, b) => {
      const aDate = a.updated_at ?? a.created_at ?? "";
      const bDate = b.updated_at ?? b.created_at ?? "";
      return bDate.localeCompare(aDate);
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sortedCustomers.filter((customer) => {
      const matchesTerm = term
        ? [customer.company_name, customer.email, customer.company_id?.toString()]
          .filter(Boolean)
          .some((value) => value?.toString().toLowerCase().includes(term))
        : true;
      const matchesStatus = statusFilter ? customer.status === statusFilter : true;
      const matchesAction = actionFilter ? customer.action_status === actionFilter : true;
      const matchesIndustry = industryFilter ? customer.industry === industryFilter : true;
      const matchesType = typeFilter ? customer.type === typeFilter : true;
      const matchesProduct = productFilter ? customer.product_type === productFilter : true;
      return matchesTerm && matchesStatus && matchesAction && matchesIndustry && matchesType && matchesProduct;
    });
  }, [sortedCustomers, searchTerm, statusFilter, actionFilter, industryFilter, typeFilter, productFilter]);

  const displayCustomers = useMemo(() => {
    const isFiltering =
      searchTerm.trim().length > 0 ||
      statusFilter ||
      actionFilter ||
      industryFilter ||
      typeFilter ||
      productFilter;
    return isFiltering ? filteredCustomers : sortedCustomers.slice(0, 12);
  }, [filteredCustomers, sortedCustomers, searchTerm, statusFilter, actionFilter, industryFilter, typeFilter, productFilter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    setIsSaving(true);
    setError(null);

    if (searching) {
      setError("Please wait for the duplicate check to finish.");
      setIsSaving(false);
      return;
    }

    if (!form.company_name.trim()) {
      setError("Company name is required.");
      setIsSaving(false);
      return;
    }

    if (potentialMatches.length > 0 && !duplicateConfirmed) {
      setError("Possible duplicate found. Confirm to create anyway.");
      setIsSaving(false);
      return;
    }

    const payload = {
      company_name: form.company_name.trim(),
      contact_person_name: fixEncoding(form.contact_person_name.trim()) || null,
      contact_person_position: fixEncoding(form.contact_person_position.trim()) || null,
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      phone: form.phone.trim() || null,
      industry: form.industry || null,
      status: form.status || null,
      action_status: form.action_status || null,
      source: form.source || null,
      type: form.type || null,
      expected_deal_value: numberOrNull(form.expected_deal_value),
      probability: numberOrNull(form.probability),
      product_type: form.product_type.trim() || null,
      contract_size: numberOrNull(form.contract_size),
      charge_type: form.charge_type || null,
      billing_type: form.billing_type || null,
      billing_address: form.billing_address.trim() || null,
      billing_email: form.billing_email.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      is_current: form.is_current,
      entered_at: form.entered_at || null,
      exited_at: form.exited_at || null,
      days_in_stage: numberOrNull(form.days_in_stage),
      fit_tier: form.fit_tier.trim() || null,
      previous_stage: form.previous_stage.trim() || null,
      changed_by: form.changed_by.trim() || null,
      change_reason: form.change_reason.trim() || null,
      notes: form.notes.trim() || null,
      payment_terms: numberOrNull(form.payment_terms),
      owner_id: form.owner_id.trim() || null
    };

    const url = editingId ? `/api/customers/${editingId}` : "/api/customers";
    const method = editingId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save customer");
      }

      const result = await response.json();

      const created = Array.isArray(result.data) ? result.data[0] : result.data;

      if ((mode === "onboarding") && onSuccess && created) {
        onSuccess(created.company_id, created.company_name);
        return;
      }

      if ((mode === "new-lead" || mode === "form") && created) {
        router.push(`/customers/${created.company_id}`);
        return;
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save customer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setForm(mapCustomerToForm(customer));
    setEditingId(customer.company_id);
    setError(null);
    setDuplicateConfirmed(false);
  };

  const handleEnrich = async (customer: Customer) => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }
    if (customer.type === "partner" || customer.type === "supplier") {
      setEnrichmentMessage(
        `Enrichment skipped for ${customer.company_name}: only customer/lead records are eligible.`
      );
      return;
    }
    if (!customer.website?.trim()) {
      setEnrichmentMessage(`Cannot enrich ${customer.company_name}: website is missing.`);
      return;
    }

    setEnrichingCompanyId(customer.company_id);
    setEnrichmentMessage(null);

    try {
      const response = await fetch(`/api/customers/${customer.company_id}/enrich`, {
        method: "POST"
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Website enrichment failed");
      }

      const data = (await response.json()) as {
        enrichment?: { updated_fields?: string[] };
      };
      const updatedFields = data.enrichment?.updated_fields ?? [];
      setEnrichmentMessage(
        updatedFields.length > 0
          ? `Enriched ${customer.company_name}: ${updatedFields.join(", ")}`
          : `Enrichment completed for ${customer.company_name} (notes updated).`
      );
      router.refresh();
    } catch (enrichError) {
      setEnrichmentMessage(
        enrichError instanceof Error ? enrichError.message : "Website enrichment failed"
      );
    } finally {
      setEnrichingCompanyId(null);
    }
  };

  const isFormMode = mode === "form" || mode === "new-lead" || mode === "onboarding";
  const isNewLead = mode === "new-lead";
  const renderForm = isFormMode;
  const renderList = mode === "list";

  return (
    <section className={isFormMode ? "mx-auto w-full max-w-3xl" : "space-y-6"}>
      {renderForm && (
        <Card id="new-company" className={isNewLead ? "p-6" : "p-6"}>
          <CardHeader>
            <CardTitle>{isNewLead ? "New Lead" : editingId ? `Edit Company ${editingId}` : "New Company Profile"}</CardTitle>
            {!isNewLead && (
              <Button variant="outline" size="sm" onClick={resetForm} disabled={isSaving}>
                Reset
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={form.company_name} onChange={handleChange("company_name")} required className={isNewLead ? "ring-2 ring-primary/40" : ""} />
                {searching && <div className="text-xs text-muted-foreground">Checking duplicates...</div>}
                {potentialMatches.length > 0 && !editingId && (
                  <div className="space-y-2 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-xs">
                    <div className="text-yellow-200">Possible existing records found:</div>
                    {potentialMatches.map((match) => (
                      <div key={match.company_id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{match.company_name}</div>
                          <div className="text-muted-foreground">{match.email ?? "No email"} · ID {match.company_id}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" type="button" asChild>
                            <Link href={`/customers/${match.company_id}`}>Open Profile</Link>
                          </Button>
                          {!isNewLead && (
                            <Button variant="outline" size="sm" type="button" onClick={() => handleEdit(match)}>
                              Load
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={duplicateConfirmed}
                        onChange={(event) => setDuplicateConfirmed(event.target.checked)}
                      />
                      Create anyway (I reviewed duplicates)
                    </label>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input value={form.contact_person_name} onChange={handleChange("contact_person_name")} className={isNewLead ? "ring-2 ring-primary/40" : ""} />
              </div>
              <div className="space-y-2">
                <Label>Contact Position</Label>
                <Input value={form.contact_person_position} onChange={handleChange("contact_person_position")} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={handleChange("email")} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={handleChange("phone")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={handleChange("website")} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select
                    value={form.industry}
                    onChange={handleChange("industry")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <select
                    value={form.source}
                    onChange={handleChange("source")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select source</option>
                    {SOURCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={form.status}
                    onChange={handleChange("status")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select status</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Action Status</Label>
                  <select
                    value={form.action_status}
                    onChange={handleChange("action_status")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select action</option>
                    {ACTION_STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    value={form.type}
                    onChange={handleChange("type")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select type</option>
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <select
                    value={form.product_type}
                    onChange={handleChange("product_type")}
                    className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select product</option>
                    {PRODUCT_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={showDocumentation} onCheckedChange={setShowDocumentation} />
                  <Label>Show Documentation</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={showFinance} onCheckedChange={setShowFinance} />
                  <Label>Show Finance Info</Label>
                </div>
              </div>
              {showFinance && (
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-sm font-semibold">Finance Info</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Contract Size</Label>
                      <Input type="number" value={form.contract_size} onChange={handleChange("contract_size")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Charge Type</Label>
                      <select
                        value={form.charge_type}
                        onChange={handleChange("charge_type")}
                        className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="">Select charge type</option>
                        {CHARGE_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Type</Label>
                      <select
                        value={form.billing_type}
                        onChange={handleChange("billing_type")}
                        className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                      >
                        <option value="">Select billing type</option>
                        {BILLING_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Billing Email</Label>
                      <Input type="email" value={form.billing_email} onChange={handleChange("billing_email")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Terms (days)</Label>
                      <Input type="number" value={form.payment_terms} onChange={handleChange("payment_terms")} placeholder="e.g. 30" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label>Billing Address</Label>
                    <Textarea value={form.billing_address} onChange={handleChange("billing_address")} rows={2} />
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" value={form.start_date} onChange={handleChange("start_date")} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" value={form.end_date} onChange={handleChange("end_date")} />
                    </div>
                  </div>
                </div>
              )}
              {showDocumentation && (
                <div className="rounded-2xl border border-border/60 p-4">
                  <div className="text-sm font-semibold">Documentation</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={form.is_current} onChange={handleCheckbox("is_current")} />
                      <Label>Current Customer</Label>
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label>Entered At</Label>
                      <Input type="datetime-local" value={form.entered_at} onChange={handleChange("entered_at")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Exited At</Label>
                      <Input type="datetime-local" value={form.exited_at} onChange={handleChange("exited_at")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Deal Value</Label>
                      <Input type="number" value={form.expected_deal_value} onChange={handleChange("expected_deal_value")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Probability</Label>
                      <Input type="number" value={form.probability} onChange={handleChange("probability")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Days in Stage</Label>
                      <Input type="number" value={form.days_in_stage} onChange={handleChange("days_in_stage")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Fit Tier</Label>
                      <Input value={form.fit_tier} onChange={handleChange("fit_tier")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Previous Stage</Label>
                      <Input value={form.previous_stage} onChange={handleChange("previous_stage")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Changed By</Label>
                      <Input value={form.changed_by} onChange={handleChange("changed_by")} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label>Change Reason</Label>
                    <Textarea value={form.change_reason} onChange={handleChange("change_reason")} rows={2} />
                  </div>
                  <div className="mt-3 space-y-2">
                    <Label>Notes</Label>
                    <Textarea value={form.notes} onChange={handleChange("notes")} rows={3} />
                  </div>
                </div>
              )}
              {error && <div className="text-sm text-red-300">{error}</div>}
              <Button type="submit" disabled={isSaving || searching} className="w-full">
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking duplicates...
                  </>
                ) : editingId ? (
                  "Update Company"
                ) : (
                  "Create Company"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {renderList && (
        <Card className="p-6 lg:col-span-2">
          <CardHeader>
            <CardTitle>Company Records</CardTitle>
            <Badge variant={supabaseReady ? "success" : "warning"}>
              {supabaseReady ? "Live" : "Offline"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              <Input
                placeholder="Search name, email, ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={actionFilter}
                onChange={(event) => setActionFilter(event.target.value)}
                className="h-10 rounded-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All actions</option>
                {ACTION_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={industryFilter}
                onChange={(event) => setIndustryFilter(event.target.value)}
                className="h-10 rounded-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All industries</option>
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="h-10 rounded-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All types</option>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value)}
                className="h-10 rounded-full border border-input bg-transparent px-3 text-sm"
              >
                <option value="">All products</option>
                {PRODUCT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
              <div className="mb-3 text-xs text-muted-foreground">
                Showing {displayCustomers.length} of {customers.length} (most recent by default)
              </div>
              {enrichmentMessage && (
                <div className="mb-3 text-xs text-muted-foreground">{enrichmentMessage}</div>
              )}
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayCustomers.map((customer) => (
                  <TableRow key={customer.company_id}>
                    <TableCell>
                      <Link href={`/customers/${customer.company_id}`} className="text-sm font-medium hover:underline">
                        {customer.company_name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{customer.email ?? "No email"}</div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {isDuplicate(customer) && (
                          <Badge variant="warning">Duplicate</Badge>
                        )}
                        {missingReviewFields(customer).map((field) => (
                          <Badge key={field} variant="default">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status?.includes("Paid") ? "success" : "default"}>
                        {customer.status ?? "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.action_status ?? "-"}</TableCell>
                    <TableCell>{customer.expected_deal_value ?? "-"}</TableCell>
                    <TableCell>{customer.updated_at ? customer.updated_at.slice(0, 10) : "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                          {(() => {
                            const isIneligibleType = customer.type === "partner" || customer.type === "supplier";
                            const disableReason = isIneligibleType
                              ? `Disabled for ${customer.type}`
                              : !customer.website
                                ? "Website required"
                                : "Enrich with Firecrawl";
                            return (
                              <>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/customers/${customer.company_id}`}>Open</Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => handleEnrich(customer)}
                            disabled={isIneligibleType || !customer.website || enrichingCompanyId === customer.company_id}
                            title={disableReason}
                          >
                            {enrichingCompanyId === customer.company_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="mr-1 h-4 w-4" />
                                Enrich
                              </>
                            )}
                          </Button>
                              </>
                            );
                          })()}
                        </div>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
