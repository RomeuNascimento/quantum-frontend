/**
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  CONFIGURAÇÃO CENTRAL DOS VÍDEOS — edite AQUI, não no meio do código. │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Tudo que você provavelmente vai querer trocar (textos, CTA, produto de
 * exemplo, durações, velocidade, formato) mora neste arquivo.
 *
 * Regras rápidas:
 *  • Durações são em SEGUNDOS (convertidas para frames automaticamente).
 *  • `speed` acelera/desacelera TODAS as animações (1 = normal, 1.2 = 20% + rápido).
 *  • Para 1:1, use a composição "DemoAdSquare" no Studio (mesmo conteúdo, 1080x1080).
 */

// ─────────────────────────────  FORMATO  ─────────────────────────────
export const FPS = 30

export const FORMATS = {
  vertical: { width: 1080, height: 1920 }, // 9:16 — Reels / TikTok / Stories (principal)
  square: { width: 1080, height: 1080 }, // 1:1 — Feed / Facebook Ads
}

// Velocidade global das animações (1 = normal). Suba para deixar mais "punchy".
export const SPEED = 1

// ─────────────────────────────  MARCA  ──────────────────────────────
export const BRAND = {
  name: 'Quantum',
  domain: 'quantumcalc.com.br',
  tagline: 'Gestão de confeitaria',
}

// ──────────────────  PRODUTO DE EXEMPLO (o que aparece no app)  ──────────────────
// Números realistas de uma confeiteira. Troque à vontade — o vídeo se adapta.
export const PRODUCT = {
  name: 'Bolo de Cenoura',
  category: 'Bolo caseiro',
  porcoes: 12,
  ingredients: [
    { name: 'Ovos', qty: '3 unid' },
    { name: 'Açúcar', qty: '2 xíc' },
    { name: 'Óleo', qty: '1 xíc' },
    { name: 'Cenoura', qty: '3 unid' },
    { name: 'Farinha de trigo', qty: '2 xíc' },
    { name: 'Chocolate', qty: '200 g' },
  ],
  // Números CONSISTENTES com a fórmula do app (preço = custoUnit / (1 − margem/100)).
  custoTotal: 18.0, // R$ para fazer a receita inteira
  // custoUnit = custoTotal / porções = 1,50 ; a margem-alvo do slider é 70% →
  // preço = 1,50 / 0,30 = 5,00 ; lucro = 5,00 − 1,50 = 3,50.
  margemInicial: 45, // onde o slider começa antes de "arrastar"
  margemAlvo: 70, // onde o slider para (margem escolhida)
}

// custoUnit derivado — não repita à mão para não sair da fórmula.
export const custoUnit = () => PRODUCT.custoTotal / PRODUCT.porcoes

// Fórmula real do app: taxas=0 na venda direta.
export const precoDe = (margem, taxas = 0) => custoUnit() / (1 - (margem + taxas) / 100)
export const lucroDe = (margem, taxas = 0) => precoDe(margem, taxas) - custoUnit()

// ─────────────────────────────  TEXTOS  ─────────────────────────────
export const COPY = {
  // Gancho (0–2s): pergunta que o app responde
  hook: {
    kicker: 'Confeiteira, responde rápido:',
    line: 'Quanto cobrar\npela sua receita?',
  },
  // Entrada da interface (2–5s)
  intro: {
    kicker: 'Quantum',
    headline: 'Você manda a receita.\nEu faço as contas.',
  },
  // Demonstração — legendas curtas que acompanham a ação
  demo: {
    upload: 'Manda a receita — foto, print ou texto',
    parsed: 'A IA lê e organiza tudo',
    slider: 'Escolhe a margem…',
    price: '…e o preço aparece na hora',
  },
  // Resultado / benefício (12–15s)
  result: {
    title: 'Preço certo.\nLucro na conta.',
    sub: 'Sem achismo, sem vender no prejuízo.',
  },
  // CTA final
  cta: {
    line: 'Experimente agora',
    sub: 'É grátis pra começar',
  },
}

// ───────────────────────  ROTEIRO / DURAÇÕES (segundos)  ───────────────────────
// A soma define a duração total do vídeo (alvo: 10–20s). Edite livremente.
export const TIMELINE = {
  hook: 2.4, // 0.0 – 2.4   gancho
  intro: 2.8, // 2.4 – 5.2   interface entra
  demoUpload: 2.6, // 5.2 – 7.8   manda a receita
  demoParsed: 2.4, // 7.8 – 10.2  IA organiza os ingredientes
  demoPrice: 3.4, // 10.2 – 13.6 slider + preço na hora  (a "money shot")
  result: 2.6, // 13.6 – 16.2 benefício
  cta: 2.4, // 16.2 – 18.6 chamada final
}
// Total ≈ 18,6 s  (dentro da faixa 10–20s pedida)

// ───────────────────────────  helpers  ───────────────────────────
export const sec = (s) => Math.round(s * FPS)
export const totalDurationInFrames = () => Object.values(TIMELINE).reduce((a, s) => a + sec(s), 0)
