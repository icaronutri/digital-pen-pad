import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RotateCcw, Check } from "lucide-react";

interface SignatureDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export const SignatureDialog = ({
  open,
  onClose,
  onSave,
}: SignatureDialogProps) => {
  const signatureRef = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (open && signatureRef.current) {
      signatureRef.current.clear();
    }
  }, [open]);

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleSave = () => {
    if (signatureRef.current) {
      const signature = signatureRef.current.toDataURL();
      onSave(signature);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Assinar com o dedo</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Desenhe sua assinatura na área abaixo
          </p>
        </DialogHeader>
        <div className="border-2 border-border rounded-lg bg-white overflow-hidden shadow-inner">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: "w-full h-48 sm:h-64 touch-none",
              style: { touchAction: "none" },
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
          />
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button onClick={handleClear} variant="outline" className="gap-2 w-full sm:w-auto">
            <RotateCcw className="w-4 h-4" />
            Limpar
          </Button>
          <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
            <Check className="w-4 h-4" />
            Salvar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
