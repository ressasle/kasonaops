"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { InvestorProfile } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { InvestorProfileImportDialog } from "./investor-profile-import-dialog";

const PRODUCT_STATUS_OPTIONS = ["to create", "created", "to review", "to send", "sent out"];
const OUTPUT_FORMAT_OPTIONS = ["Podcast", "Newsletter", "Other"];
const OUTPUT_FREQUENCY_OPTIONS = ["daily", "weekly", "bi-weekly", "monthly", "quarterly"];

type ProfileFormState = {
  company_id: string;
  portfolio_id: string;
  portfolio_name: string;
  product_status: string;
  output_format: string;
  output_frequency: string;
  data_granularity: string;
  action_frequency: string;
  decision_logic: string;
  risk_appetite: string;
  recipient_email: string;
  telegram_id: string;
  last_document_link: string;
  investment_philosophy: string;
  noise_filter: string;
  owner_id: string;
};

const EMPTY_STATE: ProfileFormState = {
  company_id: "",
  portfolio_id: "",
  portfolio_name: "",
  product_status: "",
  output_format: "",
  output_frequency: "",
  data_granularity: "",
  action_frequency: "",
  decision_logic: "",
  risk_appetite: "",
  recipient_email: "",
  telegram_id: "",
  last_document_link: "",
  investment_philosophy: "",
  noise_filter: "",
  owner_id: ""
};

const numberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapProfileToForm = (profile: InvestorProfile): ProfileFormState => ({
  company_id: profile.company_id?.toString() ?? "",
  portfolio_id: profile.portfolio_id ?? "",
  portfolio_name: profile.portfolio_name ?? "",
  product_status: profile.product_status ?? "",
  output_format: profile.output_format ?? "",
  output_frequency: profile.output_frequency ?? "",
  data_granularity: profile.data_granularity?.toString() ?? "",
  action_frequency: profile.action_frequency?.toString() ?? "",
  decision_logic: profile.decision_logic?.toString() ?? "",
  risk_appetite: profile.risk_appetite?.toString() ?? "",
  recipient_email: profile.recipient_email ?? "",
  telegram_id: profile.telegram_id ?? "",
  last_document_link: profile.last_document_link ?? "",
  investment_philosophy: profile.investment_philosophy ?? "",
  noise_filter: profile.noise_filter ?? "",
  owner_id: profile.owner_id ?? ""
});

type InvestorProfileManagerProps = {
  profiles: InvestorProfile[];
  supabaseReady: boolean;
};

export function InvestorProfileManager({ profiles, supabaseReady }: InvestorProfileManagerProps) {
  const router = useRouter();
  const [form, setForm] = useState<ProfileFormState>(EMPTY_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ProfileFormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(EMPTY_STATE);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      company_id: numberOrNull(form.company_id),
      portfolio_id: form.portfolio_id.trim(),
      portfolio_name: form.portfolio_name.trim() || null,
      product_status: form.product_status || null,
      output_format: form.output_format || null,
      output_frequency: form.output_frequency || null,
      data_granularity: numberOrNull(form.data_granularity),
      action_frequency: numberOrNull(form.action_frequency),
      decision_logic: numberOrNull(form.decision_logic),
      risk_appetite: numberOrNull(form.risk_appetite),
      recipient_email: form.recipient_email.trim() || null,
      telegram_id: form.telegram_id.trim() || null,
      last_document_link: form.last_document_link.trim() || null,
      investment_philosophy: form.investment_philosophy.trim() || null,
      noise_filter: form.noise_filter.trim() || null,
      owner_id: form.owner_id.trim() || null
    };

    const url = editingId ? `/api/investor-profiles/${editingId}` : "/api/investor-profiles";
    const method = editingId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to save investor profile");
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save investor profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (profile: InvestorProfile) => {
    setForm(mapProfileToForm(profile));
    setEditingId(profile.portfolio_id);
    setError(null);
  };

  const handleDelete = async (portfolioId: string) => {
    if (!supabaseReady) {
      setError("Supabase is not configured. Add environment variables first.");
      return;
    }

    const confirmed = window.confirm("Delete this investor profile?");
    if (!confirmed) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/investor-profiles/${portfolioId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to delete investor profile");
      }

      if (editingId === portfolioId) {
        resetForm();
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete investor profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{editingId ? `Edit Portfolio ${editingId}` : "New Investor Profile"}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetForm} disabled={isSaving}>
              Reset
            </Button>
            <InvestorProfileImportDialog onSuccess={router.refresh} />
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Company ID</Label>
                <Input type="number" value={form.company_id} onChange={handleChange("company_id")} />
              </div>
              <div className="space-y-2">
                <Label>Portfolio ID</Label>
                <Input value={form.portfolio_id} onChange={handleChange("portfolio_id")} disabled={Boolean(editingId)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Portfolio Name</Label>
              <Input value={form.portfolio_name} onChange={handleChange("portfolio_name")} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Product Status</Label>
                <select
                  value={form.product_status}
                  onChange={handleChange("product_status")}
                  className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select status</option>
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <select
                  value={form.output_format}
                  onChange={handleChange("output_format")}
                  className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select format</option>
                  {OUTPUT_FORMAT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Output Frequency</Label>
                <select
                  value={form.output_frequency}
                  onChange={handleChange("output_frequency")}
                  className="h-10 w-full rounded-full border border-input bg-transparent px-3 text-sm"
                >
                  <option value="">Select frequency</option>
                  {OUTPUT_FREQUENCY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Last Document</Label>
                <Input value={form.last_document_link} onChange={handleChange("last_document_link")} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Data Granularity</Label>
                <Input type="number" value={form.data_granularity} onChange={handleChange("data_granularity")} />
              </div>
              <div className="space-y-2">
                <Label>Action Frequency</Label>
                <Input type="number" value={form.action_frequency} onChange={handleChange("action_frequency")} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Decision Logic</Label>
                <Input type="number" value={form.decision_logic} onChange={handleChange("decision_logic")} />
              </div>
              <div className="space-y-2">
                <Label>Risk Appetite</Label>
                <Input type="number" value={form.risk_appetite} onChange={handleChange("risk_appetite")} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input type="email" value={form.recipient_email} onChange={handleChange("recipient_email")} />
              </div>
              <div className="space-y-2">
                <Label>Telegram ID</Label>
                <Input value={form.telegram_id} onChange={handleChange("telegram_id")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Investment Philosophy</Label>
              <Textarea value={form.investment_philosophy} onChange={handleChange("investment_philosophy")} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Noise Filter</Label>
              <Textarea value={form.noise_filter} onChange={handleChange("noise_filter")} rows={2} />
            </div>
            {error && <div className="text-sm text-red-300">{error}</div>}
            <Button type="submit" disabled={isSaving} className="w-full">
              {editingId ? "Update Profile" : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Investor Profiles</CardTitle>
          <Badge variant={supabaseReady ? "success" : "warning"}>
            {supabaseReady ? "Live" : "Offline"}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Portfolio</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Output</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.portfolio_id}>
                  <TableCell>
                    <div className="font-mono text-sm">{profile.portfolio_id}</div>
                    <div className="text-xs text-muted-foreground">{profile.portfolio_name ?? "-"}</div>
                  </TableCell>
                  <TableCell>{profile.company_id ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={profile.product_status === "to review" ? "warning" : "default"}>
                      {profile.product_status ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {profile.output_format ?? "-"}
                    <div className="text-xs text-muted-foreground">{profile.output_frequency ?? ""}</div>
                  </TableCell>
                  <TableCell>{profile.updated_at ? profile.updated_at.slice(0, 10) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(profile)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(profile.portfolio_id)}>
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
