import { useQuery } from '@tanstack/react-query'
import { billingStatus } from '../api/billing'

// Freemium: não há mais paywall de bloqueio. O tier grátis usa o app livremente;
// o único limite (nº de produtos) é imposto pelo backend na criação (HTTP 402 →
// client.js leva a /assinatura). Mantido como prefetch do status p/ os banners.
export default function PaywallGate({ children }) {
  useQuery({
    queryKey: ['billing-status'],
    queryFn: () => billingStatus().then((r) => r.data),
    staleTime: 60_000,
  })
  return children
}
