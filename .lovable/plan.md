
## Objetivo

Corrigir o bloco "RESPONSÁVEL – NOME E ASSINATURA" no rodapé da folha de abastecimento para que a imagem da assinatura fique **centralizada acima da linha**, dentro de uma área controlada, sem invadir a lateral direita nem "vazar" do bloco — tanto na tela quanto no PDF gerado.

Mantém intacta a assinatura da **Rubrica** dentro da tabela (já está aceitável) e toda a lógica existente (localStorage, tabs por combustível, histórico de PDFs, autorizações).

---

## Problema identificado

No arquivo `src/components/FuelSupplySheet.tsx` (linhas ~819–827) a imagem da assinatura do responsável está renderizada assim:

```tsx
{responsavelAssinatura && (
  <div className="absolute mt-[-55px] w-[calc(100%-2rem)]">
    <img src={responsavelAssinatura} ... className="w-full h-12 object-contain" />
  </div>
)}
```

Os problemas:
- `position: absolute` sem `relative` no pai → a imagem se ancora em um ancestral inesperado e aparece deslocada para a direita / fora do bloco.
- `mt-[-55px]` é um hack frágil que quebra com qualquer mudança de altura.
- `w-[calc(100%-2rem)]` causa offset lateral.
- O `html2canvas` captura a posição incorreta no PDF.

---

## Mudanças

### 1. Reestruturar o bloco do RESPONSÁVEL (rodapé)

Substituir o bloco atual por uma estrutura simples, com a assinatura **dentro de uma área fixa centralizada acima da linha**, sem `position: absolute`:

```text
┌─────────────────────────────────────────────┐
│ RESPONSÁVEL – NOME E ASSINATURA             │
│                                             │
│        [ assinatura centralizada ]          │  ← área fixa 100% x 60px, overflow hidden
│ ─────────────────────────────────────────── │  ← linha de assinatura
│   Nome do responsável                       │
│                                             │
│ SARAM                                       │
│ ─────────────────────────────────────────── │
│   12345                                     │
└─────────────────────────────────────────────┘
```

Estrutura JSX proposta (substitui as ~linhas 794–839):

- Container do bloco com `relative` e largura 100%.
- Área da assinatura: `<div>` com `width: 100%`, `height: 60px`, `overflow: hidden`, `display: flex`, `justify-content: center`, `align-items: end`.
- `<img>` com `object-fit: contain`, `max-width: 100%`, `max-height: 60px`, `display: block`, `margin: 0 auto`.
- Linha de assinatura (border-bottom) logo abaixo da área da imagem.
- Input do nome posicionado abaixo da linha (não sobreposto).
- Bloco do SARAM mantido logo abaixo, na mesma coluna.
- Botão "Assinar" mantido com `print:hidden`.

### 2. Garantir captura correta no PDF (html2canvas)

- Remover `position: absolute` da assinatura para que o html2canvas capture o layout em fluxo normal.
- Ajustar a chamada de `generatePDF` para usar as dimensões reais do elemento (já usa `scrollWidth/scrollHeight`); adicionar `windowWidth` igual a `element.offsetWidth` e garantir que o container `#fuel-sheet-pdf` não tenha barras de rolagem horizontais durante a captura (ex.: temporariamente aplicar `overflow: visible` no wrapper antes de capturar e restaurar depois).

### 3. Melhorias gerais (escopo limitado, sem quebrar layout)

- Adicionar `word-break: break-word` e `white-space: normal` nos `<Input>` da tabela via classe utilitária (evita estouro horizontal de textos longos).
- Garantir `min-w-[1200px]` na tabela apenas dentro do `overflow-x-auto` (já existe) — sem mudanças de colunas.
- Em telas pequenas, manter o scroll horizontal já existente (não quebrar o layout da folha).
- O botão "Gerar PDF" continuará gerando a partir do `#fuel-sheet-pdf`, mas com um pequeno ajuste para clonar o nó ou aplicar estilo temporário, evitando capturar a barra de rolagem.

### 4. O que NÃO muda

- Assinatura da **Rubrica** dentro da tabela: permanece exatamente como está.
- Tabs por tipo de combustível, autorizações, histórico de PDFs.
- Persistência em `localStorage`.
- Fluxo do `SignatureDialog`.
- Sem backend, sem login, sem banco de dados.

---

## Arquivos afetados

- `src/components/FuelSupplySheet.tsx`
  - Reescrita do bloco do RESPONSÁVEL (~linhas 794–839).
  - Pequeno ajuste em `generatePDF` para overflow temporário do wrapper.
- `src/index.css` (opcional)
  - Adicionar utilitário `.signature-area` se for útil para reuso e impressão (`overflow: hidden`, dimensões fixas, centralização).

---

## Critério de aceite

- Na tela: a assinatura do responsável aparece **centralizada horizontalmente** dentro do bloco RESPONSÁVEL, **logo acima da linha de assinatura**, sem ultrapassar a borda direita.
- No PDF gerado: a assinatura aparece exatamente na mesma posição visual da tela, dentro do campo correto.
- A rubrica da tabela continua funcionando igual.
- Nenhuma funcionalidade existente é removida.
