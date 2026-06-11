import { useLocation, useNavigate } from 'react-router-dom'

// Volta para a página anterior real (Dashboard, lista, etc.).
// location.key === 'default' significa que a página foi aberta direto
// pela URL (sem histórico no app) — nesse caso usa a rota fallback.
export default function useVoltar(fallback) {
  const navigate = useNavigate()
  const location = useLocation()
  return () => {
    if (location.key !== 'default') navigate(-1)
    else navigate(fallback)
  }
}
