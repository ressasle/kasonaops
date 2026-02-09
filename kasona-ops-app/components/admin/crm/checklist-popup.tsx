"use client";

import { CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const CHECKLIST_ITEMS = [
  "Portfolio Uploaded",
  "Profile Created",
  "DNA Completed",
  "Handover Delivered"
];

export function ChecklistPopup() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer bg-white/5 hover:bg-white/10" aria-label="Open checklist info">
          <CircleHelp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel max-w-md">
        <DialogHeader>
          <DialogTitle>Fulfillment Checklist</DialogTitle>
          <DialogDescription>
            Verify these steps before marking a customer handover complete.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item} className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm">
              <input type="checkbox" className="h-4 w-4" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
