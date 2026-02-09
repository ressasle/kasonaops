"use client";

import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReminderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CustomerMatch = {
  company_id: number;
  company_name: string;
  email: string | null;
};

export function ReminderDialog({ open, onOpenChange }: ReminderDialogProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CustomerMatch[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [reminderDate, setReminderDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = useMemo(
    () => results.find((item) => item.company_id.toString() === selectedCompanyId),
    [results, selectedCompanyId]
  );

  const searchCustomers = async () => {
    if (search.trim().length < 2) {
      setError("Enter at least 2 characters to search.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/customers/search?name=${encodeURIComponent(search.trim())}`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to search customers");
      }
      const payload = (await response.json()) as { data?: CustomerMatch[] };
      setResults(payload.data ?? []);
      if ((payload.data ?? []).length === 1) {
        setSelectedCompanyId((payload.data ?? [])[0].company_id.toString());
      }
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Unable to search customers");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSearch("");
    setResults([]);
    setSelectedCompanyId("");
    setReminderDate("");
    setNote("");
    setError(null);
    setLoading(false);
    setSaving(false);
  };

  const submitReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const companyId = Number(selectedCompanyId);
    if (!Number.isFinite(companyId)) {
      setError("Select a customer first.");
      return;
    }

    if (!reminderDate) {
      setError("Reminder date is required.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/customers/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminder_date: new Date(`${reminderDate}T09:00:00`).toISOString(),
          action_status: "Reminder Set",
          change_reason: note.trim() || null
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to set reminder");
      }

      onOpenChange(false);
      resetState();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to set reminder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogContent className="glass-panel max-w-xl">
        <DialogHeader>
          <DialogTitle>Set Customer Reminder</DialogTitle>
          <DialogDescription>
            Select a customer and schedule a reminder. This sets action status to Reminder Set.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={submitReminder}>
          <div className="space-y-2">
            <Label htmlFor="reminder-search">Customer Search</Label>
            <div className="flex gap-2">
              <Input
                id="reminder-search"
                placeholder="Search by company name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="bg-black/20 border-border/50"
              />
              <Button type="button" variant="outline" onClick={searchCustomers} className="cursor-pointer" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-id">Customer</Label>
            <select
              id="customer-id"
              value={selectedCompanyId}
              onChange={(event) => setSelectedCompanyId(event.target.value)}
              className="h-10 w-full rounded-full border border-input bg-black/20 px-3 text-sm"
            >
              <option value="">Select customer</option>
              {results.map((customer) => (
                <option key={customer.company_id} value={customer.company_id}>
                  {customer.company_name} (ID {customer.company_id})
                </option>
              ))}
            </select>
            {selectedCustomer && (
              <div className="text-xs text-muted-foreground">
                {selectedCustomer.email ?? "No email"}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-date">Reminder Date</Label>
            <Input
              id="reminder-date"
              type="date"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
              className="bg-black/20 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-notes">Notes (optional)</Label>
            <Textarea
              id="reminder-notes"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className="bg-black/20 border-border/50"
            />
          </div>

          {error && <div className="text-sm text-red-300">{error}</div>}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="cursor-pointer">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Reminder"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
