# Quantum · Brand Handoff

Tudo que o Claude Code precisa para implementar a marca. Importe `tokens.css` no root da app e siga as regras abaixo.

---

## 1 · Conceito

**Quantum = a menor unidade indivisível de medida.** Cada grama, cada centavo, cada segundo. A marca opera como um instrumento de precisão, não como uma planilha. Tudo na UI deve reforçar isso: grade rígida, números mono alinhados, ausência de ornamento.

**Personalidade:** preciso, sistêmico, modular, sem ruído, operacional.

---

## 2 · Cores

| Token              | HEX        | Uso                                              |
|--------------------|------------|--------------------------------------------------|
| `--qtm-ink`        | `#0B0B0F`  | Texto, traços, superfícies escuras               |
| `--qtm-bone`       | `#F4EFE3`  | **Fundo principal** (não use branco puro)        |
| `--qtm-lime`       | `#D6FF3F`  | **Sinal** — ações primárias, KPIs positivos      |
| `--qtm-lime-dim`   | `#B8E520`  | Hover / pressed do lime                          |
| `--qtm-plasma`     | `#1A1B20`  | Dark surfaces                                    |
| `--qtm-rust`       | `#C44A2A`  | Alertas, valores negativos, erros                |
| `--qtm-receipt`    | `#EBE5D6`  | Superfície secundária                            |
| `--qtm-line`       | `#D9D2BF`  | Bordas                                           |
| `--qtm-mute`       | `#6B6A60`  | Texto secundário                                 |

**Proporção 60/30/10** → Bone (fundo) / Ink (texto + estrutura) / Lime (sinal).
**Quantum Lime nunca cobre blocos extensos de texto.** Use em badges, botões primários, KPIs.

---

## 3 · Tipografia

**Duas famílias, ambas Google Fonts (SIL OFL):**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

| Família             | Token                | Uso                                          |
|---------------------|----------------------|----------------------------------------------|
| **Space Grotesk**   | `--qtm-font-sans`    | Headlines, UI, body                          |
| **JetBrains Mono**  | `--qtm-font-mono`    | **Todo número** — preços, gramaturas, IDs, %, datas |

**Regra de ouro:** todo dado numérico exibido na UI usa `--qtm-font-mono` com `font-feature-settings: "tnum" on` (tabular nums) para alinhamento decimal correto em tabelas.

```css
.price, .weight, .percent, .id, time { font-family: var(--qtm-font-mono); font-variant-numeric: tabular-nums; }
```

### Escala
`72 → 48 → 32 → 24 → 18 → 16 → 14 → 11px`. Tracking negativo em títulos (`-0.03em` no display, `-0.02em` no h1/h2).

---

## 4 · Logo

Quatro arquivos SVG nesta pasta:

- `logo-mark.svg` — símbolo isolado (Q). **Uso principal em app icon, favicon, contextos onde "Quantum" já está presente.**
- `logo-horizontal.svg` — lockup horizontal. **Uso principal em headers, footers, materiais institucionais.**
- `logo-vertical.svg` — lockup vertical para espaços quadrados.
- `favicon.svg` / `app-icon.svg` — versões para favicon e ícone de app.

### ⚠️ Detalhe técnico crítico — `--qmark-bg`

O entalhe (notch) interno do Q usa `fill="var(--qmark-bg, #F4EFE3)"`. Isso permite que o entalhe seja **transparente visualmente** (assumir a cor do fundo) sem precisar editar o SVG.

**Sempre que colocar o logo em uma superfície que NÃO seja `#F4EFE3` (bone), defina `--qmark-bg` no contêiner pai:**

```css
.dark-card  { --qmark-bg: var(--qtm-ink); }     /* logo sobre ink */
.signal     { --qmark-bg: var(--qtm-lime); }    /* logo sobre lime */
.white-card { --qmark-bg: #fff; }               /* logo sobre branco puro */
```

### Cor do logo
Use `currentColor` — o logo herda a cor do contêiner.

