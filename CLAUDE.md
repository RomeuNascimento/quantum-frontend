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

## Próximos passos

- [x] Configurar VITE_API_URL no EasyPanel
- [x] Testar fluxo completo login → cadastro → precificação (validado em 2026-05-20)
- [ ] Corrigir bugs encontrados no fluxo (rodar e anotar aqui)
- [ ] Implementar upload de nota fiscal (OCR via IA)
- [ ] Adicionar gráficos de evolução de custos
- [ ] Adicionar relatório de margem por produto/canal
- [ ] Implementar modo offline (PWA cache — service worker já configurado no vite.config.js)
- [ ] Habilitar autoDeploy no EasyPanel (atualmente false)
