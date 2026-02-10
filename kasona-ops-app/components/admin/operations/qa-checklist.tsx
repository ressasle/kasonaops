"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ITEMS = ["Audio checked", "Show notes complete", "Links verified"];

export function QAChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="cursor-pointer">Open Checklist</Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-md">
        <DialogHeader>
          <DialogTitle>Podcast QA Checklist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {ITEMS.map((item) => (
            <label key={item} className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 transition-all duration-200 hover:bg-white/10">
              <input
                type="checkbox"
                className="h-4 w-4 cursor-pointer"
                checked={Boolean(checked[item])}
                onChange={(event) => setChecked((prev) => ({ ...prev, [item]: event.target.checked }))}
              />
              <span className="text-sm">{item}</span>
              {checked[item] && <CheckCircle2 className="ml-auto h-4 w-4 text-green-400" />}
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
