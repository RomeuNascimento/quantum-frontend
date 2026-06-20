// Indicador das 4 etapas do fluxo — nós numerados com trilha lime.
const ETAPAS = ['Receita', 'Preços', 'Tempo', 'Preço']

export default function StepBar({ atual = 1 }) {
  return (
    <div className="flex items-center">
      {ETAPAS.map((label, i) => {
        const n = i + 1
        const feito = n < atual
        const ativo = n === atual
        return (
          <div key={label} className="flex items-center" style={{ flex: i < ETAPAS.length - 1 ? 1 : '0 0 auto' }}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-6 h-6 flex items-center justify-center font-mono text-[11px] font-bold border
                ${ativo ? 'bg-lime text-ink border-ink' : feito ? 'bg-ink text-lime border-ink' : 'bg-bone text-mute border-line'}`}>
                {feito ? '✓' : n}
              </div>
              <span className={`font-mono text-[8px] uppercase tracking-widest
                ${ativo ? 'text-ink font-bold' : 'text-mute'}`}>{label}</span>
            </div>
            {i < ETAPAS.length - 1 && (
              <div className={`flex-1 h-px mx-1 -mt-4 ${feito ? 'bg-ink' : 'bg-line'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
