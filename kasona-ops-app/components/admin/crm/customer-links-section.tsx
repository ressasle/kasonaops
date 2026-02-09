"use client";

import { useState } from "react";
import { ExternalLink, Folder, Link2, Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CustomerLink } from "@/lib/data/types";

type CustomerLinksSectionProps = {
  companyId: number;
  initialLinks: CustomerLink[];
  onUpdated?: () => void;
};

type LinkFormState = {
  title: string;
  url: string;
  link_type: "folder" | "document" | "website" | "other";
};

const EMPTY_STATE: LinkFormState = {
  title: "",
  url: "",
  link_type: "website",
};

const typeLabel = (value: CustomerLink["link_type"]) => value ?? "other";

export function CustomerLinksSection({ companyId, initialLinks, onUpdated }: CustomerLinksSectionProps) {
  const [links, setLinks] = useState<CustomerLink[]>(initialLinks);
  const [form, setForm] = useState<LinkFormState>(EMPTY_STATE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof LinkFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      setError("Title and URL are required.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/customer-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_id: companyId,
          title: form.title.trim(),
          url: form.url.trim(),
          link_type: form.link_type,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to create link");
      }

      const data = (await response.json()) as { data: CustomerLink };
      setLinks((prev) => [data.data, ...prev]);
      setForm(EMPTY_STATE);
      onUpdated?.();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create link");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this customer link?");
    if (!confirmed) return;

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/customer-links/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Unable to delete link");
      }

      setLinks((prev) => prev.filter((link) => link.id !== id));
      onUpdated?.();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete link");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card id="customer-links" className="p-6 scroll-mt-28">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Customer Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <Label>Title</Label>
            <Input value={form.title} onChange={(event) => handleChange("title", event.target.value)} placeholder="e.g. Drive Folder" />
          </div>
          <div className="md:col-span-2">
            <Label>URL</Label>
            <Input value={form.url} onChange={(event) => handleChange("url", event.target.value)} placeholder="https://..." />
          </div>
          <div>
            <Label>Type</Label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.link_type}
              onChange={(event) => handleChange("link_type", event.target.value)}
            >
              <option value="website">Website</option>
              <option value="document">Document</option>
              <option value="folder">Folder</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button onClick={handleCreate} disabled={isSaving} className="gap-2 cursor-pointer">
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            Add Link
          </Button>
          {error && <div className="text-sm text-red-300">{error}</div>}
        </div>

        <div className="space-y-2">
          {links.length === 0 && <div className="text-sm text-muted-foreground">No customer links added yet.</div>}
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">{link.title}</span>
                  <Badge variant="outline" className="text-[10px] uppercase">{typeLabel(link.link_type)}</Badge>
                </div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                >
                  {link.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(link.id)} className="cursor-pointer">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
