# Quantum Frontend — CLAUDE.md

## Estado do Projeto

**Criado em:** 2026-05-20
**Última sessão:** 2026-06-13 (branch `claude/keen-goldberg-m8aqqx` — atalho de Embalagens no Dashboard + página `/ponto-equilibrio` (break-even com slider de margem + rateio % sobre faturamento); migration 008 do backend já aplicada em produção; ⚠️ DEPLOY do frontend pendente)
**Próxima sessão:** DECISÃO PENDENTE: app Android via TWA (ver seção abaixo) · alertas proativos (#6) · páginas `/termos`/`/privacidade` (pós-advogado) · testes Playwright · tela de configurações (usar `/auth/logout-all` e `/auth/alterar-senha`, já prontos no backend)
**Status:** PRODUÇÃO — app em https://quantumcalc.com.br · landing em https://lp.quantumcalc.com.br

---

## Sessão 2026-06-13 (parte 4) — Acesso a Embalagens + Ponto de Equilíbrio

> Branch `claude/keen-goldberg-m8aqqx`.

**Atalho de Embalagens (era página órfã):** a tela `/embalagens` existia mas não tinha
entrada no app (sumiu do Dashboard quando Orçamento/Relatório entraram). Adicionado:
- `Dashboard` > "Cadastrar": novo atalho **Embalagem** (`/embalagens/novo`).
- `Dashboard` > "Gerenciar": novo item **Embalagens** (`/embalagens`).

**Ponto de equilíbrio (`/ponto-equilibrio`, novo):** `src/pages/PontoEquilibrio/index.jsx`,
link em Dashboard > Gerenciar. Ferramenta de planejamento (informativa, não mexe no motor
de preços — KISS, não é ERP):
- Lê `GET /custos-fixos/resumo` (`total_mensal`); estado vazio se não há custos fixos.
- **Slider de margem de contribuição** (5–90%) → faturamento de equilíbrio =
  `CF / (margem/100)` + valor/dia. Banner ink/lime no padrão do design system.
- **Meta de lucro** (input opcional) → faturamento = `(CF + lucro) / margem`.

> **Rateio por produto — DESCARTADO (decisão do usuário 13/06).** Cheguei a implementar
> rateio "% sobre faturamento", mas o dono (ADM/MBA) apontou com razão que rateio é lógica
> de **fábrica** (alocar custo indireto por unidade produzida). Micro empreendedor não pensa
> "cada brigadeiro paga R$ 1 de aluguel" — ele pensa "tenho R$ X de conta, com Y% de margem
> preciso faturar Z". Por isso a tela ficou **só com o ponto de equilíbrio** (CF + margem →
> faturamento necessário, + meta de lucro). Não reintroduzir rateio sem pedido explícito.

- Build validado (`npm run build` ✅).

---

## Sessão 2026-06-13 (parte 3) — Logout revoga token no servidor

> Branch `claude/keen-goldberg-m8aqqx`. Acompanha a revogação de JWT do backend.

- `src/api/auth.js`: `logout(token)` → `POST /auth/logout` (token passado explícito no
  header, pois o `authStore` já limpou o `localStorage` antes de chamar).
- `src/store/authStore.js`: `logout()` captura o token, limpa o estado local e dispara
  `apiLogout(token)` best-effort (`.catch(()=>{})`). **Sem recursão de 401:** como o
  token local já foi limpo, se a chamada voltar 401 o interceptor vê `token: null` e não
  re-dispara logout.
- Backend correspondente (migration 008, ver CLAUDE.md do quantum-backend): denylist por
  jti + token_version; endpoints `/auth/logout`, `/auth/logout-all`, `/auth/alterar-senha`.
- ⚠️ `/auth/logout-all` e `/auth/alterar-senha` ainda **não têm UI** (não existe página de
  configurações). Backend pronto p/ quando criarmos a tela.

---

## Sessão 2026-06-13 (parte 2) — Embalagens, pesquisa competitiva, orçamento WhatsApp, plano mensal

