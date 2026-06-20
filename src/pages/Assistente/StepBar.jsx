// Barra de progresso das 4 etapas do assistente.
const ETAPAS = ['Receita', 'Preços', 'Tempo', 'Preço']

export default function StepBar({ atual = 1 }) {
  return (
    <div className="px-4 pt-3">
      <div className="flex items-center gap-1">
        {ETAPAS.map((label, i) => {
          const n = i + 1
          const feito = n < atual
          const ativo = n === atual
          return (
            <div key={label} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-1 bg-line overflow-hidden">
                <div className={`h-full ${feito || ativo ? 'bg-lime' : 'bg-line'}`} />
              </div>
              <span className={`font-mono text-[9px] uppercase tracking-widest ${
                ativo ? 'text-ink font-bold' : feito ? 'text-mute' : 'text-mute/50'
              }`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
