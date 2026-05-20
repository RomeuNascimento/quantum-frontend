# Quantum Frontend — CLAUDE.md

## Estado do Projeto

**Criado em:** 2026-05-20
**Última sessão:** 2026-05-20
**Status:** Estrutura inicial criada, aguardando deploy no EasyPanel

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
- [x] Dockerfile
- [x] Push inicial para GitHub

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

1. Criar serviço "Static" ou "App" com Node
2. Build command: `npm install && npm run build`
3. Output dir: `dist/`
4. Configurar variável: `VITE_API_URL=https://api.quantumcalc.com.br`
5. Domínio: `quantumcalc.com.br`

---

## Próximos passos

- [ ] Configurar VITE_API_URL no EasyPanel
- [ ] Testar fluxo completo login → cadastro → precificação
- [ ] Implementar upload de nota fiscal (OCR via IA)
- [ ] Adicionar gráficos de evolução de custos
- [ ] Adicionar relatório de margem por produto/canal
- [ ] Implementar modo offline (PWA cache)
