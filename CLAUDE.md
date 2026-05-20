# Quantum Frontend — CLAUDE.md

## Estado do Projeto

**Criado em:** 2026-05-20
**Última sessão:** 2026-05-20
**Status:** PRODUÇÃO — frontend rodando em https://quantumcalc.com.br

---

## O que foi feito

- [x] Estrutura completa do projeto criada (React + Vite + PWA)
- [x] Configuração de rotas (React Router)
- [x] Cliente Axios com interceptors JWT
- [x] Store Zustand (auth)
- [x] Páginas: Login, Dashboard
- [x] Páginas: Ingredientes (lista + formulário)
- [x] Páginas: Embalagens (lista + formulário)
- [x] Páginas: Receitas (lista + formulário)
- [x] Páginas: Produtos (lista + formulário)
- [x] Páginas: Precificação (canais + preços)
- [x] Páginas: Custos Fixos (lista + formulário)
- [x] Componentes base: Layout, BottomNav, Modal, FormField, LoadingSpinner, EmptyState
- [x] PWA manifest.json
- [x] Dockerfile (multi-stage: node build + nginx serve)
- [x] nginx.conf (SPA routing + gzip + cache estático)
- [x] Push inicial para GitHub
- [x] Deploy no EasyPanel via Dockerfile (build.type: dockerfile)
- [x] SSL via Let's Encrypt (válido até jul/2026)
- [x] **Redesign completo — Design System Quantum v1.0** (2026-05-20)
  - `tailwind.config.js`: paleta `ink/bone/lime/lime-dim/plasma/rust/receipt/line/mute` + fontes `sans/mono`
  - `index.html`: Space Grotesk + JetBrains Mono via Google Fonts, `theme-color: #0B0B0F`, favicon `/brand/favicon.svg`
  - `src/index.css`: classes `.btn-primary` (lime), `.btn-secondary` (ink), `.btn-ghost`, `.card` (receipt/line, sem shadow), `.input` (border-ink, focus lime), `.label` (mono 11px uppercase), `.qtm-num` (mono tabular-nums), `body` bone
  - Todos os componentes e páginas migrados (21 arquivos, 310 inserções / 210 remoções)
  - Deploy manual via API EasyPanel disparado e concluído (action `cmpeen77m004j07t5fgcm1qe0`, status: done)

---

## Stack

- **Framework:** React 18 + Vite
- **Roteamento:** React Router v6
- **Estado:** Zustand
- **HTTP:** Axios
- **Estilo:** TailwindCSS (mobile-first, 375px base) — paleta Quantum v1.0
- **Fontes:** Space Grotesk (UI) + JetBrains Mono (números) via Google Fonts
- **PWA:** vite-plugin-pwa
- **Deploy:** EasyPanel → https://quantumcalc.com.br

---

## Variáveis de Ambiente (EasyPanel)

```
VITE_API_URL=https://api.quantumcalc.com.br
```

---

## Estrutura de Páginas

```
/ → redirect para /dashboard (se autenticado) ou /login
/login
/dashboard
/ingredientes → lista
/ingredientes/novo → formulário
/ingredientes/:id → editar
/embalagens → lista
/embalagens/novo
/embalagens/:id
/receitas → lista
/receitas/novo
/receitas/:id
/produtos → lista
/produtos/novo
/produtos/:id
/precificacao → canais + seletor de produto
/custos-fixos → lista
```

---

## Componentes base

- `Layout` — header `bg-bone border-b border-line`, ícones `strokeLinecap="square"`
- `BottomNav` — `bg-ink border-t border-plasma`, tab ativo `text-lime`, labels mono uppercase
- `Modal` — `bg-bone rounded-none`, overlay `bg-ink/60`
- `FormField` — label via `.label`, erros `text-rust font-mono`
- `LoadingSpinner` — spinner `border-lime/30 border-t-lime`, texto mono uppercase
- `EmptyState` — borda `border-line`, ícone ink, título mono uppercase

---

## Design System — Quantum v1.0

> Implementado em 2026-05-20. Arquivo de referência em `public/brand/BRAND.md`.

### Conceito
Instrumento de precisão. Grade rígida, números mono alinhados, sem ornamento. **Preciso, sistêmico, modular, sem ruído.**

