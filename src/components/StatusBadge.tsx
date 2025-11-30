import { CheckCircle } from "lucide-react";

export const StatusBadge = () => {
  return (
    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
      <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 flex-shrink-0" />
      <span className="hidden xs:inline">Salvo automaticamente</span>
      <span className="xs:hidden">Salvo</span>
    </div>
  );
};
