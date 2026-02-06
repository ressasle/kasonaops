import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <PageHeader />

      <Card className="p-6 space-y-4">
        <div className="text-sm font-semibold">Workspace Settings</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Default owner</Label>
            <Input placeholder="Jakob" />
          </div>
          <div className="space-y-2">
            <Label>Slack channel</Label>
            <Input placeholder="#ops" />
          </div>
          <div className="space-y-2">
            <Label>Missive integration</Label>
            <Input placeholder="Connected" />
          </div>
          <div className="space-y-2">
            <Label>Supabase project</Label>
            <Input placeholder="KASONA CRM" />
          </div>
        </div>
      </Card>
    </div>
  );
}