**Embalagens (revisão do processo — PR #3 dos dois repos):**
- ImportarNota: select "Destino" (🥣 Ingrediente / 📦 Embalagem) por item, pré-classificado
  pela IA (campo `tipo` novo no backend); vínculo lista o catálogo do destino; salvar
  cria/vincula embalagem + preço. Antes TODO item da nota virava ingrediente
- Embalagem nova é sempre `unid` (select de unidade removido do form — cálculo preço/qtd
  não converte peso; legadas exibem unidade read-only)
- Botões "Converter em embalagem"/"Converter em ingrediente" nos forms (backend copia
  histórico de preços, original fica `ativo=False`)

**Análise competitiva (squad aios-analyst):** `docs/pesquisa/analise-competitiva-2026-06-13.md`
- Diferenciais únicos do Quantum: importação de nota por FOTO via IA (ninguém tem) e
  precificação por canal com taxas reais. Comunicar como features-herói
- Sequência recomendada: plano mensal ✅ → orçamento WhatsApp ✅ → rateio de custos
  fixos → alertas proativos → CRM → pedidos/encomendas
- Riscos de usabilidade: curva de cadastro antes do 1º preço, vocabulário técnico,
  trial 7d curto (concorrentes 14–30d), PWA sem vitrine da Play Store

**Orçamento por WhatsApp (PR #5) — `/orcamento`, link no Dashboard > Gerenciar:**
- Itens com preço pré-preenchido do 1º canal precificado (relatorio-margem), editável;
  cliente + WhatsApp opcional; preview; wa.me + copiar + imprimir/PDF. Sem persistência
  (CRM/pedidos ficam para depois)

**Plano mensal (PR #5 + backend PR #4):**
- Assinatura consome `GET /billing/planos` (valores reais do Stripe) — botões anual
  (primary) + mensal (ghost, só aparece se backend tiver `STRIPE_PRICE_ID_MENSAL`)
- ⚠️ ATIVAÇÃO PENDENTE (usuário): rodar `setup_stripe.py` (cria preço R$ 19,90/mês),
  configurar `STRIPE_PRICE_ID_MENSAL` no EasyPanel, deploy

**📱 DECISÃO PENDENTE — App Android (conversado em 13/06, decidir depois):**
- Recomendação: **TWA via PWABuilder/Bubblewrap** (~1-2 dias) — PWA já cumpre os
  requisitos; falta: conta Play Console (US$ 25), `assetlinks.json` em
  `/.well-known/`, pacote .aab, ficha da loja (privacidade já rascunhada em docs/legal)
- ⚠️ Play Store exige Google Play Billing (15%) para assinatura vendida NO app —
  solução padrão: app não vende (esconder checkout quando rodando como TWA;
  usuário assina pelo site)
- Capacitor (~1-2 sem) só quando formos fazer alertas push; React Native descartado
- Ganho: vitrine da Play Store (descoberta + social proof — risco apontado na pesquisa)

---

## Sessão 2026-06-13 — Auditoria UI/UX (squad design-chief) implementada + docs legais

> Auditoria completa do squad design-chief (contraste WCAG com ratios calculados,
> a11y, estados, consistência). **Toda a auditoria foi implementada e mergeada**
> (PR #1, 2 commits). ⚠️ Deploy do frontend no EasyPanel: conferir se foi disparado
> (o backend foi deployado em 13/06; o frontend pode ter ficado pendente).

**Mergeado na main (PR #1):**
- Tokens: `mute` #6B6A60→#5A584F e `rust` #C44A2A→#A63D22 (WCAG AA em cards e erros)
- `Modal` acessível: role/aria, Escape, focus trap, retorno de foco
- `:focus-visible` global (outline ink 2px) em `index.css`; `.input` sem `outline-none`
- Login: senha min 8 (igual backend) + `autoComplete` + `htmlFor`/`id`
- **`ConfirmDialog`** (novo) substitui `window.confirm()` nas 6 deleções
- **`LoadError`** (novo) com "Tentar novamente" nas 6 telas que ficavam em branco em erro
- `FormField` associa label↔campo via `useId`+`cloneElement` (clicar no label foca)
- `aria-label` em inputs/checkboxes das importações IA, lixeiras, voltar, expandir
- Tipografia: mensagens de erro/status mono-11px → `font-sans text-sm` em todo o app
- CustosFixos com FAB padrão; `qtm-num` nos números das listas; BottomNav 9→10px
- Precificação: EmptyState de primeiro uso sem produtos
- `SimuladorPreco` deriva taxas do 1º canal real (query `['canais']`, ref `tocouTaxas`)
- Planejamento usa `brl` de `utils/format`; dot da importação sem `rounded-full`

**Docs legais (squad legal-chief) — `docs/legal/`:**
- `termos-de-uso.md` + `politica-de-privacidade.md` — RASCUNHOS com placeholders
  (`[RAZÃO SOCIAL]`, `[CNPJ]`, contato/DPO...) e 5 decisões para validar com advogado
  (reembolso pós-arrependimento, limitação de responsabilidade vs CDC art. 51, foro
  do consumidor, mecanismo de transferência internacional ANPD, destaque da renovação
  automática). **Mergear no repo ≠ publicar** — falta criar `/termos` e `/privacidade`
  no app + link no cadastro e na landing, SÓ após revisão jurídica.

**Validação da sessão:** build ✅; testado em Chromium headless (mock de API):
Escape fecha modais, label foca campo, ConfirmDialog/LoadError/EmptyState ok.
Scripts de screenshot ficaram em `/tmp` (refazer como testes Playwright no repo).

**Backend na mesma sessão:** auditoria de segurança cyber-chief + correções deployadas
(ver CLAUDE.md do quantum-backend).

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
- [x] **Botão "+ Novo" fixo (FAB) nas listas** (2026-05-20)
  - Ingredientes, Receitas e Produtos: botão lime ancorado `fixed bottom-[88px] right-4 z-30`
  - Sem precisar rolar para o topo para acessar a ação principal
- [x] **Erro de deleção visível nas listas** (2026-05-20)
  - `handleDelete` com `try/catch` — erros do backend (ex: FK constraint) aparecem como banner rust
  - Ingredientes usados em receitas não podem ser deletados; o erro agora é exibido na tela
- [x] **Fix loop infinito de autenticação** (2026-05-20)
  - Causa: interceptor 401 removia `quantum_token` mas não `quantum-auth` (chave do Zustand persist)
  - Fix: interceptor chama `useAuthStore.getState().logout()` diretamente (síncrono) — sem `window.location.href`
  - `PrivateRoute` detecta `token: null` e faz `<Navigate to="/login">` via React Router (sem reload)
- [x] **PWA registerType `autoUpdate` → `prompt`** (2026-05-20)
  - Evita que o service worker force reload automático da página a cada novo deploy
- [x] **Seta voltar no header das seções de lista** (2026-05-20)
  - `Layout` aceita `onBack` como função ou booleano
  - Ingredientes, Receitas, Produtos, Precificação: `onBack={() => navigate('/dashboard')}`
  - **Armadilha:** usar sempre função explícita com rota destino — nunca `onBack` booleano (que usa `navigate(-1)` e causa loop quando o usuário alterna entre seções)
- [x] **Nomenclatura neutra em Receitas** (2026-05-20)
  - Campo `tipo` virou texto livre (input, opcional) — remove select fixo "Massa / Recheio"
  - Badge na lista exibe o valor digitado; some se vazio
- [x] **Produtos: seção unificada "Preparações"** (2026-05-20)
  - Remove as duas seções "Massas" e "Recheios" do formulário de produto
  - Uma única seção "Preparações" — mostra todas as receitas, sem filtro por tipo
  - Na option do select: `Nome da receita (Tipo)` se tipo preenchido
  - Backend: leitura une `produto.massas + produto.recheios`; escrita salva tudo em `produto_massas`
- [x] **Importação via IA — Nota Fiscal** (2026-05-20)
  - Card de ação full-width no topo da lista de ingredientes → `/ingredientes/importar-nota`
  - Fluxo: upload (foto/PDF, captura de câmera nativa) → IA processa → revisão → salvar
  - Revisão: cada item tem checkbox + campos editáveis (nome, marca, quantidade, unidade, preço)
  - Detecta ingredientes já existentes por nome → toggle "adicionar preço ao existente" vs "criar novo"
  - Salva via `criarIngrediente` (com marca) + `adicionarPrecoIngrediente` com `origem: 'nota_fiscal_ia'`
- [x] **Importação via IA — Receitas** (2026-05-20)
  - Botão "IA Import" (FAB ink, `fixed bottom-[132px]`) em Receitas → `/receitas/importar`
  - Fluxo: upload (foto/PDF/Excel/CSV) → IA processa → revisão → salvar
  - Revisão: cards expansíveis por receita — editar nome, tipo, rendimento; ver ingredientes e etapas
  - Ingredientes não encontrados no cadastro são criados automaticamente (sem preço)
  - Ingredientes já existentes (match por nome) têm o `ingrediente_id` reutilizado
- [x] **Fix botão salvar nota fiscal** (2026-05-21)
  - Botão estava oculto atrás da BottomNav (`fixed bottom-0` vs `fixed bottom-0 z-20`)
  - Fix: `fixed bottom-16 z-30` — posicionado acima da nav
- [x] **Campo `marca` em ingredientes** (2026-05-21)
  - Formulário: campo "Marca (opcional)"
  - Lista: exibe `Nome · Marca` quando marca preenchida
  - Importação nota: campo marca editável na revisão; IA retorna nome genérico + marca separados
  - Matching de ingredientes usa só `nome` (normalizado) — marca não interfere no match
- [x] **Billing — assinatura anual Stripe (R$ 147/ano)** (2026-06-12, branch `claude/practical-cray-vksesn`)
  - `src/pages/Assinatura/index.jsx` (rota `/assinatura`): status trial/ativa/vencida, botão checkout (redirect ao Stripe), botão "Gerenciar assinatura" (portal); polling de 3s após voltar do checkout com `?sucesso=1` (webhook leva segundos)
  - `src/api/billing.js`: `billingStatus`, `criarCheckout`, `abrirPortal`
  - Dashboard: banner ink "Teste encerrado — assine" (vencida) e linha discreta com data fim do trial
  - **`src/components/PaywallGate.jsx`**: envolve todo PrivateRoute; query `['billing-status']` (staleTime 60s) → redirect a `/assinatura` se vencida; `/dashboard` e `/assinatura` isentos
  - `client.js`: HTTP 402 do backend (paywall server-side) → `window.location.href = '/assinatura'`
  - Backend correspondente: ver CLAUDE.md do quantum-backend (setup Stripe executado, migration 006 pendente em produção)
- [x] **Editar e excluir canais de venda** (2026-06-12, branch `claude/practical-cray-vksesn`)
  - `Precificacao/index.jsx`: cards de canal (iFood etc.) viraram `<button>` clicáveis → abrem o modal pré-preenchido; o mesmo form cria ou edita (`atualizarCanal` = `PUT /canais/{id}`, que já existia no backend). Botão "Excluir canal" (soft delete) no modo edição
  - Ao salvar/excluir um canal, invalida `['canais']`, `['precos-produto', id]` e `['relatorio-margem']` — taxas alteradas recalculam os preços sugeridos na hora (preço nunca é fixo no banco)
  - **Antes:** os canais eram só `<div>` não-clicáveis; o iFood pré-cadastrado ficava com taxas fixas, impossível ajustar pela UI
- [x] **Deep-link de cadastro `?modo=cadastro`** (2026-06-12, branch `claude/practical-cray-vksesn`)
  - `Login.jsx`: lê `useSearchParams()` — `?modo=cadastro` abre direto na aba "Criar conta". Os CTAs da landing page apontam para `https://quantumcalc.com.br/login?modo=cadastro`
  - (Caminho "assinar agora" — registrar → checkout direto via `?next=checkout` — foi conversado mas NÃO implementado; trial não bloqueia pagar, então fica como melhoria futura opcional)
- [x] **Vínculo nota fiscal ↔ catálogo de ingredientes** (2026-06-12, branch `claude/practical-cray-vksesn`)
  - `ImportarNota.jsx`: toggle binário "adicionar ao existente/criar novo" substituído por select "Vincular a:" por item, listando todos os ingredientes existentes + "➕ Criar novo"
  - Pré-seleção: `ingrediente_id_sugerido` da IA (backend agora envia o catálogo no prompt) > match por nome normalizado > criar novo; badge lime "Sugerido pela IA"
  - Conversão de unidade g↔kg/ml↔L e dedupe `criadosNoLote` preservados; indicador "→ unidade"/"⚠" agora segue o vínculo selecionado
  - Editar o nome só re-deriva o vínculo se estiver em "criar novo" (não sobrescreve escolha explícita do usuário)
- [x] **Importar nota fiscal virou card de ação** (2026-05-21)
  - Substituiu o pequeno FAB "IA Nota" do canto por um card `bg-ink` full-width no topo da lista
  - Card exibe ícone + título "Importar nota fiscal" + subtítulo explicativo + seta

---

## Stack

- **Framework:** React 18 + Vite
- **Roteamento:** React Router v6
- **Estado:** Zustand (auth) + TanStack Query v5 (server state — `src/queryClient.js`)
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
/ingredientes → lista (card "Importar nota fiscal" no topo)
/ingredientes/importar-nota → importação via IA de nota fiscal
/ingredientes/novo → formulário (campos: nome, marca, unidade, fator_correcao)
/ingredientes/:id → editar
/embalagens → lista
/embalagens/novo
/embalagens/:id
/receitas → lista
/receitas/importar → importação via IA de receitas
/receitas/novo
/receitas/:id
/produtos → lista
/produtos/novo
/produtos/:id
/precificacao → canais + seletor de produto
/custos-fixos → lista
/assinatura → status do plano + checkout/portal Stripe (isenta do PaywallGate)
```

---

## Componentes base

- `Layout` — header `bg-bone border-b border-line`, ícones `strokeLinecap="square"`; prop `onBack` aceita função ou booleano
- `BottomNav` — `bg-ink border-t border-plasma`, tab ativo `text-lime`, labels mono uppercase, **altura h-16 (64px)**
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
// FAB principal "+ Novo" — lime
<Link className="fixed bottom-[88px] right-4 z-30 bg-lime text-ink font-mono font-bold text-xs uppercase tracking-widest px-4 py-3 border border-ink/20 active:bg-lime-dim">

// Card de ação IA — full-width no topo da lista (padrão para Ingredientes)
<Link className="flex items-center gap-3 bg-ink text-bone border border-ink px-4 py-3 mb-4 active:opacity-80">

// FAB secundário (IA) — ink, ainda usado em Receitas
<Link className="fixed bottom-[132px] right-4 z-30 bg-ink text-bone font-mono font-bold text-xs uppercase tracking-widest px-4 py-3 border border-ink/20 active:opacity-80">

// Item da lista — row com divider (sem card individual)
<div className="flex items-center border-b border-line py-3 last:border-b-0">

// Botão salvar fixo acima da BottomNav (h-16 = bottom-16)
<div className="fixed bottom-16 left-0 right-0 bg-bone border-t border-line px-4 py-3 z-30">
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

## Bugs conhecidos / Armadilhas

### Auth — dual storage (já corrigido)
O Zustand persiste o token em `localStorage['quantum-auth']`. O axios interceptor lê/escreve em `localStorage['quantum_token']`. São chaves **separadas**. Se limpar uma sem a outra, o app entra em loop de redirect.
- **Fix aplicado:** o interceptor 401 em `src/api/client.js` chama `useAuthStore.getState().logout()` (síncrono). Sem `window.location.href` — o `PrivateRoute` faz o redirect via React Router.
- **Nunca** usar `window.location.href` para redirecionar após 401 — cria race condition com o Zustand persist.

### Seta "voltar" nas páginas de lista
`onBack` booleano usa `navigate(-1)` — causa loop se o usuário alternou entre seções.
- **Sempre** passar função explícita: `onBack={() => navigate('/dashboard')}` nas páginas de lista.
- `navigate(-1)` só é adequado em sub-páginas (formulários, detalhes) onde a origem é sempre a lista.

### Botões fixos e BottomNav
A BottomNav é `fixed bottom-0 z-20 h-16`. Qualquer botão fixo na parte inferior deve usar `bottom-16` (não `bottom-0`) e `z-30` para aparecer acima da nav. Errar isso torna o botão invisível.

### Deleção de ingredientes/receitas em uso
O backend rejeita deleção de itens referenciados por FK. O frontend exibe o erro em banner rust. Para deletar: remover primeiro das receitas/produtos que o referenciam.

### Produtos — tabelas massas/recheios no banco
O banco ainda tem as tabelas `produto_massas` e `produto_recheios`. A leitura une as duas em `preparacoes`. A escrita salva tudo em `produto_massas`. A tabela `produto_recheios` existe mas fica vazia para novos produtos — não dropar por ora.

### PWA service worker
`registerType: 'prompt'` — o SW não força reload automático. Se o usuário ficar com versão antiga em cache, o app exibirá o prompt de atualização quando o SW novo estiver pronto.

### "Erro ao conectar com o servidor"
Mensagem genérica do `client.js` quando `error.response` é undefined (sem resposta HTTP). Causa mais comum: backend reiniciando após deploy. Aguardar o serviço subir (~30s) e tentar novamente.

---

## Deploy EasyPanel

- **Build type:** `dockerfile` (usa o `Dockerfile` do repo — multi-stage node+nginx)
- **Env vars:** `VITE_API_URL=https://api.quantumcalc.com.br`
- **Domínio:** `quantumcalc.com.br` porta 80, HTTPS true
- **VITE_API_URL** é injetada como `ARG` no estágio de build do Dockerfile
- **autoDeploy:** desabilitado — deploy manual via API:
  ```bash
  curl -X POST https://panel.quantumcalc.com.br/api/trpc/services.app.deployService \
    -H "Authorization: Bearer <EASYPANEL_TOKEN>" \
    -H "Content-Type: application/json" \
    -d '{"json":{"projectName":"quantum","serviceName":"frontend"}}'
  ```

> **Atenção:** o serviço se chama `frontend` (não `quantum-frontend`) no EasyPanel.
> Se recriar do zero, usar build.type=dockerfile. nixpacks serviria os fontes em vez do dist/.

---

## Landing Page (marketing) — serviço `lp`

> Publicada em 2026-06-12. **NÃO faz parte deste repositório** — é um HTML estático
> separado, servido por um serviço WordPress reaproveitado no EasyPanel.

### Onde está
- **Serviço EasyPanel:** `lp` (tipo WordPress — PHP + nginx + `lp-db`), no projeto `quantum`
- **Domínio:** `lp.quantumcalc.com.br` (o app/sistema fica em `quantumcalc.com.br` — raiz)
- **Origem do HTML:** gerado no "Claude design" (Quantum Landing). É um mini-site: `index.html` + `styles.css` + `tokens.css` + `app.js` + `image-slot.js` + pastas `quantum-brand/`, `screenshots/`, `uploads/` (imagens). **Não é arquivo único** — precisa subir tudo.
- **Arquivos no servidor:** ficam em `/code` (volume persistente do container `lp`)

### Como a landing é servida (a gambiarra que faz funcionar)
O serviço é WordPress; queríamos servir HTML estático. Dois fatos atrapalham:
1. O nginx do EasyPanel tem `index index.php index.html;` (php na frente) e é
   **regenerado a cada restart** — editar a config pelo módulo NGINX do EasyPanel
   **NÃO persiste** (volta ao padrão no próximo deploy/restart). Não adianta mexer lá.
2. Com `index.php` presente, a raiz `/` sempre cai no WordPress (que ainda faz
   redirect 301 http→https).

**Solução aplicada (robusta, sobrevive a restart):** renomeamos o front controller
do WordPress — `mv index.php index.php.desativado` em `/code`. Sem `index.php`, o
nginx serve `index.html` naturalmente na raiz. O `/wp-admin` continua funcionando
(usa outro index.php próprio). É um arquivo no volume persistente, então não é
desfeito por restart.

### Como ATUALIZAR a landing (receita)
1. Baixar a nova versão do Claude design como `.zip`
2. Arrastar o zip pra dentro da **IDE** do serviço `lp` (pasta `/code`)
3. No terminal embutido da IDE (`Terminal → New Terminal`, container `root@...:/code#`):
   ```bash
   unzip -o "nome-do-zip.zip"        # -o sobrescreve sem perguntar
   cp "Quantum Landing.html" index.html   # PASSO QUE PUBLICA — fácil esquecer
   ```
   O arquivo no zip se chama `Quantum Landing.html`; o servidor entrega `index.html`.
   Sem o `cp`, atualiza os assets mas a página continua a versão antiga.
4. Testar furando cache: aba anônima + `lp.quantumcalc.com.br/?x=N` (muda o N a cada vez).
   ⚠️ O navegador cacheia o redirect 301 de forma permanente — sempre testar com `?x=N`.
5. **Não** precisa mexer em nginx nem refazer o `mv index.php` — isso já está resolvido.

### Cache
- O WordPress tinha **LiteSpeed Cache** ativo — foi **desativado** (página estática não precisa).
  Se reativar e a landing "congelar" numa versão velha, purgar/desativar o LiteSpeed.

### Diagnóstico (se a raiz não mostrar a landing)
```bash
curl -s http://localhost/ | grep -i "<title>"   # do terminal do lp
```
Deve retornar `<title>Quantum · Controle o lucro de cada receita</title>`. Se vier
vazio ou 301, o `index.php` voltou (refazer o `mv`) ou é cache do navegador (`?x=N`).

### CTAs da landing → app
Os botões devem apontar para `https://quantumcalc.com.br/login?modo=cadastro`
(abre direto a aba "Criar conta" → trial de 7 dias → /assinatura). ⚠️ **PENDENTE
conferir:** não foi verificado se os botões do HTML atual já apontam pra lá.

### Futuro (decisão adiada)
Hoje: landing em `lp.` e app na raiz. Se algum dia quiser a landing na raiz
(`quantumcalc.com.br`) e o app em `app.quantumcalc.com.br`, é a "Fase 2" — exige
mover domínio do app + ajustar CORS (`ALLOW_ORIGINS`), `FRONTEND_URL` e as URLs do
Stripe, e cuidar de redirect pra quem já usa o app (há contas ativas em produção).
Não fazer no susto.

---

## Auditoria 2026-06-11 — Revisão completa (frontend)

> Revisão de código completa feita em 2026-06-11. Achados do backend: ver seção equivalente no CLAUDE.md do **quantum-backend**.

### 🔴 Críticos (Fase 0) — C1–C6 ✅ corrigidos em 2026-06-11; resta C7 (depende da decisão de unidades, ver M3 do backend)

- [x] **C1. Receitas perdeu os botões "+ Novo" e "IA Import"** — `src/pages/Receitas/index.jsx:32-34`: regressão — não existe NENHUM link na UI para `/receitas/novo` (só atalho do Dashboard) nem para `/receitas/importar` (rota órfã, inacessível). Restaurar FAB lime + FAB ink conforme padrões do design system.
- [x] **C2. Páginas órfãs** — `/custos-fixos` sem nenhum ponto de entrada (card "Custos/mês" do Dashboard é `<div>`, não link); `/embalagens` (lista) só alcançável indiretamente. Fix: card do Dashboard vira link + revisar atalhos.
- [x] **C3. Botão salvar da importação de receitas oculto** — `src/pages/Receitas/Importar.jsx:245`: `fixed bottom-0` sem `bottom-16 z-30` — coberto pela BottomNav (mesma armadilha já corrigida em `ImportarNota.jsx:263`).
- [x] **C4. PWA: ícones do manifest não existem** — `vite.config.js` declara `icons/icon-192.png`, `icons/icon-512.png`, `favicon.ico`, `apple-touch-icon.png` — nenhum existe em `public/` (só `brand/`). Instalação na home screen quebrada. Remover também `public/manifest.json` morto (tema roxo pré-design-system, servido em paralelo ao `manifest.webmanifest` do plugin).
- [x] **C5. PWA: prompt de update nunca aparece** — `vite.config.js`: `registerType: 'prompt'` é ANULADO por `workbox.skipWaiting: true` + `clientsClaim: true`; e não há nenhum `useRegisterSW`/`virtual:pwa-register` no src. Fix: remover skipWaiting/clientsClaim + implementar UI de prompt.
- [x] **C6. Importação cria ingredientes duplicados** — `Receitas/Importar.jsx:75-86` e `ImportarNota.jsx:85-115`: match calculado uma única vez; mesmo nome em duas receitas/itens com "criar novo" → ingrediente duplicado. Fix: cache por nome normalizado durante o loop de salvar.
- [x] **C7. Conversão de unidade na nota fiscal** ✅ 2026-06-11 — salvar converte g↔kg/ml↔L para a unidade do ingrediente; revisão mostra "→ unidade" (compatível) ou "⚠" rust (incompatível). DECISÃO M3: backend converte kg/L no cálculo (fator_unidade) — `ImportarNota.jsx:91-107`: preço registrado na unidade da nota (kg) num ingrediente cadastrado em g → custo até 1000× errado. Mínimo: avisar quando unidade divergir. (Ligado à decisão pendente M3 do backend.)

### 🟡 Médios (Fase 1)

- [x] **M1. Tratamento de erro sistêmico** ✅ 2026-06-11 — try/catch/finally + banner em Precificação (com guarda de race no selecionarProduto) e CustosFixos; .catch nas 4 listas; onAddPreco dos forms — Precificação/CustosFixos: `carregar()` sem try/catch/finally → spinner infinito em falha; listas com `.finally()` sem `.catch()` → EmptyState enganoso em erro de rede; `selecionarProduto` sem catch e sem cancelamento (race ao trocar produto rápido). Mutações sem feedback de erro: `Embalagens handleDelete`, `CustosFixos onSubmit/handleDelete`, `Precificacao onCriarCanal/onSalvarPreco`, `onAddPreco` (Ingredientes/Embalagens Form).
- [x] **M2. Adotar TanStack Query** ✅ 2026-06-12 (branch `claude/practical-cray-vksesn`) — `@tanstack/react-query` v5; `src/queryClient.js` (staleTime 30s, retry 1) + Provider em `main.jsx` + `queryClient.clear()` no logout. Migrados: 5 listas (useQuery + useMutation nas deleções), Relatorio, Dashboard (4 useQuery, estados '…'/'—' preservados), Precificação (query parametrizada `['precos-produto', id]` eliminou o race guard `selecaoAtual`), forms (detalhe via useQuery + guard `formPreenchido` para o reset; submissões continuam try/catch + invalidate). Fluxos de importação IA NÃO migrados (máquina de estados intacta; só invalidateQueries ao final do salvar). — resolve loading/error/refetch/race de uma vez, corta ~30% do código das listas. Recomendação nº 1 de arquitetura; pré-requisito para modo offline com fila de escrita.
- [x] **M3. Erros 422 do FastAPI viram "[object Object]"** — `src/api/client.js:29`: `detail` é array de objetos em erro de validação; normalizar antes de criar `Error`.
- [x] **M4. Validações numéricas fracas** ✅ 2026-06-11 — rendimento_g valida > 0; Produtos/Form filtra linhas com select vazio (sem NaN no payload) — `rendimento_g` aceita 0/negativo (divisão por zero no custo proporcional); selects de Produtos sem `required` → `NaN` enviado; `min: 0.01` sem mensagem de erro.
- [x] **M5. Cache da API persiste após logout** ✅ 2026-06-11 — logout() deleta `api-cache` do Cache Storage — runtimeCaching `api-cache` (7 dias) não é limpo no `logout()`. Privacidade em aparelho compartilhado.
- [x] **M6. nginx** ✅ 2026-06-11 — no-cache para index.html/sw.js/registerSW.js/manifest.webmanifest + nosniff/X-Frame-Options/Referrer-Policy (risco de tela branca pós-deploy) e sem headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy).
- [x] **M7. Dashboard** ✅ 2026-06-11 — `Intl.NumberFormat('pt-BR')` no card Custos/mês; 'Olá' sem gênero; erro de rede mostra '—' e carregamento '…' (antes parecia 0 produtos / R$ 0.00). *Padronizar pt-BR no resto do app fica para a sessão do TanStack Query.*

### 🔵 Menores (oportunista)

- Números sem `.qtm-num` em Ingredientes/Receitas/Precificacao/Embalagens (usam `font-mono` sem `tabular-nums`); `rounded-full` no dot de status em `Receitas/Importar.jsx:212`; 3 padrões diferentes de botão "novo" entre listas.
- `window.confirm()` nativo nas deleções (usar o `Modal` do design system); `Modal.jsx` sem Escape/focus trap/aria.
- `Produtos/Form.jsx:70-81`: componente `Section` definido dentro do render — mover para fora.
- [x] ErrorBoundary ✅ 2026-06-12 — `src/components/ErrorBoundary.jsx` envolve o App; tela de erro no design system com "Voltar ao início"
- [x] `npm ci` no Dockerfile ✅ 2026-06-12
- [x] Formatação pt-BR padronizada ✅ 2026-06-12 — `src/utils/format.js` (`brl` 2 casas, `brl4` p/ custos unitários); 6 `const brl` locais substituídos pelo import + Ingredientes/Embalagens (listas e forms), CustoLineChart e Dashboard migrados
- Sem testes no frontend (backend ganhou `tests/test_smoke.py` em 2026-06-12).

### ✅ Pontos fortes confirmados na revisão
Código enxuto e consistente, camada de API organizada, fluxos de importação IA com boa máquina de estados, auth resolvido (loop 401 de fato corrigido), `Planejamento/index.jsx` é o melhor arquivo do projeto (useMemo + pt-BR + inputMode — usar como modelo). `CustoLineChart` SVG em Precificação é o embrião dos gráficos — extrair para `src/components/`.

---

## Roadmap de funcionalidades (planejado em 2026-06-11)

> Fases acordadas com o usuário. Fase 0 em execução na branch `claude/sharp-noether-6ml8uh` (frontend + backend).

**Fase 0 — Estabilização** *(2026-06-11 — quase concluída)*
✅ Feito (branch `claude/sharp-noether-6ml8uh` nos dois repos, commits locais):
- Backend: IDOR produtos/receitas (helper `app/routers/ownership.py`), IA não-bloqueante (`def` síncrono → threadpool) + limite 15MB + rate limit 10/10min, logging no exception handler, validação numérica em todos os schemas (senha min 8)
- Frontend: FABs "+ Novo"/"IA Import" restaurados em Receitas (+ action no EmptyState), Dashboard com cards-link (Produtos, Custos/mês) + seção "Gerenciar" (Embalagens, Custos fixos), botão salvar de Receitas/Importar → `bottom-16 z-30`, ícones PWA gerados (`public/icons/` + `apple-touch-icon.png`, manifest.json morto removido), `skipWaiting/clientsClaim` removidos + componente `UpdatePrompt` (useRegisterSW) montado no App, dedup de ingredientes nos dois fluxos de importação (`criadosNoLote` por nome normalizado), client.js normaliza erros 422 (array → string legível)
⚠️ Pendente da Fase 0: C7 (aviso de unidade divergente na nota fiscal) — aguarda decisão M3 do backend (kg/L vs g/ml)
⚠️ ATENÇÃO: validação numérica nova no backend pode rejeitar com 422 payloads de importação com quantidade 0 (ex: IA não extraiu quantidade) — testar fluxo de importação após deploy

**Fase 1 — Fundação para relatórios**
1. Backend: `Decimal/Numeric` para dinheiro + índices + eager loading (M1/M2 backend)
2. Frontend: TanStack Query (M2 frontend) + tratamento de erro sistêmico (M1)
3. Backend: snapshot/histórico de preços para séries temporais de margem

**Fase 2 — Features já planejadas**
1. Relatório de margem por produto/canal (dados já prontos em `listarPrecosProduto` — falta página agregadora + endpoint de agregação)
2. Gráficos de evolução de custos (extrair `CustoLineChart` para componente)
3. Embalagens e Custos Fixos acessíveis na navegação

**Fase 3 — Features novas (ordem de valor)**
1. [x] **Alerta de margem corroída** ✅ 2026-06-11 — Dashboard consome `relatorioMargem()`; banner rust clicável "N produtos precisam de reajuste" (algum canal com margem real < 10%) → `/relatorio`
2. [ ] **Rateio de custos fixos por produto** — ⏸️ ADIADO por decisão do usuário em 2026-06-11 (opções apresentadas: por hora de produção / % sobre custo / valor por unidade — escolheu "deixar para depois")
3. [x] **Simulador "e se"** ✅ 2026-06-11 — `src/components/SimuladorPreco.jsx`: sliders de margem (0–70%) e taxas (0–40%) com preço de venda e lucro em tempo real; montado em `Produtos/Form.jsx` (edição, quando custo_total > 0)
4. [x] **Ficha técnica exportável (PDF)** ✅ 2026-06-11 — receita: `/receitas/:id/ficha` (`Receitas/Ficha.jsx`); produto: `/produtos/:id/ficha` (`Produtos/Ficha.jsx`) — componentes, custos e totais, botão Imprimir/Salvar PDF via `window.print()`; `Layout`/`BottomNav` com `print:hidden`. Entrada: botão "Ficha técnica (PDF)" nos forms de edição.

**Layout desktop (2026-06-11):** conteúdo contido em coluna `max-w-xl mx-auto` — `Layout` (header+main), `BottomNav`, barras fixas de salvar (`max-w-xl mx-auto block` no botão), `UpdatePrompt`; FABs com `sm:right-[max(1rem,calc(50%-17rem))]` para alinhar à coluna; atalhos do Dashboard `sm:grid-cols-4`. Mobile inalterado (max-w só age ≥576px).
5. [ ] **Modo offline com fila de escrita** — só depois do TanStack Query

---

## Próximos passos

- [x] Configurar VITE_API_URL no EasyPanel
- [x] Testar fluxo completo login → cadastro → precificação (validado em 2026-05-20)
- [x] Implementar design system Quantum v1.0 (2026-05-20)
- [x] Importação via IA de nota fiscal e receitas (2026-05-20)
- [x] ANTHROPIC_API_KEY configurada no EasyPanel (IA ativa)
- [x] Fix botão salvar nota fiscal (oculto atrás da BottomNav) (2026-05-21)
- [x] Campo marca em ingredientes + card de ação na lista (2026-05-21)
- [x] **Auditoria e correção de bugs do fluxo completo** (2026-05-29)
  - `Produtos/Form.jsx:39-41`: IDs de origem corrigidos — `m.receita_id`, `m.ingrediente_id`, `m.embalagem_id` (antes usava `m.id` que era o ID da associação, não da entidade)
  - `Receitas/Form.jsx`: `colaborador_id` preservado ao editar etapas MO
  - `Receitas/Form.jsx`: `tipo: dados.tipo || null` — campo vazio envia null ao invés de string vazia
  - `Receitas/Form.jsx` + `Produtos/Form.jsx`: botão salvar movido para `fixed bottom-16 z-30` (padrão do design system)
- [ ] Adicionar página de Embalagens na bottom nav (atualmente acessível só pelo Dashboard)
- [x] Adicionar gráficos de evolução de custos (Precificação 2026-06-11; detalhe do produto ✅ 2026-06-12)
- [ ] Adicionar relatório de margem por produto/canal
- [ ] Implementar modo offline (PWA cache — service worker já configurado no vite.config.js)
- [ ] Habilitar autoDeploy no EasyPanel (atualmente false)

---

## Continuação — Fase 2 (próxima sessão)

> Branch de trabalho: `claude/sharp-noether-6ml8uh` (mesma dos dois repos)

### O que foi entregue na sessão de 2026-06-11 (Fase 0 + parte da Fase 1)

**Frontend (6 commits, branch pushed):**
- `src/pages/Receitas/index.jsx` — FABs "+ Novo" (lime) e "IA Import" (ink) restaurados; action no EmptyState; `.catch` em carregar
- `src/pages/Dashboard.jsx` — cards Produtos/Custos → `<Link>`; seção "Gerenciar" com links a /embalagens e /custos-fixos
- `src/pages/Receitas/Importar.jsx` — botão salvar `fixed bottom-16 z-30`; `criadosNoLote` Map evita duplicação de ingredientes
- `src/pages/Ingredientes/ImportarNota.jsx` — `criadosNoLote` Map; conversão de unidade g↔kg/ml↔L ao salvar; indicador "→ unidade" / "⚠" na revisão
- `src/api/client.js` — normaliza erros 422 (array de objetos → string legível)
- `src/components/UpdatePrompt.jsx` — prompt de atualização PWA com `useRegisterSW`
- `public/icons/` — `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` gerados (PWA instalável)
- `public/manifest.json` — removido (era manifest morto pré-design-system)
- `vite.config.js` — `skipWaiting`/`clientsClaim` removidos; ícones corrigidos
- `src/App.jsx` — `<UpdatePrompt />` montado
- `src/pages/Precificacao/index.jsx` — try/catch/finally; race guard `selecaoAtual` ref; banners de erro
- `src/pages/CustosFixos/index.jsx` — try/catch/finally; banners de erro; onBack
- `src/pages/Embalagens/index.jsx` — try/catch em handleDelete; banner erroDelete
- `src/pages/Ingredientes/Form.jsx`, `Embalagens/Form.jsx` — try/catch em onAddPreco
- `src/store/authStore.js` — logout limpa `caches.delete('api-cache')`
- `nginx.conf` — no-cache para index.html/sw.js/manifest; headers de segurança

**⚠️ Ações pendentes antes do próximo deploy (responsabilidade do usuário):**
1. Backend: `alembic upgrade head` em produção (migration 004 ainda não aplicada)
2. Backend: Auditar ingredientes com unidade `kg` ou `L` no banco de produção
3. Testar fluxo completo de importação de nota fiscal após deploy do backend

### Onde continuar

**Fase 2 — Features de relatório (prioridade):**
1. [x] **Página de relatório de margem `/relatorio`** ✅ 2026-06-11 (branch `claude/keen-ptolemy-mmed2k`) — `src/pages/Relatorio/index.jsx`: resumo saudável/atenção/revisar + card por produto com margem real por canal (badge), preço praticado, lucro unitário; seção "Sem precificação" com atalho. Consome `GET /precificacao/relatorio-margem` (novo no backend). Entrada: link "Relatório de margem" na seção Gerenciar do Dashboard.
2. [x] **`CustoLineChart` e `MargemBadge` extraídos** ✅ 2026-06-11 — `src/components/CustoLineChart.jsx` + `src/components/MargemBadge.jsx`; `Precificacao/index.jsx` importa dos components.
3. [x] **Gráfico de evolução de custos** no detalhe do produto ✅ 2026-06-12 (branch `claude/practical-cray-vksesn`) — `Produtos/Form.jsx` (modo edição): seção "Evolução do custo" em card com `CustoLineChart`, dados de `historicoCustoProduto(id)` (`r.data.pontos`). Renderiza só com ≥2 pontos; erro/carregamento silenciosos (seção omitida).

**Fix botões voltar (2026-06-11, mesma branch):**
- Telas "Salvando..." de `Receitas/Importar.jsx` e `Ingredientes/ImportarNota.jsx` tinham `onBack={() => {}}` — seta de voltar visível que não fazia nada. Removida durante o salvamento.
- Auditoria completa de `onBack`: todas as demais páginas usam função explícita com rota destino (nenhum `navigate(-1)` em uso).

**Fase 1 restante:**
- [x] M2: TanStack Query ✅ 2026-06-12 (branch `claude/practical-cray-vksesn`) — ver detalhes na seção a seguir e no item M2 da auditoria
- [x] M7: Dashboard ✅ 2026-06-11

### M2 TanStack Query — o que foi feito (2026-06-12, branch `claude/practical-cray-vksesn`)

**Infra:**
- `src/queryClient.js` — QueryClient exportado como módulo (staleTime 30s, retry 1); `main.jsx` monta o `QueryClientProvider`; `authStore.logout()` chama `queryClient.clear()` (além do `caches.delete('api-cache')` já existente)

**Convenção de queryKeys (manter ao criar telas novas):**
- Listas: `['ingredientes']`, `['embalagens']`, `['receitas']`, `['produtos']`, `['canais']`, `['custos-fixos']`, `['custos-fixos-resumo']`, `['relatorio-margem']`, `['me']`
- Detalhes: `['ingrediente', id]`, `['embalagem', id]`, `['receita', id]`, `['produto', id]`, `['historico-custo-produto', id]`
- Precificação: `['precos-produto', produtoId]` (**id numérico** — `Number()` no onChange do select; precos + histórico num único queryFn)

**Páginas migradas:**
- 5 listas (Ingredientes, Embalagens, Receitas, Produtos, CustosFixos) + Relatorio: `useQuery` + `useMutation` nas deleções com `invalidateQueries`; banners rust preservados (erro de fetch sincronizado p/ o state do banner via `useEffect` — continua dismissável); EmptyState não aparece mais em erro de rede (guard `isError`)
- Dashboard: 4 `useQuery` independentes (chaves compartilhadas com as listas → cache aproveitado entre telas); estados '…' (carregando) e '—' (erro) mantidos; `margemAlerta` via `useMemo`
- Precificação: seleção de produto virou query parametrizada — **ref `selecaoAtual` (race guard manual) removida**; mutations de canal/preço invalidam `['canais']` / `['precos-produto', id]` / `['relatorio-margem']`
- Forms (4): fetch do detalhe via `useQuery`; **guard `formPreenchido` (ref)** — `reset()` do react-hook-form roda só na primeira chegada dos dados, refetch posterior (ex: após registrar preço, ou refetchOnWindowFocus) não sobrescreve edições do usuário; registrar preço invalida detalhe + lista + `['precos-produto']` + `['relatorio-margem']`; submissões mantidas como try/catch (não viraram useMutation — bom senso, lógica funcionava) com invalidate antes do `voltar()`

**O que ficou de fora (decisão, não pendência):**
- Fluxos de importação IA (`ImportarNota.jsx`, `Receitas/Importar.jsx`) — máquina de estados upload→processando→revisão→salvando→concluído intacta; apenas `invalidateQueries` ao final do `salvar()`
- Planejamento, Fichas (Receitas/Produtos) e Login — fetches pontuais read-only, sem dor; migrar oportunisticamente
- Submissões de formulário continuam imperativas (try/catch/finally)

**⚠️ Testar manualmente após deploy:** fluxo completo de precificação (trocar produto rápido no select), edição de form com refetch em background (registrar preço e conferir que o nome editado não some), logout → login com outra conta (dados antigos não podem vazar), importação IA → voltar à lista (itens novos aparecem)

**Fase 3 (depois):**
- Alerta de margem corroída no Dashboard ("3 produtos precisam de reajuste")
- Rateio de custos fixos por produto (hora de produção ou % faturamento)
- Simulador "e se" — sliders de margem/taxa no detalhe do produto
- Ficha técnica exportável (PDF)
- Modo offline com fila de escrita
