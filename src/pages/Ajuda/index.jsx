import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import useAuthStore from '../../store/authStore'
import { SUPORTE_WHATSAPP, SUPORTE_EMAIL, whatsappFormatado } from '../../config/suporte'

const stroke = { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round' }

export default function Ajuda() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  // Mensagem já preenchida — a pessoa só toca e envia. Inclui nome/e-mail
  // pra gente saber de quem é o atendimento.
  const quem = [user?.nome, user?.email].filter(Boolean).join(' · ')
  const saudacao = user?.nome ? `Oi! Aqui é ${user.nome.split(' ')[0]}. ` : 'Oi! '
  const msg = `${saudacao}Preciso de ajuda com o Quantum.` + (quem ? `\n\n(${quem})` : '')

  const abrirWhatsapp = () => {
    const url = `https://wa.me/${SUPORTE_WHATSAPP}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener')
  }

  const abrirEmail = () => {
    const assunto = encodeURIComponent('Preciso de ajuda com o Quantum')
    const corpo = encodeURIComponent(msg)
    window.location.href = `mailto:${SUPORTE_EMAIL}?subject=${assunto}&body=${corpo}`
  }

  return (
    <Layout title="Ajuda" onBack={() => navigate('/dashboard')}>
      <div className="px-4 pt-4 pb-8 space-y-6">

        {/* Cabeçalho amigável */}
        <div className="text-center pt-2">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 text-primary mb-3">
            <svg className="w-8 h-8" {...stroke}>
              <path d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656M12 8a4 4 0 100 8" />
            </svg>
          </span>
          <h2 className="text-2xl title-serif">Precisa de ajuda?</h2>
          <p className="text-sm text-on-surface-dim mt-1">
            Fala com a gente. Uma pessoa de verdade vai te responder e resolver com você.
          </p>
        </div>

        {/* WhatsApp — caminho principal */}
        <button
          type="button"
          onClick={abrirWhatsapp}
          className="w-full flex items-center gap-4 bg-positive text-white rounded-2xl px-5 py-4 active:opacity-90 transition-opacity text-left"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-white/15">
            <svg className="w-6 h-6" {...stroke}>
              <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-semibold">Falar no WhatsApp</span>
            <span className="block text-sm text-white/80">Mais rápido — resposta na hora</span>
          </span>
          <svg className="w-5 h-5 text-white/70 flex-shrink-0" {...stroke}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* E-mail — alternativa */}
        <button
          type="button"
          onClick={abrirEmail}
          className="w-full flex items-center gap-4 card active:bg-surface-1 text-left"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-surface-2 text-primary">
            <svg className="w-6 h-6" {...stroke}>
              <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-semibold text-on-surface">Mandar um e-mail</span>
            <span className="block text-sm text-on-surface-dim break-all">{SUPORTE_EMAIL}</span>
          </span>
          <svg className="w-5 h-5 text-on-surface-dim flex-shrink-0" {...stroke}><path d="M9 5l7 7-7 7" /></svg>
        </button>

        {/* Horário / expectativa — sem prometer o que não dá pra cumprir */}
        <p className="text-xs text-on-surface-dim text-center px-4">
          Atendimento de segunda a sexta. Se não responder na hora, a gente retorna assim que possível.
        </p>

        {/* Número visível pra quem preferir salvar o contato */}
        <div className="text-center">
          <p className="label mb-1">WhatsApp do suporte</p>
          <p className="qtm-num text-on-surface">{whatsappFormatado()}</p>
        </div>
      </div>
    </Layout>
  )
}
