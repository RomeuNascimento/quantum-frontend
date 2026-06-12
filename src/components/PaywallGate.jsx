import { Navigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { billingStatus } from '../api/billing'

const ROTAS_LIVRES = ['/assinatura', '/dashboard']

export default function PaywallGate({ children }) {
  const { pathname } = useLocation()

  const { data } = useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then((r) => r.data),
    staleTime: 60_000,
  })

  if (!data || ROTAS_LIVRES.includes(pathname)) return children

  if (data.status === 'vencida') return <Navigate to="/assinatura" replace />

  return children
}
