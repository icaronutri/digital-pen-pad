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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assinar com o dedo</DialogTitle>
        </DialogHeader>
        <div className="border-2 border-border rounded-lg bg-card overflow-hidden">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: "w-full h-64 touch-none",
              style: { touchAction: "none" },
            }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
          />
        </div>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button onClick={handleClear} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Limpar
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" />
            Salvar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
