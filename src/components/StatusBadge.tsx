import { CheckCircle } from "lucide-react";

export const StatusBadge = () => {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
      <CheckCircle className="w-3 h-3 text-green-600" />
      <span>Salvo automaticamente</span>
    </div>
  );
};
