import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (correction: string) => void;
}

export function FeedbackModal({ isOpen, onClose, onSubmit }: FeedbackModalProps) {
  const [correction, setCorrection] = useState('');

  const handleSubmit = () => {
    if (correction.trim()) {
      onSubmit(correction.trim());
      setCorrection('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-panel border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="text-accent" size={20} />
            Korrektur hinzufügen
          </DialogTitle>
          <DialogDescription>
            Helfen Sie dem System, besser zu werden. Ihre Korrektur wird für zukünftige Analysen gespeichert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
            <p className="text-xs font-mono text-accent mb-1">Beispiel:</p>
            <p className="text-sm text-muted-foreground italic">
              "Ich halte bereits 8%, nicht 5%. Außerdem bevorzuge ich bei Disney eher Nachkäufe unter 80€."
            </p>
          </div>

          <Textarea
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            placeholder="Korrektur: Das sehe ich anders, weil..."
            className="min-h-[120px] bg-input/50 border-border"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!correction.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Korrektur speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