```html
<!-- Logo ink sobre bone (default) -->
<div style="color: var(--qtm-ink)">
  <img src="/quantum-brand/logo-horizontal.svg" alt="Quantum" />
</div>

<!-- Logo bone sobre ink -->
<div style="color: var(--qtm-bone); background: var(--qtm-ink); --qmark-bg: var(--qtm-ink)">
  <img src="/quantum-brand/logo-horizontal.svg" alt="Quantum" />
</div>
```

> **Importante:** para `currentColor` e `--qmark-bg` funcionarem, embed o SVG inline (não via `<img>`) ou use a abordagem de objeto/máscara. **Para fidelidade máxima, prefira inline SVG em componentes React/Vue.**

### Tamanho mínimo
- Tela: **16px** (símbolo) / **96px** (lockup horizontal)
- Impresso: **8mm** (símbolo) / **40mm** (lockup horizontal)

### Área de proteção
Margem mínima ao redor do logo = **largura do quantum unit (1/3 do símbolo)**.

---

## 5 · Iconografia

- Grade **24×24**, live area **20×20** (padding 2u em todos os lados).
- Stroke **1.75px**, `stroke-linecap="square"`, `stroke-linejoin="miter"`.
- **Sem cantos arredondados.** Ângulos retos ou múltiplos de 15°.
- Fill sólido **apenas** para estados ativos / KPI positivo.
- Cor: `currentColor` (herda do contêiner).

Template:
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
  <!-- ... -->
</svg>
```

Set de ícones essenciais já desenhado no `Manual Quantum.html` (seção 05). Extraia de lá.

---

## 6 · Componentes — diretrizes rápidas

### Botões
- **Primário:** fundo `--qtm-lime`, texto `--qtm-ink`, 8px vertical / 16px horizontal, mono uppercase, `letter-spacing: 0.08em`.
- **Secundário:** fundo `--qtm-ink`, texto `--qtm-bone`.
- **Ghost:** fundo transparente, borda `--qtm-border-ink`.
- Cantos vivos (`border-radius: 0` — opcional `2px` em mobile).

### Cards
- Fundo `#fff` ou `--qtm-bone`, borda `--qtm-border` (NÃO use sombras).
- Padding `--qtm-space-8` (32px).
- Label técnico (uppercase mono) no topo-esquerdo, badge mono no topo-direito.

### Tabelas
- Header: mono uppercase 10–11px, `--qtm-mute`.
- Linhas com `border-bottom: 1px solid var(--qtm-line)`.
- Colunas numéricas: `text-align: right`, `font-family: var(--qtm-font-mono)`, `font-variant-numeric: tabular-nums`.

### Inputs
- Fundo `#fff` ou bone, borda `--qtm-border-ink`.
- Focus: borda `--qtm-lime`, sem glow/box-shadow.
- Label flutuante mono uppercase 11px.

### Badges de status
```
+ Saudável (margem > 30%):     bg lime,  text ink
± Atenção  (margem 10–30%):    bg bone,  text ink, border ink
− Revisar  (margem < 10%):     bg rust,  text bone
```

---

## 7 · Princípios de UI

1. **Cantos vivos.** `border-radius` máximo: 4px. Único componente arredondado: app icon (24%).
2. **Bordas, não sombras.** Profundidade vem de hierarquia tipográfica e cor, não de elevação fake.
3. **Mono para tudo que é número.** Sem exceção. Preço, peso, %, ID, data.
4. **Lime é sinal, não decoração.** Se aparece em mais de 10% da viewport, está errado.
5. **Sem ícones decorativos.** Cada ícone tem função semântica. Nada de "ilustração ✨".
6. **Sem hype.** Copy direto, com números. "Margem caiu 2,1pp" > "Sua performance precisa de atenção 📊".

---

## 8 · Arquivos nesta pasta

```
quantum-brand/
├── BRAND.md              ← este arquivo
├── tokens.css            ← importar no root da app
├── logo-mark.svg         ← símbolo Q isolado
├── logo-horizontal.svg   ← lockup principal
├── logo-vertical.svg     ← lockup quadrado
├── favicon.svg           ← favicon
└── app-icon.svg          ← ícone de app (1024×1024)
```

O manual visual completo (com construção, área de proteção, mocks, iconografia completa, packaging) está em `Manual Quantum.html`.

---

**v1.0 · maio 2026 · QTM-GUIDE-001**
