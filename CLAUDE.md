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
- [x] Componentes base: Layout, BottomNav, Modal, FormField
- [x] PWA manifest.json
- [x] Dockerfile (multi-stage: node build + nginx serve)
- [x] nginx.conf (SPA routing + gzip + cache estático)
- [x] Push inicial para GitHub
- [x] Deploy no EasyPanel via Dockerfile (build.type: dockerfile)
- [x] SSL via Let's Encrypt (válido até jul/2026)

---

## Stack

- **Framework:** React 18 + Vite
- **Roteamento:** React Router v6
- **Estado:** Zustand
- **HTTP:** Axios
- **Estilo:** TailwindCSS (mobile-first, 375px base)
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

- `Layout` — wrapper com header + bottom nav
- `BottomNav` — navegação inferior mobile (5 tabs)
- `Modal` — dialog reutilizável
- `FormField` — label + input/select + error
- `LoadingSpinner` — loading state

---

## Deploy EasyPanel

- **Build type:** `dockerfile` (usa o `Dockerfile` do repo — multi-stage node+nginx)
- **Env vars:** `VITE_API_URL=https://api.quantumcalc.com.br` (+ vars NIXPACKS_* residuais, inofensivas)
- **Domínio:** `quantumcalc.com.br` porta 80, HTTPS true
- **VITE_API_URL** é injetada como `ARG` no estágio de build do Dockerfile

> **Atenção:** Se recriar o serviço do zero, usar build.type=dockerfile. nixpacks não tem startCommand
> configurado e serviria os fontes em vez do dist/ buildado.

---

## Marca — Quantum Brand (v1.0)

> Arquivo completo em `public/brand/BRAND.md` e tokens em `public/brand/tokens.css`.
> Importar `tokens.css` no root da app antes de aplicar qualquer estilo.

### Conceito
Instrumento de precisão. Grade rígida, números mono alinhados, sem ornamento. **Preciso, sistêmico, modular, sem ruído.**

### Cores (proporção 60/30/10)
| Token | HEX | Uso |
|---|---|---|
| `--qtm-bone` | `#F4EFE3` | **Fundo principal** (60%) — nunca branco puro |
| `--qtm-ink` | `#0B0B0F` | Texto, estrutura (30%) |
| `--qtm-lime` | `#D6FF3F` | **Sinal** — botões primários, KPIs positivos (10%) |
| `--qtm-lime-dim` | `#B8E520` | Hover/pressed do lime |
| `--qtm-plasma` | `#1A1B20` | Dark surfaces |
| `--qtm-rust` | `#C44A2A` | Erros, valores negativos |
| `--qtm-receipt` | `#EBE5D6` | Superfície secundária (cards) |
| `--qtm-line` | `#D9D2BF` | Bordas |
| `--qtm-mute` | `#6B6A60` | Texto secundário |

### Tipografia
- **Space Grotesk** — headlines, UI, body (sans)
- **JetBrains Mono** — **TODO número sem exceção**: preços, gramas, %, datas, IDs
- Classe `.qtm-num` ou atributo `data-numeric` aplica mono + tabular nums automaticamente

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

### Componentes — regras rápidas
- **Botão primário:** bg `--qtm-lime`, text `--qtm-ink`, cantos 0–2px, mono uppercase, `letter-spacing: 0.08em`
- **Botão secundário:** bg `--qtm-ink`, text `--qtm-bone`
- **Cards:** borda `--qtm-line`, padding 32px, **sem sombra**
- **Inputs:** borda `--qtm-border-ink`, focus troca borda para `--qtm-lime` (sem glow)
- **Tabelas:** header mono uppercase 11px `--qtm-mute`, números alinhados à direita

### Badges de margem
- `> 30%` → bg lime, text ink (`+ Saudável`)
- `10–30%` → bg bone, border ink (`± Atenção`)
- `< 10%` → bg rust, text bone (`− Revisar`)

### Princípios inegociáveis
1. **Cantos vivos** — `border-radius` máximo 4px (só app icon usa 24%)
2. **Bordas, não sombras** — sombra só em modais/overlays
3. **Mono para número** — sem exceção
4. **Lime é sinal** — se cobre > 10% da viewport, está errado
5. **Sem ícones decorativos** — cada ícone tem função semântica
6. **Copy direto** — "Margem 2,1%" não "Sua performance precisa de atenção 📊"

### Assets disponíveis em `public/brand/`
- `logo-horizontal.svg` — header, materiais (mín. 96px)
- `logo-mark.svg` — símbolo Q isolado (mín. 16px)
- `favicon.svg` / `app-icon.svg`
- `tokens.css` — importar no root

> **Logo em fundo escuro:** definir `--qmark-bg` no contêiner pai (ex: `--qmark-bg: var(--qtm-ink)`).
> Para `currentColor` funcionar, preferir inline SVG em vez de `<img>`.

---

## Próximos passos

- [x] Configurar VITE_API_URL no EasyPanel
- [x] Testar fluxo completo login → cadastro → precificação (validado em 2026-05-20)
- [ ] **Implementar design system** (tokens.css + Space Grotesk + JetBrains Mono + paleta Quantum)
- [ ] Corrigir bugs encontrados no fluxo (rodar e anotar aqui)
- [ ] Implementar upload de nota fiscal (OCR via IA)
- [ ] Adicionar gráficos de evolução de custos
- [ ] Adicionar relatório de margem por produto/canal
- [ ] Implementar modo offline (PWA cache — service worker já configurado no vite.config.js)
- [ ] Habilitar autoDeploy no EasyPanel (atualmente false)
