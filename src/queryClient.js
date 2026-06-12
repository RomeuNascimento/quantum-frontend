import { QueryClient } from '@tanstack/react-query'

// Exportado como módulo para que o authStore possa limpar o cache no
// logout (privacidade em aparelho compartilhado) sem depender do React.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})
