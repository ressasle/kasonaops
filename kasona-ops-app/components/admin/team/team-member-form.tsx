"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { TeamMember, TeamMemberInsert, TeamMemberUpdate } from "@/lib/data/team";

const ROLE_OPTIONS = ["admin", "manager", "analyst", "assistant", "viewer"];
const DEPARTMENT_OPTIONS = ["management", "sales", "operations", "finance", "tech"];
const CONTRACT_OPTIONS = ["full_time", "part_time", "freelancer", "working_student", "intern"];

type TeamMemberFormProps = {
  initialValue?: TeamMember;
  onSubmit: (payload: TeamMemberInsert | TeamMemberUpdate) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
};

type TeamMemberFormState = {
  member_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  date_of_birth: string;
  hire_date: string;
  termination_date: string;
  is_active: boolean;
  contract_type: string;
  salary_gross: string;
  salary_currency: string;
  tax_id: string;
  social_security_id: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  iban: string;
  bank_name: string;
  role: string;
  department: string;
  job_title: string;
  auth_user_id: string;
  notes: string;
};

const mapMemberToState = (member?: TeamMember): TeamMemberFormState => ({
  member_id: member?.member_id ?? "",
  first_name: member?.first_name ?? "",
  last_name: member?.last_name ?? "",
  display_name: member?.display_name ?? "",
  email: member?.email ?? "",
  phone: member?.phone ?? "",
  avatar_url: member?.avatar_url ?? "",
  date_of_birth: member?.date_of_birth ?? "",
  hire_date: member?.hire_date ?? "",
  termination_date: member?.termination_date ?? "",
  is_active: member?.is_active ?? true,
  contract_type: member?.contract_type ?? "",
  salary_gross: member?.salary_gross?.toString() ?? "",
  salary_currency: member?.salary_currency ?? "EUR",
  tax_id: member?.tax_id ?? "",
  social_security_id: member?.social_security_id ?? "",
  street: member?.street ?? "",
  city: member?.city ?? "",
  postal_code: member?.postal_code ?? "",
  country: member?.country ?? "",
  iban: member?.iban ?? "",
  bank_name: member?.bank_name ?? "",
  role: member?.role ?? "viewer",
  department: member?.department ?? "",
  job_title: member?.job_title ?? "",
  auth_user_id: member?.auth_user_id ?? "",
  notes: member?.notes ?? ""
});

const numberOrNull = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function TeamMemberForm({ initialValue, onSubmit, submitLabel, onCancel }: TeamMemberFormProps) {
  const [form, setForm] = useState<TeamMemberFormState>(() => mapMemberToState(initialValue));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(initialValue);

  const fullName = useMemo(
    () => `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
    [form.first_name, form.last_name]
  );

  const update =
    (field: keyof TeamMemberFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
      };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.member_id.trim() && !isEditing) {
      setError("Member ID is required.");
      return;
    }
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    const basePayload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      display_name: (form.display_name.trim() || fullName),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      date_of_birth: form.date_of_birth || null,
      hire_date: form.hire_date || null,
      termination_date: form.termination_date || null,
      is_active: form.is_active,
      contract_type: (form.contract_type || null) as TeamMemberInsert["contract_type"],
      salary_gross: numberOrNull(form.salary_gross),
      salary_currency: form.salary_currency.trim() || null,
      tax_id: form.tax_id.trim() || null,
      social_security_id: form.social_security_id.trim() || null,
      street: form.street.trim() || null,
      city: form.city.trim() || null,
      postal_code: form.postal_code.trim() || null,
      country: form.country.trim() || null,
      iban: form.iban.trim() || null,
      bank_name: form.bank_name.trim() || null,
      role: form.role as TeamMemberInsert["role"],
      department: (form.department || null) as TeamMemberInsert["department"],
      job_title: form.job_title.trim() || null,
      auth_user_id: form.auth_user_id.trim() || null,
      notes: form.notes.trim() || null
    };

    const payload = isEditing
      ? (basePayload as TeamMemberUpdate)
      : ({
          ...basePayload,
          member_id: form.member_id.trim().toLowerCase()
        } as TeamMemberInsert);

    setIsSaving(true);
    try {
      await onSubmit(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save team member");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="member_id">Member ID</Label>
          <Input
            id="member_id"
            value={form.member_id}
            onChange={update("member_id")}
            disabled={isEditing}
            placeholder="julian"
            className="bg-black/20 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={form.display_name}
            onChange={update("display_name")}
            placeholder={fullName || "Full name"}
            className="bg-black/20 border-border/50"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name</Label>
          <Input id="first_name" value={form.first_name} onChange={update("first_name")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" value={form.last_name} onChange={update("last_name")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={update("email")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={update("phone")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select id="role" value={form.role} onChange={update("role")} className="h-10 w-full rounded-full border border-input bg-black/20 px-3 text-sm">
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <select
            id="department"
            value={form.department}
            onChange={update("department")}
            className="h-10 w-full rounded-full border border-input bg-black/20 px-3 text-sm"
          >
            <option value="">Unassigned</option>
            {DEPARTMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="job_title">Job Title</Label>
          <Input id="job_title" value={form.job_title} onChange={update("job_title")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="contract_type">Contract Type</Label>
          <select
            id="contract_type"
            value={form.contract_type}
            onChange={update("contract_type")}
            className="h-10 w-full rounded-full border border-input bg-black/20 px-3 text-sm"
          >
            <option value="">Not set</option>
            {CONTRACT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hire_date">Hire Date</Label>
          <Input id="hire_date" type="date" value={form.hire_date} onChange={update("hire_date")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date_of_birth">Date of Birth</Label>
          <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={update("date_of_birth")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salary_gross">Salary Gross</Label>
          <Input id="salary_gross" type="number" value={form.salary_gross} onChange={update("salary_gross")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary_currency">Currency</Label>
          <Input id="salary_currency" value={form.salary_currency} onChange={update("salary_currency")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="is_active">Active</Label>
          <div className="flex h-10 items-center rounded-full border border-input bg-black/20 px-3">
            <Switch checked={form.is_active} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input id="tax_id" value={form.tax_id} onChange={update("tax_id")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="social_security_id">Social Security ID</Label>
          <Input id="social_security_id" value={form.social_security_id} onChange={update("social_security_id")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="street">Street</Label>
          <Input id="street" value={form.street} onChange={update("street")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} onChange={update("city")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input id="postal_code" value={form.postal_code} onChange={update("postal_code")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={form.country} onChange={update("country")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="termination_date">Termination Date</Label>
          <Input id="termination_date" type="date" value={form.termination_date} onChange={update("termination_date")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input id="iban" value={form.iban} onChange={update("iban")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank_name">Bank Name</Label>
          <Input id="bank_name" value={form.bank_name} onChange={update("bank_name")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="avatar_url">Avatar URL</Label>
          <Input id="avatar_url" value={form.avatar_url} onChange={update("avatar_url")} className="bg-black/20 border-border/50" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="auth_user_id">Auth User ID</Label>
          <Input id="auth_user_id" value={form.auth_user_id} onChange={update("auth_user_id")} className="bg-black/20 border-border/50" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={form.notes} onChange={update("notes")} rows={4} className="bg-black/20 border-border/50" />
      </div>

      {error && <div className="text-sm text-red-300">{error}</div>}

      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSaving} className="cursor-pointer">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel ?? (isEditing ? "Save Changes" : "Create Team Member")
          )}
        </Button>
      </div>
    </form>
  );
}
