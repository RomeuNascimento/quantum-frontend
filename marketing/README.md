# Quantum · Vídeos de Marketing (Remotion)

Vídeos de anúncio do app Quantum, gerados por código com [Remotion](https://remotion.dev).
Formato principal: **vertical 9:16 · 1080×1920 · 30 fps** (Reels / TikTok / Facebook Ads).
Também há uma composição **1:1 · 1080×1080** pronta.

> **Isolado do app.** Esta pasta tem o próprio `package.json` e o próprio
> `node_modules`. Nada aqui é importado pelo app (`../src`), o Tailwind do app
> só varre `../src`, e o build do app não toca nesta pasta. Pode instalar,
> rodar e renderizar à vontade — o app de produção não é afetado.

---

## Comandos

Dentro de `marketing/`:

```bash
npm install            # 1ª vez — instala o Remotion aqui (isolado)

npm run studio         # abre o Remotion Studio (preview + edição visual)
npm run render:demo    # renderiza o Vídeo 1 em MP4 → out/demo-ad.mp4
npm run render:demo:1x1# versão 1:1 (feed) → out/demo-ad-1x1.mp4
npm run still:demo     # exporta 1 frame (poster) → out/demo-poster.png
```

- **Studio (preview):** `npm run studio` e abra o link no navegador. Dá pra
  arrastar a linha do tempo, ver cada cena e ajustar em tempo real.
- **Render MP4 final:** `npm run render:demo`. O arquivo sai em `out/demo-ad.mp4`.

### Neste ambiente (proxy + Chromium pré-instalado)

O Chromium do sistema é usado via variável de ambiente (evita novo download):

```bash
export REMOTION_CHROMIUM=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npm run render:demo
```

Em uma máquina normal isso **não é necessário** — o Remotion baixa o próprio
Chromium sozinho na primeira execução.

---

## O que dá pra editar sem mexer no código

**Tudo que muda o conteúdo está em `src/config/video.config.js`:**

| Quer mudar…                | Onde                                              |
|----------------------------|---------------------------------------------------|
| Headline / gancho / CTA    | `COPY` (hook, intro, demo, result, cta)           |
| Produto de exemplo         | `PRODUCT` (nome, ingredientes, custo, margem)     |
| Duração de cada cena       | `TIMELINE` (em segundos)                          |
| Velocidade das animações   | `SPEED` (1 = normal; 1.2 = 20% mais rápido)       |
| Domínio / nome da marca    | `BRAND`                                           |
| Tamanho / formato          | `FORMATS` (vertical 9:16 e square 1:1)            |

Os números de preço são **calculados pela fórmula real do app**
(`preço = custoUnit / (1 − margem/100)`), então é só ajustar `custoTotal`,
`porcoes` e `margemAlvo` que preço/lucro se ajustam sozinhos e continuam corretos.

---

## Estrutura

```
marketing/
├── package.json            projeto isolado (Remotion)
├── remotion.config.js      config de render (formato, Chromium)
├── src/
│   ├── index.js            registerRoot
│   ├── Root.jsx            registra as composições (DemoAd, DemoAdSquare)
│   ├── config/
│   │   └── video.config.js ← CONFIG CENTRAL (edite aqui)
│   ├── theme/              tokens de cor, fontes, presets de animação, device
│   ├── components/         peças reutilizáveis de motion:
│   │   ├── PhoneFrame      mockup de celular (bezel, sombra, perspectiva)
│   │   ├── AnimatedCursor  cursor de toque (movimento + clique + ripple)
│   │   ├── AnimatedText    Kicker / Headline / Sub com entrada em spring
│   │   ├── Camera          zoom + pan (push-in dirigido)
│   │   ├── FeatureHighlight anel dourado que realça um elemento
│   │   ├── PriceRevealCard  card navy do preço (herói visual)
│   │   ├── Background       fundo com grade + spotlight que deriva
│   │   └── Logo             marca Quantum (geometria do app)
│   ├── screens/            telas do app reproduzidas (fiéis + animáveis):
│   │   ├── AssistenteHome   tela principal (hero navy, "Calcular meu preço")
│   │   ├── RecipeUpload      etapa 1 — upload + digitação da receita
│   │   ├── Processing        "IA lendo…" (spinner)
│   │   ├── RecipeReview      ingredientes organizados pela IA
│   │   ├── PriceScreen       etapa 4 — slider de margem + preço ao vivo
│   │   ├── StepBar / ui.jsx  átomos do design system
│   ├── scenes/             cenas do Vídeo 1:
│   │   ├── HookScene        gancho (pergunta → preço)
│   │   ├── AppSequence      uso simulado (cursor, digitação, IA, slider)
│   │   ├── ResultScene      benefício
│   │   └── CtaScene         chamada final
│   └── videos/
│       └── DemoAd.jsx      monta as cenas na linha do tempo
└── out/                    saída dos renders (git-ignored)
```

---

## Identidade visual

As telas usam **as mesmas cores e fontes do app** (navy `#051125`, dourado
`#A5652B`/`#F9BA77`, Playfair Display + Work Sans + JetBrains Mono), espelhadas
de `../tailwind.config.js` em `src/theme/tokens.js`. O logo reproduz a geometria
de `../public/brand/logo-mark.svg`. Assim o vídeo parece o produto, não um genérico.

---

## Vídeos

| Composição      | Formato      | Status                          |
|-----------------|--------------|---------------------------------|
| `DemoAd`        | 1080×1920    | ✅ Vídeo 1 — Demonstração Rápida |
| `DemoAdSquare`  | 1080×1080    | ✅ mesma peça, 1:1               |
| `ProblemSolutionAd` | —        | ⏳ Vídeo 2 (próxima etapa)       |
| `ProductShowcaseAd` | —        | ⏳ Vídeo 3 (próxima etapa)       |
