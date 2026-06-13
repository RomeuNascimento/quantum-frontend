import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '../queryClient'
import { logout as apiLogout } from '../api/auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: () => !!get().token,

      setToken: (token) => {
        localStorage.setItem('quantum_token', token)
        set({ token })
      },

      setUser: (user) => set({ user }),

      logout: () => {
        const token = localStorage.getItem('quantum_token') || get().token
        localStorage.removeItem('quantum_token')
        set({ token: null, user: null })
        // Revoga o token no servidor (denylist por jti) para que um token
        // copiado não continue válido até expirar. Best-effort e fire-and-forget:
        // o estado local já foi limpo, então um eventual 401 desta chamada não
        // re-dispara logout (o interceptor checa token, agora null) — sem recursão.
        if (token) {
          apiLogout(token).catch(() => {})
        }
        // O runtimeCaching do SW guarda respostas autenticadas da API por
        // 7 dias — sem isso, dados ficam legíveis após logout em aparelho
        // compartilhado. Fire-and-forget: logout deve permanecer síncrono.
        if (typeof caches !== 'undefined') {
          caches.delete('api-cache').catch(() => {})
        }
        // Cache em memória do TanStack Query — mesmo motivo (privacidade)
        queryClient.clear()
      },
    }),
    {
      name: 'quantum-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
)

export default useAuthStore
