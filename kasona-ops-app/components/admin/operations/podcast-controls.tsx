"use client";

import { useState } from "react";
import { Eye, Loader2, Podcast } from "lucide-react";

import { Button } from "@/components/ui/button";

type PodcastControlsProps = {
  customerId: number | null;
  onGenerate?: () => Promise<void> | void;
  onReview?: () => void;
};

export function PodcastControls({ customerId, onGenerate, onReview }: PodcastControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!customerId) return;
    setIsGenerating(true);
    try {
      await onGenerate?.();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !customerId}
        className="gap-2"
      >
        {isGenerating ? <Loader2 className="animate-spin" /> : <Podcast />}
        Generate Podcast
      </Button>
      <Button variant="outline" onClick={onReview} disabled={!customerId}>
        <Eye className="h-4 w-4 mr-2" />
        Review
      </Button>
    </div>
  );
}
