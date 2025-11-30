import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SignatureDialog } from "./SignatureDialog";
import { Plus, FileDown, Trash2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export interface FuelEntry {
  id: string;
  data: string;
  hora: string;
  descricao: string;
  regFab: string;
  hodometro: string;
  unidadeOuSecao: string;
  qtdLitros: string;
  postoNome: string;
  rubrica: string;
  saram: string;
  numeroOrdem: string;
  bico: string;
  abastecedor: string;
}

export const FuelSupplySheet = () => {
  const [entries, setEntries] = useState<FuelEntry[]>([
    {
      id: "1",
      data: "",
      hora: "",
      descricao: "",
      regFab: "",
      hodometro: "",
      unidadeOuSecao: "",
      qtdLitros: "",
      postoNome: "",
      rubrica: "",
      saram: "",
      numeroOrdem: "",
      bico: "",
      abastecedor: "",
    },
  ]);

  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelAssinatura, setResponsavelAssinatura] = useState("");
  const [responsavelSaram, setResponsavelSaram] = useState("");
  const [currentSignatureField, setCurrentSignatureField] = useState<{
    entryId: string;
    type: "rubrica" | "responsavel";
  } | null>(null);

  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now().toString(),
        data: "",
        hora: "",
        descricao: "",
        regFab: "",
        hodometro: "",
        unidadeOuSecao: "",
        qtdLitros: "",
        postoNome: "",
        rubrica: "",
        saram: "",
        numeroOrdem: "",
        bico: "",
        abastecedor: "",
      },
    ]);
  };

  const deleteEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof FuelEntry, value: string) => {
    setEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const handleSignatureSave = (signature: string) => {
    if (!currentSignatureField) return;

    if (currentSignatureField.type === "rubrica") {
      updateEntry(currentSignatureField.entryId, "rubrica", signature);
    } else {
      setResponsavelAssinatura(signature);
    }
    setCurrentSignatureField(null);
  };

  const calculateTotal = () => {
    return entries
      .reduce((sum, entry) => sum + (parseFloat(entry.qtdLitros) || 0), 0)
      .toFixed(2);
  };

  const generatePDF = async () => {
    const element = document.getElementById("fuel-sheet-pdf");
    if (!element) return;

    toast.loading("Gerando PDF...");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const fileName = `Folha_Abastecimento_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);

      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Folha de Abastecimento
            </h1>
            <p className="text-muted-foreground mt-1">
              Controle digital de combustível
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addEntry} className="gap-2">
              <Plus className="w-4 h-4" />
              Nova Linha
            </Button>
            <Button onClick={generatePDF} variant="secondary" className="gap-2">
              <FileDown className="w-4 h-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div id="fuel-sheet-pdf" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                TIPO DE COMBUSTÍVEL:
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-table-header text-primary-foreground">
                    <th className="border border-table-border p-2 text-center min-w-[80px]">
                      DATA
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[60px]">
                      HORA
                    </th>
                    <th
                      className="border border-table-border p-2 text-center"
                      colSpan={4}
                    >
                      VIATURA
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[80px]">
                      QTD. LITROS
                    </th>
                    <th
                      className="border border-table-border p-2 text-center"
                      colSpan={3}
                    >
                      MOTORISTA
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[100px]">
                      Nº DE ORDEM DE SERVIÇO
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[60px]">
                      BICO
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[100px]">
                      ABASTECEDOR
                    </th>
                    <th className="border border-table-border p-2 text-center min-w-[60px]">
                      Ações
                    </th>
                  </tr>
                  <tr className="bg-table-header text-primary-foreground">
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      DESCRIÇÃO
                    </th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      REG. FAB
                    </th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      HODÔMETRO
                    </th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      UNIDADE OU SEÇÃO
                    </th>
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      POSTO-NOME
                    </th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      RUBRICA
                    </th>
                    <th className="border border-table-border p-2 text-center text-xs">
                      SARAM
                    </th>
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2"></th>
                    <th className="border border-table-border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={
                        index % 2 === 0 ? "bg-background" : "bg-table-row-even"
                      }
                    >
                      <td className="border border-table-border p-1">
                        <Input
                          type="date"
                          value={entry.data}
                          onChange={(e) =>
                            updateEntry(entry.id, "data", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          type="time"
                          value={entry.hora}
                          onChange={(e) =>
                            updateEntry(entry.id, "hora", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.descricao}
                          onChange={(e) =>
                            updateEntry(entry.id, "descricao", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.regFab}
                          onChange={(e) =>
                            updateEntry(entry.id, "regFab", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.hodometro}
                          onChange={(e) =>
                            updateEntry(entry.id, "hodometro", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.unidadeOuSecao}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "unidadeOuSecao",
                              e.target.value
                            )
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.qtdLitros}
                          onChange={(e) =>
                            updateEntry(entry.id, "qtdLitros", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.postoNome}
                          onChange={(e) =>
                            updateEntry(entry.id, "postoNome", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Button
                          onClick={() =>
                            setCurrentSignatureField({
                              entryId: entry.id,
                              type: "rubrica",
                            })
                          }
                          variant={entry.rubrica ? "secondary" : "outline"}
                          size="sm"
                          className="w-full h-8 text-xs"
                        >
                          {entry.rubrica ? "✓ Assinado" : "Assinar"}
                        </Button>
                        {entry.rubrica && (
                          <img
                            src={entry.rubrica}
                            alt="Rubrica"
                            className="w-full h-16 object-contain mt-1 hidden print:block"
                          />
                        )}
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.saram}
                          onChange={(e) =>
                            updateEntry(entry.id, "saram", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.numeroOrdem}
                          onChange={(e) =>
                            updateEntry(entry.id, "numeroOrdem", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.bico}
                          onChange={(e) =>
                            updateEntry(entry.id, "bico", e.target.value)
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Input
                          value={entry.abastecedor}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "abastecedor",
                              e.target.value
                            )
                          }
                          className="border-0 h-8 text-xs"
                        />
                      </td>
                      <td className="border border-table-border p-1">
                        <Button
                          onClick={() => deleteEntry(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-xs hover:bg-destructive/10 hover:text-destructive"
                          disabled={entries.length === 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="border border-table-border p-4 rounded">
                <p className="font-semibold text-foreground mb-2">
                  TOTAL ABASTECIDO:
                </p>
                <p className="text-2xl font-bold text-primary">
                  {calculateTotal()} L
                </p>
              </div>

              <div className="border border-table-border p-4 rounded space-y-3">
                <p className="font-semibold text-foreground">
                  RESPONSÁVEL - NOME E ASSINATURA
                </p>
                <Input
                  placeholder="Nome do responsável"
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="mb-2"
                />
                <Button
                  onClick={() =>
                    setCurrentSignatureField({
                      entryId: "responsavel",
                      type: "responsavel",
                    })
                  }
                  variant={responsavelAssinatura ? "secondary" : "outline"}
                  className="w-full"
                >
                  {responsavelAssinatura ? "✓ Assinado" : "Assinar"}
                </Button>
                {responsavelAssinatura && (
                  <img
                    src={responsavelAssinatura}
                    alt="Assinatura Responsável"
                    className="w-full h-24 object-contain border border-table-border rounded mt-2"
                  />
                )}
                <div className="mt-3">
                  <label className="text-sm font-medium text-foreground">
                    SARAM:
                  </label>
                  <Input
                    placeholder="SARAM do responsável"
                    value={responsavelSaram}
                    onChange={(e) => setResponsavelSaram(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <SignatureDialog
        open={currentSignatureField !== null}
        onClose={() => setCurrentSignatureField(null)}
        onSave={handleSignatureSave}
      />
    </div>
  );
};
