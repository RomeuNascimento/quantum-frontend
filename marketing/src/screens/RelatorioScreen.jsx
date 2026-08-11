import { AbsoluteFill } from 'remotion'
import { colors } from '../theme/tokens.js'
import { family } from '../theme/fonts.js'
import { StatusBarSpace, Eyebrow, TitleSerif, Num, MargemBadge, brl } from './ui.jsx'

/**
 * Tela de Relatório de Margem (src/pages/Relatorio) — resumo saudável/atenção/
 * revisar + margem real por produto/canal. Usada no Product Showcase para
 * comunicar "controle da margem por canal".
 */
const PRODUTOS = [
  { nome: 'Bolo de Cenoura', custo: 1.5, canais: [{ nome: 'Venda direta', preco: 5.0, margem: 70 }, { nome: 'iFood', preco: 3.9, margem: 34 }] },
  { nome: 'Brigadeiro gourmet', custo: 0.9, canais: [{ nome: 'Venda direta', preco: 2.5, margem: 64 }] },
  { nome: 'Torta de limão', custo: 3.1, canais: [{ nome: 'Encomenda', preco: 6.9, margem: 12 }] },
]

export function RelatorioScreen({ visibleCount = PRODUTOS.length }) {
  return (
    <AbsoluteFill style={{ background: colors.surface }}>
      <StatusBarSpace />
      <div style={{ padding: '10px 22px 0' }}>
        <Eyebrow>Análise</Eyebrow>
        <TitleSerif size={32} style={{ marginTop: 4 }}>
          Relatório de Margem
        </TitleSerif>

        {/* Resumo */}
        <div style={{ background: colors.card, border: `1px solid ${colors.outline}`, borderRadius: 16, padding: 18, marginTop: 18 }}>
          <div style={{ fontFamily: family.mono, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: colors.secondary }}>
            Margem média geral
          </div>
          <Num style={{ display: 'block', fontFamily: family.mono, fontWeight: 700, fontSize: 52, color: colors.primary, marginTop: 4 }}>
            56%
          </Num>
          <div style={{ display: 'flex', gap: 18, marginTop: 14 }}>
            {[
              ['1', 'Saudáveis', colors.positive],
              ['1', 'Atenção', colors.primary],
              ['1', 'Revisar', colors.danger],
            ].map(([n, l, c]) => (
              <div key={l} style={{ flex: 1 }}>
                <Num style={{ fontFamily: family.mono, fontWeight: 700, fontSize: 26, color: c }}>{n}</Num>
                <div style={{ fontFamily: family.mono, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: colors.secondary }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Produtos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          {PRODUTOS.slice(0, visibleCount).map((p) => (
            <div key={p.nome} style={{ background: colors.card, border: `1px solid ${colors.outline}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: family.serif, fontWeight: 700, fontSize: 19, color: colors.primary }}>{p.nome}</span>
                <Num style={{ fontSize: 13, color: colors.onSurfaceDim }}>Custo {brl(p.custo)}</Num>
              </div>
              {p.canais.map((c) => (
                <div key={c.nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <div>
                    <span style={{ fontFamily: family.sans, fontSize: 15, color: colors.onSurface }}>{c.nome}</span>
                    <Num style={{ fontSize: 13, color: colors.onSurfaceDim, marginLeft: 8 }}>{brl(c.preco)}</Num>
                  </div>
                  <MargemBadge margem={c.margem} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  )
}
