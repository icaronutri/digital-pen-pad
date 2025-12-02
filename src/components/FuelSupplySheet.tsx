import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignatureDialog } from "./SignatureDialog";
import { StatusBadge } from "./StatusBadge";
import { Plus, FileDown, Trash2, FileText, History } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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

interface SavedPDF {
  id: string;
  name: string;
  date: string;
  tipoCombustivel: string;
  blob: string;
}

interface Authorization {
  id: string;
  descricao: string;
  data: string;
  unidade: string;
}

export const FuelSupplySheet = () => {
  const [activeTab, setActiveTab] = useState("GASOLINA");
  const [viewMode, setViewMode] = useState<"form" | "history">("form");
  
  // Separate entries for each fuel type
  const [gasolinaEntries, setGasolinaEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries_GASOLINA");
    return saved ? JSON.parse(saved) : [createEmptyEntry()];
  });

  const [dieselEntries, setDieselEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries_DIESEL");
    return saved ? JSON.parse(saved) : [createEmptyEntry()];
  });

  const [dieselS10Entries, setDieselS10Entries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries_DIESEL_S10");
    return saved ? JSON.parse(saved) : [createEmptyEntry()];
  });

  const [etanolEntries, setEtanolEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries_ETANOL");
    return saved ? JSON.parse(saved) : [createEmptyEntry()];
  });

  const [gnvEntries, setGnvEntries] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem("fuelEntries_GNV");
    return saved ? JSON.parse(saved) : [createEmptyEntry()];
  });

  const [authorizations, setAuthorizations] = useState<Authorization[]>(() => {
    const saved = localStorage.getItem("authorizations");
    return saved ? JSON.parse(saved) : [];
  });

  const [savedPDFs, setSavedPDFs] = useState<SavedPDF[]>(() => {
    const saved = localStorage.getItem("savedPDFs");
    return saved ? JSON.parse(saved) : [];
  });

  const [responsavelNome, setResponsavelNome] = useState(() => 
    localStorage.getItem("responsavelNome") || ""
  );
  const [responsavelAssinatura, setResponsavelAssinatura] = useState(() => 
    localStorage.getItem("responsavelAssinatura") || ""
  );
  const [responsavelSaram, setResponsavelSaram] = useState(() => 
    localStorage.getItem("responsavelSaram") || ""
  );
  const [currentSignatureField, setCurrentSignatureField] = useState<{
    entryId: string;
    type: "rubrica" | "responsavel";
  } | null>(null);

  function createEmptyEntry(): FuelEntry {
    return {
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
    };
  }

  const getCurrentEntries = () => {
    switch (activeTab) {
      case "GASOLINA": return gasolinaEntries;
      case "DIESEL": return dieselEntries;
      case "DIESEL_S10": return dieselS10Entries;
      case "ETANOL": return etanolEntries;
      case "GNV": return gnvEntries;
      case "AUTORIZACOES": return [];
      default: return gasolinaEntries;
    }
  };

  const setCurrentEntries = (entries: FuelEntry[]) => {
    switch (activeTab) {
      case "GASOLINA": setGasolinaEntries(entries); break;
      case "DIESEL": setDieselEntries(entries); break;
      case "DIESEL_S10": setDieselS10Entries(entries); break;
      case "ETANOL": setEtanolEntries(entries); break;
      case "GNV": setGnvEntries(entries); break;
    }
  };

  const entries = getCurrentEntries();

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("fuelEntries_GASOLINA", JSON.stringify(gasolinaEntries));
  }, [gasolinaEntries]);

  useEffect(() => {
    localStorage.setItem("fuelEntries_DIESEL", JSON.stringify(dieselEntries));
  }, [dieselEntries]);

  useEffect(() => {
    localStorage.setItem("fuelEntries_DIESEL_S10", JSON.stringify(dieselS10Entries));
  }, [dieselS10Entries]);

  useEffect(() => {
    localStorage.setItem("fuelEntries_ETANOL", JSON.stringify(etanolEntries));
  }, [etanolEntries]);

  useEffect(() => {
    localStorage.setItem("fuelEntries_GNV", JSON.stringify(gnvEntries));
  }, [gnvEntries]);

  useEffect(() => {
    localStorage.setItem("authorizations", JSON.stringify(authorizations));
  }, [authorizations]);

  useEffect(() => {
    localStorage.setItem("savedPDFs", JSON.stringify(savedPDFs));
  }, [savedPDFs]);

  useEffect(() => {
    localStorage.setItem("responsavelNome", responsavelNome);
  }, [responsavelNome]);

  useEffect(() => {
    localStorage.setItem("responsavelAssinatura", responsavelAssinatura);
  }, [responsavelAssinatura]);

  useEffect(() => {
    localStorage.setItem("responsavelSaram", responsavelSaram);
  }, [responsavelSaram]);

  const addEntry = () => {
    setCurrentEntries([...entries, createEmptyEntry()]);
  };

  const addAuthorization = () => {
    setAuthorizations([
      ...authorizations,
      {
        id: Date.now().toString(),
        descricao: "",
        data: "",
        unidade: "",
      },
    ]);
  };

  const deleteEntry = (id: string) => {
    if (entries.length > 1) {
      setCurrentEntries(entries.filter((entry) => entry.id !== id));
    }
  };

  const updateEntry = (id: string, field: keyof FuelEntry, value: string) => {
    setCurrentEntries(
      entries.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const deleteAuthorization = (id: string) => {
    setAuthorizations(authorizations.filter((auth) => auth.id !== id));
  };

  const updateAuthorization = (id: string, field: keyof Authorization, value: string) => {
    setAuthorizations(
      authorizations.map((auth) =>
        auth.id === id ? { ...auth, [field]: value } : auth
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

  const generatePDF = async (isAuthorization = false) => {
    const elementId = isAuthorization ? "authorization-sheet-pdf" : "fuel-sheet-pdf";
    const element = document.getElementById(elementId);
    if (!element) return;

    // Validação básica
    if (!isAuthorization) {
      const hasData = entries.some(entry => 
        entry.data || entry.qtdLitros || entry.postoNome
      );
      
      if (!hasData) {
        toast.error("Preencha pelo menos uma linha antes de gerar o PDF");
        return;
      }

      if (!responsavelNome || !responsavelAssinatura) {
        toast.error("Nome e assinatura do responsável são obrigatórios");
        return;
      }
    }

    toast.loading("Gerando PDF...", { id: "pdf-gen" });

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
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
      const imgY = 5;

      pdf.addImage(
        imgData,
        "PNG",
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      const tipoCombustivelLabel = isAuthorization ? "AUTORIZACOES" : activeTab.replace("_", "-");
      const fileName = `Folha_Abastecimento_${tipoCombustivelLabel}_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
      
      // Salvar PDF no histórico
      const pdfBlob = pdf.output("blob");
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newPDF: SavedPDF = {
          id: Date.now().toString(),
          name: fileName,
          date: new Date().toLocaleString("pt-BR"),
          tipoCombustivel: tipoCombustivelLabel,
          blob: base64data,
        };
        setSavedPDFs([newPDF, ...savedPDFs]);
      };
      
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Abrir em nova aba
      window.open(pdfUrl, "_blank");
      
      // Também fazer download
      pdf.save(fileName);

      toast.success("PDF gerado e aberto com sucesso!", { id: "pdf-gen" });
    } catch (error) {
      toast.error("Erro ao gerar PDF", { id: "pdf-gen" });
      console.error(error);
    }
  };

  const openSavedPDF = (pdf: SavedPDF) => {
    const blob = dataURItoBlob(pdf.blob);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const deleteSavedPDF = (id: string) => {
    setSavedPDFs(savedPDFs.filter(pdf => pdf.id !== id));
    toast.success("PDF removido do histórico");
  };

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Folha de Abastecimento
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
              <p className="text-muted-foreground text-xs sm:text-sm">
                Controle digital de combustível
              </p>
              <StatusBadge />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setViewMode(viewMode === "form" ? "history" : "form")} 
              variant="outline" 
              className="gap-2" 
              size="sm"
            >
              {viewMode === "form" ? (
                <>
                  <History className="w-4 h-4" />
                  <span>Histórico</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Formulário</span>
                </>
              )}
            </Button>
            <Button 
              onClick={() => {
                if (confirm("Deseja limpar todos os dados?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }} 
              variant="outline" 
              className="gap-2" 
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Tudo</span>
            </Button>
          </div>
        </div>

        {viewMode === "history" ? (
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Histórico de PDFs</h2>
            {savedPDFs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum PDF salvo ainda</p>
            ) : (
              <div className="space-y-2">
                {savedPDFs.map((pdf) => (
                  <div key={pdf.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{pdf.name}</p>
                      <p className="text-xs text-muted-foreground">{pdf.date} • {pdf.tipoCombustivel}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => openSavedPDF(pdf)} variant="secondary" size="sm">
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => deleteSavedPDF(pdf.id)} variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-3 sm:p-4 md:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6 mb-4">
                <TabsTrigger value="GASOLINA">Gasolina</TabsTrigger>
                <TabsTrigger value="DIESEL">Diesel</TabsTrigger>
                <TabsTrigger value="DIESEL_S10">Diesel S-10</TabsTrigger>
                <TabsTrigger value="ETANOL">Etanol</TabsTrigger>
                <TabsTrigger value="GNV">GNV</TabsTrigger>
                <TabsTrigger value="AUTORIZACOES">Autorizações</TabsTrigger>
              </TabsList>

              <TabsContent value="AUTORIZACOES">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Autorizações de Abastecimento de Outras Unidades</h3>
                    <div className="flex gap-2">
                      <Button onClick={addAuthorization} className="gap-2" size="sm">
                        <Plus className="w-4 h-4" />
                        Nova Autorização
                      </Button>
                      <Button onClick={() => generatePDF(true)} variant="secondary" className="gap-2" size="sm">
                        <FileDown className="w-4 h-4" />
                        Gerar PDF
                      </Button>
                    </div>
                  </div>

                  <div id="authorization-sheet-pdf" className="space-y-4">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold">AUTORIZAÇÕES DE ABASTECIMENTO</h2>
                    </div>
                    {authorizations.map((auth) => (
                      <Card key={auth.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="text-sm font-medium">Data</label>
                            <Input
                              type="date"
                              value={auth.data}
                              onChange={(e) => updateAuthorization(auth.id, "data", e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-sm font-medium">Unidade</label>
                            <Input
                              placeholder="Nome da unidade solicitante"
                              value={auth.unidade}
                              onChange={(e) => updateAuthorization(auth.id, "unidade", e.target.value)}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Descrição da Autorização</label>
                          <Textarea
                            placeholder="Descreva os detalhes da autorização..."
                            value={auth.descricao}
                            onChange={(e) => updateAuthorization(auth.id, "descricao", e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button
                          onClick={() => deleteAuthorization(auth.id)}
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </Card>
                    ))}
                    {authorizations.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma autorização cadastrada
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {["GASOLINA", "DIESEL", "DIESEL_S10", "ETANOL", "GNV"].map((fuelType) => (
                <TabsContent key={fuelType} value={fuelType}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div></div>
                      <div className="flex gap-2">
                        <Button onClick={addEntry} className="gap-2" size="sm">
                          <Plus className="w-4 h-4" />
                          Nova Linha
                        </Button>
                        <Button onClick={() => generatePDF(false)} variant="secondary" className="gap-2" size="sm">
                          <FileDown className="w-4 h-4" />
                          Gerar PDF
                        </Button>
                      </div>
                    </div>

                    <div id="fuel-sheet-pdf" className="space-y-4 md:space-y-6">
                      <div className="text-center mb-4 md:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                          TIPO DE COMBUSTÍVEL: {fuelType.replace("_", " ")}
                        </h2>
                      </div>

            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4 md:px-6">
                <table className="w-full border-collapse text-[10px] sm:text-xs md:text-sm min-w-[1200px]">
                <thead>
                  <tr className="bg-table-header text-primary-foreground">
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[70px] sm:min-w-[80px]">
                      DATA
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[55px] sm:min-w-[60px]">
                      HORA
                    </th>
                    <th
                      className="border border-table-border p-1 sm:p-2 text-center"
                      colSpan={4}
                    >
                      VIATURA
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[70px] sm:min-w-[80px]">
                      QTD. LITROS
                    </th>
                    <th
                      className="border border-table-border p-1 sm:p-2 text-center"
                      colSpan={3}
                    >
                      MOTORISTA
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[80px] sm:min-w-[100px]">
                      Nº DE ORDEM
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[50px] sm:min-w-[60px]">
                      BICO
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[90px] sm:min-w-[100px]">
                      ABASTECEDOR
                    </th>
                    <th className="border border-table-border p-1 sm:p-2 text-center min-w-[55px] sm:min-w-[60px]">
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
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          type="date"
                          value={entry.data}
                          onChange={(e) =>
                            updateEntry(entry.id, "data", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          type="time"
                          value={entry.hora}
                          onChange={(e) =>
                            updateEntry(entry.id, "hora", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.descricao}
                          onChange={(e) =>
                            updateEntry(entry.id, "descricao", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.regFab}
                          onChange={(e) =>
                            updateEntry(entry.id, "regFab", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.hodometro}
                          onChange={(e) =>
                            updateEntry(entry.id, "hodometro", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.unidadeOuSecao}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "unidadeOuSecao",
                              e.target.value
                            )
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.qtdLitros}
                          onChange={(e) =>
                            updateEntry(entry.id, "qtdLitros", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.postoNome}
                          onChange={(e) =>
                            updateEntry(entry.id, "postoNome", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Button
                          onClick={() =>
                            setCurrentSignatureField({
                              entryId: entry.id,
                              type: "rubrica",
                            })
                          }
                          variant={entry.rubrica ? "secondary" : "outline"}
                          size="sm"
                          className="w-full h-7 sm:h-8 text-[9px] sm:text-xs px-1"
                        >
                          {entry.rubrica ? "✓" : "Assinar"}
                        </Button>
                        {entry.rubrica && (
                          <div className="mt-0.5 border border-table-border rounded p-0.5 bg-background">
                            <img
                              src={entry.rubrica}
                              alt="Rubrica"
                              className="w-full h-10 sm:h-12 object-contain"
                            />
                          </div>
                        )}
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.saram}
                          onChange={(e) =>
                            updateEntry(entry.id, "saram", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.numeroOrdem}
                          onChange={(e) =>
                            updateEntry(entry.id, "numeroOrdem", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.bico}
                          onChange={(e) =>
                            updateEntry(entry.id, "bico", e.target.value)
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Input
                          value={entry.abastecedor}
                          onChange={(e) =>
                            updateEntry(
                              entry.id,
                              "abastecedor",
                              e.target.value
                            )
                          }
                          className="border-0 h-7 sm:h-8 text-[10px] sm:text-xs px-1 sm:px-2"
                        />
                      </td>
                      <td className="border border-table-border p-0.5 sm:p-1">
                        <Button
                          onClick={() => deleteEntry(entry.id)}
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 sm:h-8 text-[10px] sm:text-xs hover:bg-destructive/10 hover:text-destructive px-1"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="border border-table-border p-3 sm:p-4 rounded">
                <p className="font-semibold text-foreground mb-2 text-sm sm:text-base">
                  TOTAL ABASTECIDO:
                </p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {calculateTotal()} L
                </p>
              </div>

              <div className="border border-table-border p-3 sm:p-4 rounded space-y-3">
                <p className="font-semibold text-foreground text-sm sm:text-base">
                  RESPONSÁVEL - NOME E ASSINATURA
                </p>
                <Input
                  placeholder="Nome do responsável"
                  value={responsavelNome}
                  onChange={(e) => setResponsavelNome(e.target.value)}
                  className="mb-2 text-sm"
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
                  size="sm"
                >
                  {responsavelAssinatura ? "✓ Assinado" : "Assinar"}
                </Button>
                {responsavelAssinatura && (
                  <img
                    src={responsavelAssinatura}
                    alt="Assinatura Responsável"
                    className="w-full h-20 sm:h-24 object-contain border border-table-border rounded mt-2"
                  />
                )}
                <div className="mt-3">
                  <label className="text-xs sm:text-sm font-medium text-foreground">
                    SARAM:
                  </label>
                  <Input
                    placeholder="SARAM do responsável"
                    value={responsavelSaram}
                    onChange={(e) => setResponsavelSaram(e.target.value)}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>
            </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </Card>
        )}
      </div>

      <SignatureDialog
        open={currentSignatureField !== null}
        onClose={() => setCurrentSignatureField(null)}
        onSave={handleSignatureSave}
      />
    </div>
  );
};
