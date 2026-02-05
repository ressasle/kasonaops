import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

interface ValidationItem {
  message: string;
  type: "error" | "warning";
}

interface ValidationBannerProps {
  items: ValidationItem[];
  className?: string;
}

export function ValidationBanner({ items, className = "" }: ValidationBannerProps) {
  const errors = items.filter((item) => item.type === "error");
  const warnings = items.filter((item) => item.type === "warning");

  if (items.length === 0) {
    return (
      <div className={`rounded-lg p-3 bg-green-500/10 border border-green-500/20 ${className}`}>
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Profil vollständig – bereit zur Aktivierung</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.length > 0 && (
        <div className="rounded-lg p-3 bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-sm font-medium text-destructive">
                {errors.length} Fehler beheben
              </span>
              <ul className="text-sm text-destructive/80 space-y-0.5">
                {errors.map((error, i) => (
                  <li key={i}>• {error.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-lg p-3 bg-yellow-500/10 border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-sm font-medium text-yellow-500">
                {warnings.length} Hinweise
              </span>
              <ul className="text-sm text-yellow-500/80 space-y-0.5">
                {warnings.map((warning, i) => (
                  <li key={i}>• {warning.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