### Paleta Tailwind (tokens configurados em `tailwind.config.js`)

| Token Tailwind | HEX | Uso |
|---|---|---|
| `bone` | `#F4EFE3` | Fundo principal (60%) |
| `ink` | `#0B0B0F` | Texto, estrutura (30%) |
| `lime` | `#D6FF3F` | Sinal — CTAs, KPIs positivos (10%) |
| `lime-dim` | `#B8E520` | Hover/pressed do lime |
| `plasma` | `#1A1B20` | Dark surfaces (nav) |
| `rust` | `#C44A2A` | Erros, valores negativos |
| `receipt` | `#EBE5D6` | Superfície cards |
| `line` | `#D9D2BF` | Bordas, divisórias |
| `mute` | `#6B6A60` | Texto secundário, labels |

### Classes utilitárias (em `src/index.css`)

```css
.btn-primary   → bg-lime text-ink font-mono uppercase tracking-widest rounded-none
.btn-secondary → bg-ink text-bone font-mono uppercase tracking-widest rounded-none
.btn-ghost     → border border-ink text-ink bg-transparent rounded-none
.card          → bg-receipt border border-line rounded-none p-4  (SEM shadow)
.input         → bg-white border border-ink rounded-none focus:border-lime (sem ring)
.label         → font-mono text-[11px] uppercase tracking-widest text-mute mb-1
.page          → min-h-screen pb-24 px-4 pt-4 bg-bone
.qtm-num       → font-mono tabular-nums  (TODOS os números, sem exceção)
```

### Padrões de página (listas)

```jsx
// Botão "+ Novo" — inline, não full-width
<Link className="bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-none">

// Item da lista — row com divider (sem card individual)
<div className="flex items-center border-b border-line py-3 last:border-b-0">

// Botão delete
<button className="p-2 text-mute active:text-rust">

// Erro de formulário
<p className="text-xs font-mono text-rust">

// Botão inline de seção (adicionar, histórico)
<button className="font-mono text-xs uppercase tracking-widest text-ink border border-ink px-3 py-1">
```

### Badges de margem (Precificação)

```jsx
≥ 30% → bg-lime text-ink        "+" Saudável
10–29% → bg-bone border border-ink text-ink  "±" Atenção
< 10% → bg-rust text-bone       "−" Revisar
```

### Princípios inegociáveis
1. **Cantos vivos** — `border-radius: 0` em tudo (exceto app icon)
2. **Bordas, não sombras** — nunca `shadow-*` em cards/inputs
3. **Mono para número** — usar `.qtm-num` sem exceção
4. **Lime é sinal** — não decorativo, não repetitivo
5. **Ícones com strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.75}**

---

## Deploy EasyPanel

- **Build type:** `dockerfile` (usa o `Dockerfile` do repo — multi-stage node+nginx)
- **Env vars:** `VITE_API_URL=https://api.quantumcalc.com.br`
- **Domínio:** `quantumcalc.com.br` porta 80, HTTPS true
- **VITE_API_URL** é injetada como `ARG` no estágio de build do Dockerfile
- **autoDeploy:** desabilitado — deploy manual via API: `POST /api/trpc/services.app.deployService` com `{"json":{"projectName":"quantum","serviceName":"frontend"}}`

> **Atenção:** o serviço se chama `frontend` (não `quantum-frontend`) no EasyPanel.
> Se recriar do zero, usar build.type=dockerfile. nixpacks serviria os fontes em vez do dist/.

---

## Próximos passos

- [x] Configurar VITE_API_URL no EasyPanel
- [x] Testar fluxo completo login → cadastro → precificação (validado em 2026-05-20)
- [x] Implementar design system Quantum v1.0 (2026-05-20)
- [ ] Auditar bugs do fluxo completo (receita → produto → precificação) e anotar aqui
- [ ] Implementar upload de nota fiscal (OCR via IA)
- [ ] Adicionar gráficos de evolução de custos
- [ ] Adicionar relatório de margem por produto/canal
- [ ] Implementar modo offline (PWA cache — service worker já configurado no vite.config.js)
- [ ] Habilitar autoDeploy no EasyPanel (atualmente false)
